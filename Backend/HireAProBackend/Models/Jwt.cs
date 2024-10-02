using System.Security.Claims;

namespace HireAProBackend.Models
{
    public class Jwt
    {
        public string LoginKey { get; set; }
        public string ResetPassKey { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public string Subject { get; set; }

        public static bool validarToken(ClaimsIdentity identity)
        {

            if (identity.Claims.Count() == 0)
            {
                return false;
            }

            return true;
        }
    }
}
