namespace HireAProBackend.Services
{
    public class GenTokenRecuperacion : IGenTokenRecuperacion
    {

        // método que va a crear un token personalizado para la url de recuperación de contraseña.
        // procedimiento --> hash(mail + contra + token perosnalizado)
        private static readonly Random random = new Random();
        private const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        private string RandomString(int length)
        {

            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public string generarTokenRecuperacion(string mail)
        {


            string bufferToken = mail;


            return bufferToken + RandomString(10);
        }


    }




}