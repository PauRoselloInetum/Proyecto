namespace HireAProBackend.Services
{
    public interface IHmacShaHash
    {
        string ComputeHMACSha256Hash(string data, string secretKey);
    }
}
