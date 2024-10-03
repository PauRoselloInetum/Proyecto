namespace HireAProBackend.Models
{
    public class CompleteProfileRequest
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Gender { get; set; }
        public DateTime BirthDate { get; set; }
        public string City { get; set; }

    }
}
