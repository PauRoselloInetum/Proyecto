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
using System.Text.Json;
using System.Text.Json.Nodes;

namespace HireAProBackend.Controllers
{
    [Route("api/")]
    [ApiController]
    public class Controlador : ControllerBase
    {
        private FirestoreDb _firestoreDb;
        public IConfiguration _configuracion;
        public Models.Path _path;

        public Controlador(IConfiguration configuracion)
        {
            _path = new Models.Path();
            string path = _path.path; // Ruta del archivo de credenciales
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", path);
            _firestoreDb = FirestoreDb.Create("hire-a-pro-database");
            _configuracion = configuracion;
        }
        [HttpGet("usuarios")] //Función de prueba para comprobar que están todos los usuarios en la base de datos
        public async Task<ActionResult<List<Usuario>>> GetUsuarios()
        {
            var usuarios = new List<Usuario>();
            Query consulta = _firestoreDb.Collection("users");
            QuerySnapshot snapshot = await consulta.GetSnapshotAsync();

            foreach (var document in snapshot.Documents) {
                if (document.Exists) {
                    var usuario = document.ConvertTo<Usuario>();
                    usuarios.Add(usuario); }
            }
            return usuarios;
        }



        [HttpPost("login")]
        public async Task<ActionResult<Usuario>> Login([FromBody] Models.LoginRequest loginRequest)
        {
          
            //Convertir lo datos obtenidos desde el front-end en string
            string correo = loginRequest.Email;
            string password = ComputeSha256Hash(loginRequest.Password);

            //Comprueba si el email y la contraseña contenidos en loginRequest (que sería enviado desde Angular, existen en la base de datos
            Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", correo).WhereEqualTo("password", password);

            //Realiza la consulta a la base de datos y la almacena en respuestaDb
            QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();

            //Si no existen documentos, es decir, si no está el usuario en la base de datos, le indica un error al Angular
            if (respuestaDb.Documents.Count == 0)
            {
                return Unauthorized("Email o contraseña incorrectos");
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
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
            var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var newToken = new JwtSecurityToken(
                    jwt.Issuer,
                    jwt.Audience,
                    claims,
                    expires: DateTime.Now.AddDays(10),
                    signingCredentials: signIn

                );
            //Retorna el token en formato de cadena de texto
            return Ok(new JwtSecurityTokenHandler().WriteToken(newToken));
        }
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] Models.RegisterRequest registerRequest)
        {
            //Consigue las credenciales de registerRequest
            string correo = registerRequest.Email;
            // string password = registerRequest.Password;

            string hashedPassword = ComputeSha256Hash(registerRequest.Password);

            //Busca si existe el documento con los datos proporcionados en la request
            // Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", correo).WhereEqualTo("contra", password);
            Query consultaCorreo = _firestoreDb.Collection("users").WhereEqualTo("email", correo);

            //Realiza la consulta a la base de datos y la almacena en respuestaDb
           // QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();
            QuerySnapshot respuestaCorreo = await consultaCorreo.GetSnapshotAsync();


            //Si el documento no existe, es decir, el usuario no esta registrado en la base de datos, crea el nuevo documento con sus datos
            if (respuestaCorreo.Documents.Count == 0)
            {
                //Obtiene la referencia de la colección y genera una nueva referencia con los datos del nuevo usuario
                CollectionReference referencia = _firestoreDb.Collection("users");
                DocumentReference nuevoUserRef = await referencia.AddAsync(new
                {
                    email = registerRequest.Email,
                    password = hashedPassword, // lo que se enviará será la contraseña hasheada anteriormente
                });

                return Ok("Usuario registrado");
            }
            return Unauthorized("Ya existe un usuario con este correo");
            }

        // Función para generar el hash SHA-256 dentro del mismo controlador
        private string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));

                StringBuilder builder = new StringBuilder();
                foreach (byte b in bytes)
                {
                    builder.Append(b.ToString("x2")); // Convertir a hexadecimal
                }
                return builder.ToString();
            }
        }
        private string ComputeHMACSha256Hash(string data, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            using (var hmacsha256 = new HMACSHA256(keyBytes))
            {
                var dataBytes = Encoding.UTF8.GetBytes(data);
                var hashBytes = hmacsha256.ComputeHash(dataBytes);
                return Convert.ToBase64String(hashBytes).Replace('+', '-').Replace('/', '_').TrimEnd('='); // Convertir a Base64Url
            }
        }

        [HttpPost("home")] //Comprueba si la firma es correcta pero ha de validar la fecha
        public async Task<ActionResult> ValidateToken([FromBody] Models.AuthenticateRequest authenticateRequest)
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

            try
            {
                //Decodificar el encabezado y el payload
                var jsonBytesHeader = Convert.FromBase64String(base64Header);
                var jsonBytesPayload = Convert.FromBase64String(base64Payload);
                string headerJson = Encoding.UTF8.GetString(jsonBytesHeader); //Creo que esta parte es innecesaria
                string payloadJson = Encoding.UTF8.GetString(jsonBytesPayload);

                //Recuperar la clave secreta desde la configuración
                var jwt = _configuracion.GetSection("Jwt").Get<Jwt>();
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));

                //Generar la firma esperada
                string expectedSignature = ComputeHMACSha256Hash($"{header}.{payload}", jwt.Key);

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
                QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();

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
            catch (Exception ex)
            {
                return Unauthorized($"Error al validar el token: {ex.Message} " + ex);
            }
        }

        //Correo recuperación, que envíe una url a la página de regenerar contraseña y tenga una caducidad
        [HttpPost("forgotPassword")]
        public async Task<ActionResult> ForgottenPassword([FromBody] Models.PasswordRequest passwordRequest)
        {
            string email = passwordRequest.Email;
            //Comprueba la existencia del usuario en la base de datos para posteriormente enviarle un correo
            Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", email);
            QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();

            if (respuestaDb.Documents.Count == 0)
            {
                return NotFound("Este usuario no existe en la base de datos");
            }
            return Ok("Revisa tu correo");
        }
        //Paso intermedio

        [HttpPost("changeRequest")]
        public async Task<ActionResult> ChangePassword([FromBody] Models.ChangeRequest changeRequest)
        {
            string email = changeRequest.Email;
            string newPass = ComputeSha256Hash(changeRequest.Password);

            Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", email);
            QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();

          if (respuestaDb.Documents.Count == 0)
                {
                    return NotFound("Este usuario no existe en la base de datos");
                }

            DocumentReference docRef = respuestaDb.Documents[0].Reference;

            await docRef.UpdateAsync(new Dictionary<string, object>
            {
                {"password",newPass}
            });
            return Ok("Contraseña actualizada");
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
