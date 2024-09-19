using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;
using API_CLIENTES_3.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace API_CLIENTES_3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private FirestoreDb _firestoreDb;

        public UsuarioController()
        {
            string path = "C:\\Users\\marta.flores.ext\\Downloads\test-2f0bb-firebase-adminsdk-n67ny-dfd406d337.json"; // Ruta del archivo de credenciales
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", path);
            _firestoreDb = FirestoreDb.Create("test-2f0bb");
        }
/*
        [HttpPost("login")]
        public async Task<ActionResult<Usuario>> Login([FromBody] Usuario loginRequest)
        {
            //Comprueba si el email y la contraseña contenidos en loginRequest (que sería enviado desde Angular, existen en la base de datos
            Query consulta = _firestoreDb.Collection("usuarios").WhereEqualTo("email", loginRequest.Email).WhereEqualTo("contra", loginRequest.Contra);
            //Realiza la consulta a la base de datos y la almacena en respuestaDb
            QuerySnapshot respuestaDb = await consulta.GetSnapshotAsync();

            //Si no existen documentos, es decir, si no está el usuario en la base de datos, le indica un error al Angular
            if (respuestaDb.Documents.Count == 0)
            {
                return Unautorized("Email o contraseña incorrectos");
            }

            //Si está correcto, devuelve 200 OK y el token JWT generado a partir de los datos del usuario, el cual se almacenará en el pc del usuario
            Usuario usuario = respuestaDb.Documents[0].ConvertTo<Usuario>();
            var token = GenerarToken(usuario);
            return Ok(new { token });
        }

        private string GenerarToken(Usuario usuario)
        {

        }*/

    }
}
