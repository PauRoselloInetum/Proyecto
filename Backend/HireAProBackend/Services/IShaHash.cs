namespace HireAProBackend.Services
{
    public interface IShaHash
    {
        string ComputeSha256Hash(string rawData);
    }
}
