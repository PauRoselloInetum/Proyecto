/*

// API ORIGINAL

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API_CLIENTES_3.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClienteController : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<Cliente>>> GetClientes()
        {
            return new List<Cliente>
            {
                new Cliente
                {
                    nombre = "Maxim",
                    apellido = "Klym",
                    dept = "Microsoft"
                }
            };
        }
    }
}

// API ORIGINAL ^^^^^^^^^^^`

*/

