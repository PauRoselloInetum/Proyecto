using Google.Cloud.Firestore;

namespace HireAProBackend.Models
{

    [FirestoreData]
    public class TokenPassReset
    {

        [FirestoreProperty("email")]  // Nombre exacto del campo en Firestore
        public string email { get; set; }

        [FirestoreProperty("token")]  // Nombre exacto del campo en Firestore
        public string token { get; set; }

        public TokenPassReset() { }


    }
}
