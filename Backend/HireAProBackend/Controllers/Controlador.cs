using Google.Cloud.Firestore;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration.UserSecrets;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Prueba_definitivo.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Prueba_definitivo.Controllers
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
            Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", correo).WhereEqualTo("contra", password);

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
                new Claim("contra", usuario.Contra)

            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
            var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var newToken = new JwtSecurityToken(
                    jwt.Issuer,
                    jwt.Audience,
                    claims,
                    expires: DateTime.Now.AddSeconds(10),
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
                    contra = hashedPassword, // lo que se enviará será la contraseña hasheada anteriormente
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

        /*[HttpPost("home")] //Hay que comprobar la firma y el header
        public async Task<ActionResult> ValidateToken([FromBody] Models.AuthenticateRequest authenticateRequest)
        {
            //Conseguir el token desde la request
            string token = authenticateRequest.Token;
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token no proporcionado");
            }
            //Divide el token en 3, todos los JWT tienen 3 partes: headers, payload y firma
            //Guarda en un array las distintas partes
            var parts = token.Split('.');
            if (parts.Length != 3)
                return Unauthorized("Token incorrecto");

           

            //El payload está codificado en Base64Url
            var payload = parts[1]
                .Replace('-', '+')
                .Replace('_', '/');
            var header = parts[0];

            
            var signature = parts[2];

            // Añadir relleno si es necesario
            switch (payload.Length % 4)
            {
                case 2:
                    payload += "==";
                    break;
                case 3:
                    payload += "=";
                    break;
            }
            switch (header.Length % 4)
            {
                case 2:
                    header += "==";
                    break;
                case 3:
                    header += "=";
                    break;
            }


            try
            {
                //Convertir el texto en base64Url a un string, el cual tiene un formato JSON

                var jsonBytes = Convert.FromBase64String(payload);
                var jsonBytes1 = Convert.FromBase64String(header);
                string payloadS = Encoding.UTF8.GetString(jsonBytes);
                string headerS = Encoding.UTF8.GetString(jsonBytes1);
                var jwt = _configuracion.GetSection("Jwt").Get<Jwt>();


                string newSignature = ComputeHMACSha256Hash(header + "." + payload, jwt.Key);

                if (newSignature == parts[2])
                {
                    return Ok("Token válido");

                }
                else
                {
                    return Unauthorized("El token no es válido");
                }
            
               /* //Inicializar las variables para poder utilizarlas después, al validar el token
                string jti = "";
                string iat;
                string email = "";
                string contra = "";
                long exp = 0;
               
                using (JsonDocument doc = JsonDocument.Parse(payloadS))
                {
                    //Extrae el elemento raíz para poder extraer el texto que hay en email, contra y exp
                    JsonElement root = doc.RootElement;
                    jti = root.GetProperty("jti").GetString();
                    iat = root.GetProperty("iat").GetString();
                    email = root.GetProperty("email").GetString();
                    contra = root.GetProperty("contra").GetString();
                    exp = root.GetProperty("exp").GetInt64();

                }
                //Una vez que las variables contienen el texto del token, se realiza la consulta a la base de datos
                Query consulta = _firestoreDb.Collection("users").WhereEqualTo("email", email).WhereEqualTo("contra", contra);
                QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();

                //La fecha de expiración se encuentra en timestamp, por lo que se pasa a un objeto de tipo DateTime
                DateTime expirationDate = DateTimeOffset.FromUnixTimeSeconds(exp).DateTime;
                DateTime currentDate = DateTime.UtcNow;

                //Prueba

                var claims = new[]
                {
                new Claim(JwtRegisteredClaimNames.Sub, jwt.Subject),
                new Claim(JwtRegisteredClaimNames.Jti, jti),
                new Claim(JwtRegisteredClaimNames.Iat,iat),
                new Claim("email", email),
                new Claim("contra", contra)

            };

                var keyY = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
                var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var newToken = new JwtSecurityToken(
                        jwt.Issuer,
                        jwt.Audience,
                        claims,
                        expires: expirationDate,
                        signingCredentials: signIn

                    );
                string NToken = new JwtSecurityTokenHandler().WriteToken(newToken);

                //Se compara si la fecha de actual es mayor que la de expiración
                //También si el email y la contraseña se encuentran en la base de datos
                //Si alguna de las dos condiciones se cumple, el acceso no es autorizado
                if (currentDate > expirationDate || respuestaDb.Documents.Count == 0 || !NToken.Equals(authenticateRequest.Token))
                {
                    
                    return Unauthorized("El token no es correcto o ha expirado\n" + newToken.ToString()+ "\n"+ "\n"+ jti +" "+iat+ " "+email+" "+ contra +" "+exp+"\n"+ authenticateRequest.Token);
                }
                
                //Si el email y la contraseña existen en la BD y el token no ha expirado, todo OK
                return Ok(email);
                
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al validar el token: {ex.Message} "+ex);
            }
            

        }*/

        [HttpPost("home")] //COmprueba si la firma es correcta pero ha de validar la fecha
        public async Task<ActionResult> ValidateToken1([FromBody] Models.AuthenticateRequest authenticateRequest)
        {
            string token = authenticateRequest.Token;
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token no proporcionado");
            }

            var parts = token.Split('.');
            if (parts.Length != 3)
            {
                return Unauthorized("Token incorrecto");
            }

            // Extraer el encabezado, el payload y la firma
            var header = parts[0];
            var payload = parts[1];
            var signature = parts[2];

            // Convertir Base64Url a Base64 estándar para decodificación
            string base64Header = header.Replace('-', '+').Replace('_', '/');
            string base64Payload = payload.Replace('-', '+').Replace('_', '/');

            // Añadir relleno si es necesario
            base64Header = base64Header.PadRight(base64Header.Length + ((4 - base64Header.Length % 4) % 4), '=');
            base64Payload = base64Payload.PadRight(base64Payload.Length + ((4 - base64Payload.Length % 4) % 4), '=');

            try
            {
                // Decodificar el encabezado y el payload
                var jsonBytesHeader = Convert.FromBase64String(base64Header);
                var jsonBytesPayload = Convert.FromBase64String(base64Payload);
                string headerJson = Encoding.UTF8.GetString(jsonBytesHeader);
                string payloadJson = Encoding.UTF8.GetString(jsonBytesPayload);

                // Recuperar la clave secreta desde la configuración
                var jwt = _configuracion.GetSection("Jwt").Get<Jwt>();
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));

                // Generar la firma esperada
                string expectedSignature = ComputeHMACSha256Hash($"{header}.{payload}", jwt.Key);

                // Comparar la firma esperada con la firma del token
                if (expectedSignature == signature)
                {
                    return Ok("Token válido");
                }
                else
                {
                    return Unauthorized("El token no es válido");
                }
            }
            catch (Exception ex)
            {
                return Unauthorized($"Error al validar el token: {ex.Message} " + ex);
            }
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
