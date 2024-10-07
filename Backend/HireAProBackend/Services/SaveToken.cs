
using Google.Cloud.Firestore;
using HireAProBackend.Models;

namespace HireAProBackend.Services
{
    public class SaveToken : ISaveToken
    {
        private readonly FirestoreDb _firestoreDb;

        public SaveToken(FirestoreDb firestoreDb)
        {
            _firestoreDb = firestoreDb;
        }
        public async Task<bool> GuardarTokenAsync(string tokenEntrada, string correo)
        {
            TokenPassReset tokenUsuario = new TokenPassReset();

            tokenUsuario.token = tokenEntrada;
            tokenUsuario.email = correo;
            var cancellationTokenSource = new CancellationTokenSource();

            // consultar si previamente existe este usuario
            Query consultarUser = _firestoreDb.Collection("tokens").WhereNotEqualTo("token", tokenUsuario.email);


            var queryTask = consultarUser.GetSnapshotAsync(cancellationTokenSource.Token);

            if (await Task.WhenAny(queryTask) == queryTask)
            {
                QuerySnapshot respuestaDb = await queryTask;
                //Si no existen documentos, es decir, si no está el usuario en la base de datos, le indica error
                if (respuestaDb.Documents.Count == 0)
                {
                    return false;
                }
            };


            DateTime fechaCaducidad = (DateTime.UtcNow).AddMinutes(15);

            CollectionReference referencia = _firestoreDb.Collection("tokens");
            DocumentReference nuevoToken = await referencia.AddAsync(new
            {
                token = tokenEntrada,
                email = correo,
                caducidad = fechaCaducidad
            });

            return true;
        }
    }
}
