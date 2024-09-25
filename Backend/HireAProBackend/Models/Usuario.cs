using Google.Cloud.Firestore;

namespace HireAProBackend.Models
{

    [FirestoreData]
    public class Usuario
    {

        [FirestoreProperty("email")]  // Nombre exacto del campo en Firestore
        public string Email { get; set; }

        [FirestoreProperty("contra")]  // Nombre exacto del campo en Firestore
        public string Contra { get; set; }

        public Usuario() { }

     
    }
}
