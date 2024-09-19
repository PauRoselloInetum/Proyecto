using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Prueba_definitivo.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

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
            string password = loginRequest.Password;

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
                    expires: DateTime.Now.AddDays(30),
                    signingCredentials: signIn

                );
            //Retorna el token en formato de cadena de texto
            return Ok(new JwtSecurityTokenHandler().WriteToken(newToken));
        }
        [HttpPost("registro")]
        public async Task<ActionResult> Register([FromBody] Models.RegisterRequest registerRequest)
        {
            //Consigue las credenciales de registerRequest
            string correo = registerRequest.Email;
           // string password = registerRequest.Password;

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
                    contra = registerRequest.Password,
                });

                return Ok("Usuario registrado");
            }
            return Unauthorized("Ya existe un usuario con este correo");
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
