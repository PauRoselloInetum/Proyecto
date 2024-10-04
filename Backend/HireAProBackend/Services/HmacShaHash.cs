using System.Security.Cryptography;
using System.Text;

namespace HireAProBackend.Services
{
    public class HmacShaHash : IHmacShaHash
    {
        public string ComputeHMACSha256Hash(string data, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            using (var hmacsha256 = new HMACSHA256(keyBytes))
            {
                var dataBytes = Encoding.UTF8.GetBytes(data);
                var hashBytes = hmacsha256.ComputeHash(dataBytes);
                return Convert.ToBase64String(hashBytes).Replace('+', '-').Replace('/', '_').TrimEnd('='); // Convertir a Base64Url
            }
        }
    }
}
