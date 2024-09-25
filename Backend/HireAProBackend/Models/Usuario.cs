using Google.Cloud.Firestore;

namespace HireAProBackend.Models
{

    [FirestoreData]
    public class Usuario
    {

        [FirestoreProperty("email")]  // Nombre exacto del campo en Firestore
        public string Email { get; set; }

        [FirestoreProperty("password")]  // Nombre exacto del campo en Firestore
        public string Password { get; set; }

        public Usuario() { }

     
    }
}
