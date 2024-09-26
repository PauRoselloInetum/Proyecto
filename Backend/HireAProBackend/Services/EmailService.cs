using HireAProBackend.Models;
using MailKit.Security;
using MimeKit.Text;
using MimeKit;
using MailKit.Net.Smtp;

namespace HireAProBackend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService (IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public void SendEmail(EmailDTO emailRequest)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_configuration.GetSection("Email:UserName").Value));
            email.To.Add(MailboxAddress.Parse(emailRequest.To));
            email.Subject = emailRequest.Subject; 
            email.Body = new TextPart(TextFormat.Html)
            {
                Text = emailRequest.Body
            };

            using var smpt = new SmtpClient();
            smpt.Connect(
                _configuration.GetSection("Email:Host").Value,
                Convert.ToInt32(_configuration.GetSection("Email:Port").Value),
                SecureSocketOptions.StartTls
                );

            smpt.Authenticate(
               _configuration.GetSection("Email:UserName").Value,
               _configuration.GetSection("Email:PassWord").Value
                );

            smpt.Send(email);
            smpt.Disconnect(true);
        }

    }
}
