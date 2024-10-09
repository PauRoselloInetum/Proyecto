using Google.Cloud.Firestore;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using HireAProBackend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.OpenApi.Models;
using System.IO;
using static Google.Rpc.Context.AttributeContext.Types;
using HireAProBackend.Services;
using HireAProBackend.Templates;
using System.Threading;
using System.Linq.Expressions;
using static Google.Rpc.Help.Types;
using Newtonsoft.Json.Linq;
using System.Runtime.ConstrainedExecution;
using Google.Protobuf.WellKnownTypes;


namespace HireAProBackend.Controllers
{
    [Route("api/")]
    [ApiController]
    public class Controlador : ControllerBase
    {
        private readonly FirestoreDb _firestoreDb;
        public IConfiguration _configuracion;
        private readonly IEmailService _emailService;
        private readonly IHmacShaHash _hmacShaHash;
        private readonly IShaHash _shaHash;
        private readonly IGenTokenReset _genTokenReset;
        private readonly ISaveToken _saveToken;

        public Controlador(FirestoreDb firestoreDb, IConfiguration configuracion, IEmailService emailService, IHmacShaHash hmacShaHash, IShaHash shaHash, IGenTokenReset genTokenReset, ISaveToken saveToken)
        {
            _firestoreDb = firestoreDb;
            _configuracion = configuracion;
            _emailService = emailService;
            _hmacShaHash = hmacShaHash;
            _shaHash = shaHash;
            _genTokenReset = genTokenReset;
            _saveToken = saveToken;
        }
        [HttpGet("usuarios")] //Función de prueba para comprobar que están todos los usuarios en la base de datos
        public async Task<ActionResult<List<Usuario>>> GetUsuarios()
        {
            var usuarios = new List<Usuario>();
            Query consulta = _firestoreDb.Collection("users");
            QuerySnapshot snapshot = await consulta.GetSnapshotAsync();

            foreach (var document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    var cancellationTokenSource = new CancellationTokenSource();
                    Usuario usuario = document.ConvertTo<Usuario>();
                    usuarios.Add(usuario);
                }
            }
            return usuarios;
        }



        [HttpPost("login")]
        public async Task<ActionResult<Usuario>> Login([FromBody] Models.LoginRequest loginRequest) //Timeout aplciado
        {

            //Convertir lo datos obtenidos desde el front-end en string
            string correo = loginRequest.Email;
            string password = _shaHash.ComputeSha256Hash(loginRequest.Password);


            //Variables del timeout
            int timeout = 1000000000;
            var cancellationTokenSource = new CancellationTokenSource();
            try
            {

                //Comprueba si el email y la contraseña contenidos en loginRequest (que sería enviado desde Angular, existen en la base de datos
                Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", correo).WhereEqualTo("password", password);

                var queryTask = consulta.GetSnapshotAsync(cancellationTokenSource.Token);


                if (await Task.WhenAny(queryTask, Task.Delay(timeout)) == queryTask)
                {
                    QuerySnapshot respuestaDb = await queryTask;
                    //Si no se encuentra el correo, se buscará por username
                    if (respuestaDb.Documents.Count == 0)
                    {
                        // pese a llamrse username el campo por el que se busca, está buscando ahora por nombre de usuario, porque llegaod
                        // aqui, no se ha hallado por correo
                        Query consultaUser = _firestoreDb.Collection("users").WhereEqualTo("username", correo).WhereEqualTo("password", password);
                        queryTask = consultaUser.GetSnapshotAsync(cancellationTokenSource.Token);

                        respuestaDb = await queryTask;

                        if (respuestaDb.Documents.Count == 0)
                        {
                            return Unauthorized("Error en el login");
                        }
                    }

                    //Si está correcto, devuelve 200 OK y el token JWT generado a partir de los datos del usuario, el cual se almacenará en el pc del usuario
                    Usuario usuario = respuestaDb.Documents[0].ConvertTo<Usuario>();
                    //Obtiene los datos desde appsettings.json
                    var jwt = _configuracion.GetSection("Jwt").Get<Jwt>();

                    var claims = new[]
                    {
                        new Claim(JwtRegisteredClaimNames.Sub, jwt.Subject),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString()),
                        new Claim("email", usuario.Email),
                        new Claim("password", usuario.Password)

                    };
                    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.LoginKey));
                    var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                    var newToken = new JwtSecurityToken(
                            jwt.Issuer,
                            jwt.Audience,
                            claims,
                            expires: DateTime.Now.AddDays(10),
                            signingCredentials: signIn

                        );

                    if (usuario.Verified == false)
                    {
                     return StatusCode(403, "Tu cuenta no ha sido verificada");
                    }

                    //Retorna el token en formato de cadena de texto
                    return Ok("Bienvenido, " + usuario.Username + "\n" + new JwtSecurityTokenHandler().WriteToken(newToken));

                }
                else
                {
                    cancellationTokenSource.Cancel();
                    return StatusCode(408, "La consulta ha tardado demasiado.");
                }
            }
            catch (TimeoutException)
            {
                return StatusCode(408, "La operación fue cancelada");
            }
            finally
            {
                cancellationTokenSource.Dispose();

            }

        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] Models.RegisterRequest registerRequest) //Timeout aplicado
        {
            EmailDTO welEmail = new EmailDTO();
            EmailContent emailContent = new EmailContent();
            string email = registerRequest.Email;
            string username = registerRequest.Username;
            string type = registerRequest.Type;

            welEmail.To = email;
            welEmail.Subject = emailContent.WelcomeSubject;
            string body = emailContent.WelBody(username);
            welEmail.Body = body;

            string hashedPassword = _shaHash.ComputeSha256Hash(registerRequest.Password);

            int timeout = 100000;
            var cancellationTokenSource = new CancellationTokenSource();

            try
            {
                //Busca si existe el documento con los datos proporcionados en la request
                // Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", correo).WhereEqualTo("contra", password);
                Query consultaCorreo = _firestoreDb.Collection("users").WhereEqualTo("email", email);

                // Busca si ya hay un usuario en la base de datos con es mismo usuario para que no se repita
                Query consultaUser = _firestoreDb.Collection("users").WhereEqualTo("username", username);

                //Realiza la consulta a la base de datos y la almacena en respuestaDb
                // QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();

                var queryTask = consultaCorreo.GetSnapshotAsync(cancellationTokenSource.Token);
                var queryUser = consultaUser.GetSnapshotAsync(cancellationTokenSource.Token);

                if (await Task.WhenAny(queryTask, Task.Delay(timeout)) == queryTask && await Task.WhenAny(queryUser, Task.Delay(timeout)) == queryUser)
                {
                    QuerySnapshot respuestaCorreo = await queryTask;
                    QuerySnapshot respuestaUsuario= await queryUser;

                    //Si el documento no existe, es decir, el usuario no esta registrado en la base de datos, crea el nuevo documento con sus datos
                    if (respuestaCorreo.Documents.Count == 0 && respuestaUsuario.Documents.Count == 0)
                    {
                        //Enviar correo de verificación
                        EmailDTO verifyEmail = new EmailDTO();
                        EmailContent verifyContent = new EmailContent();

                        verifyEmail.To = email;
                        verifyEmail.Subject = emailContent.VerifySubject;

                        string verifyToken = _shaHash.ComputeSha256Hash(_genTokenReset.generarTokenRecuperacion(email));

                        string link = "http://localhost:4200/login/verify?t=" + verifyToken;
                        await _saveToken.GuardarTokenAsync(verifyToken, email);

                        string verifyBody = emailContent.VerBody(username, link);//Generar el link
                        verifyEmail.Body = verifyBody;

                        //Obtiene la referencia de la colección y genera una nueva referencia con los datos del nuevo usuario
                        CollectionReference referencia = _firestoreDb.Collection("users");
                        DocumentReference nuevoUserRef = await referencia.AddAsync(new
                        {
                            username = registerRequest.Username,
                            email = registerRequest.Email,
                            password = hashedPassword, // lo que se enviará será la contraseña hasheada anteriormente
                            verified = false,
                            createdAt = DateTime.UtcNow,
                            type = registerRequest.Type
                        });

                        _emailService.SendEmail(verifyEmail);
                        _emailService.SendEmail(welEmail);
                        return Ok("Usuario registrado");
                    }
                    return Unauthorized("Ya existe un usuario con este correo o usuario");
                }
                else
                {
                    cancellationTokenSource.Cancel();
                    return StatusCode(408, "La consulta ha tardado demasiado");

                }
            }
            catch (TaskCanceledException)
            {
                return StatusCode(408, "La operación fue cancelada, ha tardado demasiado");
            }
            finally
            {
                cancellationTokenSource.Dispose();
            }

        }

        [HttpPost("verifyAccount")]
        public async Task<ActionResult> VerifyAccount([FromBody] AuthenticateRequest verifyRequest)
        {
            //verificar token. se crea un buffer para tener la instancia a mano y despues sobreescribirla
            TokenPassReset tokenBuffer = new TokenPassReset();

            string token = verifyRequest.Token;

            int timeout = 10000;
            var cancellationTokenSource = new CancellationTokenSource();

            try
            {
                // Ejecutar consulta para buscar el token
                Query consulta = _firestoreDb.Collection("tokens").WhereEqualTo("token", token);

                var queryTask = consulta.GetSnapshotAsync(cancellationTokenSource.Token);

                if (await Task.WhenAny(queryTask, Task.Delay(timeout)) == queryTask)
                {
                    QuerySnapshot tokenEncontrado = await queryTask;


                    foreach (DocumentSnapshot document in tokenEncontrado.Documents)
                    {
                        if (document.Exists)
                        {
                            // Extraemos el email asociado al token
                            string email = document.GetValue<string>("email");
                            string tokenValue = document.GetValue<string>("token");
                            // Asignamos los valores al tokenBuffer
                            tokenBuffer = new TokenPassReset
                            {
                                email = email,
                                token = tokenValue,

                            };
                        }
                        else
                        {
                            return Unauthorized("Token inexistente");
                        }
                    }

                    // buscar al usuario con el email asociado al token
                    Query consultaUsuario = _firestoreDb.Collection("users").WhereEqualTo("email", tokenBuffer.email);
                    QuerySnapshot usuarioEncontrado = await consultaUsuario.GetSnapshotAsync();

                    if (!usuarioEncontrado.Documents.Any())
                    {
                        return NotFound("Usuario no encontrado");
                    }

                    // actualizar la verificación del usuario
                    foreach (DocumentSnapshot document in usuarioEncontrado.Documents)
                    {
                        DocumentReference usuarioRef = document.Reference;

                        // se actualiza la contraseña, pasándola por hash previamente
                        await usuarioRef.UpdateAsync(new Dictionary<string, object>
                {
                    { "verified", true }
                });
                    }

                    foreach (var document in tokenEncontrado.Documents)
                    {
                        await _firestoreDb.Collection("tokens").Document(document.Id).DeleteAsync();
                    }

                    return Ok("Tu cuenta ha sido verificada");
                }

                else
                {
                    cancellationTokenSource.Cancel();
                    return StatusCode(408, "La consulta ha tardado demasiado");

                }
            }

            catch (TaskCanceledException)
            {
                return StatusCode(408, "La operación fue cancelada, ha tardado demasiado");
            }
            finally
            {
                cancellationTokenSource.Dispose();
            }


        }

        // Método para añadir la información extra del usuario una vez registrado, o para actualizar la información más tarde
        [HttpPost("completeProfile")]
        public async Task<ActionResult> AddData([FromBody] Models.CompleteProfileRequest completeProfileRequest) //Timeout aplicado
        {
            string email = completeProfileRequest.Email;
            string fullName = completeProfileRequest.FullName;
            string gender = completeProfileRequest.Gender;
            DateTime birthDate = completeProfileRequest.BirthDate.Date;
            string city = completeProfileRequest.City;

            int timeout = 1000000;
            var cancellationTokenSource = new CancellationTokenSource();

            try
            {
                // Busca si existe el usuario por correo electrónico
                Query consultaCorreo = _firestoreDb.Collection("users").WhereEqualTo("email", email);
                var queryTask = consultaCorreo.GetSnapshotAsync(cancellationTokenSource.Token);

                if (await Task.WhenAny(queryTask, Task.Delay(timeout)) == queryTask)
                {
                    QuerySnapshot respuestaCorreo = await queryTask;

                    if (respuestaCorreo.Documents.Count > 0)
                    {
                        // Si el usuario existe, actualiza la información personal
                        DocumentSnapshot documentoUsuario = respuestaCorreo.Documents[0];
                        DocumentReference usuarioRef = documentoUsuario.Reference;

                        Dictionary<string, object> userData = new Dictionary<string, object>
                        {
                            { "fullName", fullName },
                            { "gender", gender },
                            { "birthDate", birthDate },
                            { "city", city },
                        };

                        await usuarioRef.UpdateAsync(userData);

                        return Ok("Información personal actualizada correctamente.");

                    }
                    else
                    {
                        return NotFound("No se encontró un usuario con ese correo.");
                    }
                }
                else
                {
                    cancellationTokenSource.Cancel();
                    return StatusCode(408, "La consulta ha tardado demasiado.");
                }
            }
            catch (TaskCanceledException)
            {
                return StatusCode(408, "La operación fue cancelada, ha tardado demasiado.");
            }
            finally
            {
                cancellationTokenSource.Dispose();
            }
        }
      

        [HttpPost("home")] //Comprueba si la firma es correcta pero ha de validar la fecha
        public async Task<ActionResult> ValidateToken([FromBody] Models.AuthenticateRequest authenticateRequest) //Timeout aplicado
        {
            //Obtiene el token en formato de string, desde el frontend
            string token = authenticateRequest.Token;

            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token no proporcionado");
            }
            //Cada token tiene 3 partes: header, payload y signature
            var parts = token.Split('.');
            if (parts.Length != 3)
            {
                return Unauthorized("Token incorrecto");
            }

            //Extraer el encabezado, el payload y la firma
            var header = parts[0];
            var payload = parts[1];
            var signature = parts[2];

            //Convertir Base64Url a Base64 estándar para decodificación
            string base64Header = header.Replace('-', '+').Replace('_', '/');
            string base64Payload = payload.Replace('-', '+').Replace('_', '/');

            //Añadir relleno si es necesario
            base64Header = base64Header.PadRight(base64Header.Length + ((4 - base64Header.Length % 4) % 4), '=');
            base64Payload = base64Payload.PadRight(base64Payload.Length + ((4 - base64Payload.Length % 4) % 4), '=');

            //Variables del timeout
            int timeout = 10000;
            var cancellationTokenSource = new CancellationTokenSource();
            try
            {
                //Decodificar el encabezado y el payload
                var jsonBytesHeader = Convert.FromBase64String(base64Header);
                var jsonBytesPayload = Convert.FromBase64String(base64Payload);
                string headerJson = Encoding.UTF8.GetString(jsonBytesHeader); //Creo que esta parte es innecesaria
                string payloadJson = Encoding.UTF8.GetString(jsonBytesPayload);

                //Recuperar la clave secreta desde la configuración
                var jwt = _configuracion.GetSection("Jwt").Get<Jwt>();
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.LoginKey));

                //Generar la firma esperada
                string expectedSignature = _hmacShaHash.ComputeHMACSha256Hash($"{header}.{payload}", jwt.LoginKey);

                //Inicializar las variables para poder utilizarlas después, al validar el 
                string email = "";
                string password = "";
                long exp = 0;

                using (JsonDocument doc = JsonDocument.Parse(payloadJson))
                {
                    //Extrae el elemento raíz para poder extraer el texto que hay en email, contra y exp
                    JsonElement root = doc.RootElement;
                    email = root.GetProperty("email").GetString();
                    password = root.GetProperty("password").GetString();
                    exp = root.GetProperty("exp").GetInt64();

                }

                //Una vez que las variables contienen el texto del token, se realiza la consulta a la base de datos
                Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", email).WhereEqualTo("password", password);

                //Consulta con timeout
                var queryTask = consulta.GetSnapshotAsync(cancellationTokenSource.Token);
                if (await Task.WhenAny(queryTask, Task.Delay(timeout)) == queryTask)
                {
                    QuerySnapshot respuestaDb = await queryTask;
                    //La fecha de expiración se encuentra en timestamp, por lo que se pasa a un objeto de tipo DateTime
                    DateTime expirationDate = DateTimeOffset.FromUnixTimeSeconds(exp).DateTime;
                    DateTime currentDate = DateTime.UtcNow;

                    // Comparar la firma esperada con la firma del token
                    if (expectedSignature != signature || currentDate > expirationDate || respuestaDb.Documents.Count == 0) //Añadir fecha de expiración
                    {
                        return Unauthorized("Token no válido");
                    }
                    else
                    {
                        return Ok(email);
                    }
                }
                else
                {
                    cancellationTokenSource.Cancel();
                    return StatusCode(408, "La consulta ha tardado demasiado");
                }

            }
            catch (TaskCanceledException)
            {
                return StatusCode(408, "La operación fue cancelada");
            }
            catch (Exception ex)
            {
                return Unauthorized($"Error al validar el token: {ex.Message} " + ex);
            }
            finally
            {
                cancellationTokenSource.Dispose();
            }
        }

        //Usuario envía su correo y se genera un link con el token, que se envía por correo electrónico
        [HttpPost("forgotPassword")]
        public async Task<ActionResult> ForgottenPassword([FromBody] Models.ForgotPassRequest passwordRequest)
        {
            EmailDTO emailRequest = new EmailDTO();
            EmailContent emailContent = new EmailContent();
            string email = passwordRequest.Email;

            emailRequest.To = email;
            emailRequest.Subject = emailContent.ChangePassSubject;

            //Variables del timeout
            int timeout = 100000000;
            var cancellationTokenSource = new CancellationTokenSource();
            try
            {
                // Comprueba la existencia del usuario en la base de 
                Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", email);
                //Consulta con timeout
                var queryTask = consulta.GetSnapshotAsync(cancellationTokenSource.Token);
                if (await Task.WhenAny(queryTask, Task.Delay(timeout)) == queryTask)
                {
                    QuerySnapshot respuestaDb = await queryTask;

                    if (respuestaDb.Documents.Count == 0)
                    {
                        return NotFound("Este usuario no existe en la base de datos");
                    }


                    Usuario usuario = respuestaDb.Documents[0].ConvertTo<Usuario>(); // instanciar Usuario para poder sacarle así la contraseña

                    // esto es: hash(mail + contra + "clave supersecreta")
                    string tokenRecuperacion = _shaHash.ComputeSha256Hash(_genTokenReset.generarTokenRecuperacion(email));

                    // TODO configurar el endpoint o una variable que alojará el valor de tokenRecupoeracion como query por Get
                    string link = "http://localhost:4200/login/forgot-password?t=" + tokenRecuperacion;
                    await _saveToken.GuardarTokenAsync(tokenRecuperacion, email); // envia el token a la base de datos en la coleccion "tokens"
                    string body = emailContent.PassBody(usuario.Username, link);

                    emailRequest.Body = body;

                    _emailService.SendEmail(emailRequest);
                    return Ok("revisa tu correo");
                }
                else
                {
                    cancellationTokenSource.Cancel();
                    return StatusCode(408, "La consulta ha tardado demasiado");
                }
            }
            catch (TaskCanceledException)
            {
                return StatusCode(408, "La operación fue cancelada");
            }
            catch (Exception ex)
            {
                return StatusCode(503, $"Error al realizar la operación: {ex.Message} " + ex);
            }
            finally
            {
                cancellationTokenSource.Dispose();
            }
        }




        /** Buscará a usuarios mediante tokens de recuperacion
       */
        [HttpPost("changePass")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePassRequest changePassRequest)
        {
            //verificar token. se crea un buffer para tener la instancia a mano y despues sobreescribirla
            TokenPassReset tokenBuffer = new TokenPassReset();

            string token = changePassRequest.Token;
            string nuevaPassword = changePassRequest.Password;

            // Ejecutar consulta para buscar el token
            Query consulta = _firestoreDb.Collection("tokens").WhereEqualTo("token", token);
            QuerySnapshot tokenEncontrado = await consulta.GetSnapshotAsync();
            DateTime fechaCaducidad = new DateTime();

            foreach (DocumentSnapshot document in tokenEncontrado.Documents)
            {
                if (document.Exists)
                {
                    // Extraemos el email asociado al token
                    string email = document.GetValue<string>("email");
                    string tokenValue = document.GetValue<string>("token");
                    fechaCaducidad = document.GetValue<DateTime>("caducidad");

                    // Asignamos los valores al tokenBuffer
                    tokenBuffer = new TokenPassReset
                    {
                        email = email,
                        token = tokenValue
                    };
                }
                else
                {
                    return Unauthorized("Token inexistente");
                }
            }

            // buscar al usuario con el email asociado al token
            Query consultaUsuario = _firestoreDb.Collection("users").WhereEqualTo("email", tokenBuffer.email);
            QuerySnapshot usuarioEncontrado = await consultaUsuario.GetSnapshotAsync();

            if (!usuarioEncontrado.Documents.Any())
            {
                return NotFound("Usuario no encontrado");
            }

            // ver si el token no ha caducado
            if (fechaCaducidad < DateTime.UtcNow)
            {

                // eliminar el token después de cambiar la contraseña
                foreach (DocumentSnapshot document in tokenEncontrado.Documents)
                {
                    DocumentReference tokenRef = document.Reference;
                    await tokenRef.DeleteAsync();  // Eliminamos el token una vez usado
                }
                return Unauthorized("La clave de recuperación usada ha caducado");


            }

            // actualizar la contraseña del usuario
            foreach (DocumentSnapshot document in usuarioEncontrado.Documents)
            {
                DocumentReference usuarioRef = document.Reference;

                // se actualiza la contraseña, pasándola por hash previamente
                await usuarioRef.UpdateAsync(new Dictionary<string, object>
        {
            { "password", _shaHash.ComputeSha256Hash(nuevaPassword) }
        });
            }

            // eliminar el token después de cambiar la contraseña
            foreach (DocumentSnapshot document in tokenEncontrado.Documents)
            {
                DocumentReference tokenRef = document.Reference;
                await tokenRef.DeleteAsync();  // Eliminamos el token una vez usado
            }

            return Ok("Contraseña cambiada exitosamente");
        }



        [HttpDelete("eliminarUsuario")]
        public async Task<ActionResult> DeleteUser([FromBody] Models.DeleteRequest deleteRequest)
        {
            //Consigue las credenciales de registerRequest
            string correo = deleteRequest.Email;

            //Busca si existe el documento con los datos proporcionados en la request
            Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", correo);
            QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();


            if (respuestaDb.Documents.Count == 0)
            {
                return NotFound("No se encontró el usuario con el correo y la contraseña proporcionados.");
            }

            // Elimina cada documento que coincida con la consulta
            foreach (var document in respuestaDb.Documents)
            {
                await _firestoreDb.Collection("users").Document(document.Id).DeleteAsync();
            }
            return Ok("Usuario eliminado.");
        }

    }
}
