using Microsoft.AspNetCore.Mvc;

namespace HireAProBackend.Services
{
    public interface ISaveToken
    {
        Task<bool> GuardarTokenAsync(string tokenEntrada, string correo);
    }
}
