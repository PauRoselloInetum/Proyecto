using Google.Cloud.Firestore;

namespace API_CLIENTES_3
{
    /*
    public class Cliente
    {
        public int id { get; set; }
        public string nombre { get; set; } = string.Empty;
        public string apellido { get; set; } = string.Empty;
        public string dept { get; set; } = string.Empty;
    }
    */
    [FirestoreData]
    public class Cliente
    {
        [FirestoreProperty("nombre")]  // Nombre exacto del campo en Firestore
        public string Nombre { get; set; }

        [FirestoreProperty("apellido")]  // Nombre exacto del campo en Firestore
        public string Apellido { get; set; }

        [FirestoreProperty("dept")]  // Nombre exacto del campo en Firestore
        public string Dept { get; set; }

        public Cliente() { }
    }

}

