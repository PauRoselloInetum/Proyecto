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

        [FirestoreProperty("fullName")]  // Nombre exacto del campo en Firestore
        public string FullName { get; set; }

        [FirestoreProperty("gender")]  // Nombre exacto del campo en Firestore
        public string gender { get; set; }

        [FirestoreProperty("birthDate")]  // Nombre exacto del campo en Firestore
        public DateTime BirthDate { get; set; }

        [FirestoreProperty("city")]  // Nombre exacto del campo en Firestore
        public string City { get; set; }

        public Usuario() { }

     
    }
}
