using Google.Cloud.Firestore;

namespace HireAProBackend.Models
{

    [FirestoreData]
    public class Usuario
    {
        [FirestoreProperty("username")]
        public string Username { get; set; }

        [FirestoreProperty("email")]  // Nombre exacto del campo en Firestore
        public string Email { get; set; }

        [FirestoreProperty("password")]  // Nombre exacto del campo en Firestore
        public string Password { get; set; }

        [FirestoreProperty("verified")]
        public bool Verified { get; set; }

        [FirestoreProperty("createdAt")]
        public DateTime CreatedAt { get; set; }

        public Usuario() { }

     
    }
}
