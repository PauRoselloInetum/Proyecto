using HireAProBackend.Models;

namespace HireAProBackend.Services
{
    public interface IEmailService
    {
        void SendEmail(EmailDTO emailRequest);
    }
}
