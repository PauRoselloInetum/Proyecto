namespace HireAProBackend.Models
{
    public class ChangePassRequest
    {
        public string Token { get; set; }
        public string Password { get; set; }
    }
}
