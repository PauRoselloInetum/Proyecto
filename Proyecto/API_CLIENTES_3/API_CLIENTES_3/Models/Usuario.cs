using System;
using Google.Cloud.Firestore;


namespace API_CLIENTES_3.Models
{
    [FirestoreData]
    public class Usuario
    {
        [FirestoreProperty("email")]  // Nombre exacto del campo en Firestore
        public string Email { get; set; }

        [FirestoreProperty("contra")]  // Nombre exacto del campo en Firestore
        public string Contra { get; set; }

        public Login() { }
    }
}

