using Google.Api;

namespace HireAProBackend.Models
{
    public class EmailDTO
    {
        public string To { get; set; }
        public string Subject { get; } = "Sujeto de prueba";
        public string Body { get; } = "Body de prueba";
    }
}
