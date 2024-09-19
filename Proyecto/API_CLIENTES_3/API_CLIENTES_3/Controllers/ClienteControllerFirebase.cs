// API PARA CONECTAR CON GPT 
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Mvc;

namespace API_CLIENTES_3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClienteController : ControllerBase
    {
        private FirestoreDb _firestoreDb;

        public ClienteController()
        {
            string path = "C:\\Users\\marta.flores.ext\\Downloads\test-2f0bb-firebase-adminsdk-n67ny-dfd406d337.json"; // Ruta del archivo de credenciales
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", path);
            _firestoreDb = FirestoreDb.Create("test-2f0bb");
        }

        [HttpGet]
        public async Task<ActionResult<List<Cliente>>> GetClientes()
        {
            List<Cliente> clientes = new List<Cliente>();
            Query query = _firestoreDb.Collection("clientes");
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    Cliente cliente = document.ConvertTo<Cliente>();
                    clientes.Add(cliente);
                }
            }

            return clientes;
        }
    }
}
