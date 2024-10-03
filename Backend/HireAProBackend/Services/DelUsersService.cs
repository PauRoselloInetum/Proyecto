using Google.Cloud.Firestore;
using HireAProBackend.Models;
using Microsoft.Extensions.Configuration;

namespace HireAProBackend.Services
{
    public class DelUsersService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private FirestoreDb _firestoreDb;
        public IConfiguration _configuracion;
        public Models.Path _path;
        private readonly IEmailService _emailService;

        public DelUsersService(IServiceProvider serviceProvider, IConfiguration configuracion, IEmailService emailService)
        {
            _serviceProvider = serviceProvider;
            _path = new Models.Path();
            string path = _path.path; // Ruta del archivo de credenciales
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", path);
            _firestoreDb = FirestoreDb.Create("hire-a-pro-database");
            _configuracion = configuracion;
            _emailService = emailService;

        }

        protected override async Task ExecuteAsync(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {

                await DeleteUnverifiedUsers();

                await Task.Delay(TimeSpan.FromHours(1), cancellationToken);
            }
        }
        private async Task DeleteUnverifiedUsers()
        {
            var usuarios = new List<Usuario>();
            Query consulta = _firestoreDb.Collection("users").WhereEqualTo("verified", false);
            QuerySnapshot snapshot = await consulta.GetSnapshotAsync();

            foreach (var document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    Usuario usuario = document.ConvertTo<Usuario>();
                    usuarios.Add(usuario);

                    DateTime createdAt = usuario.CreatedAt;

                    DateTime today = DateTime.UtcNow;
                    DateTime warningNotVerified = createdAt.AddMinutes(7);
                    DateTime deleteNotVerified = createdAt.AddMinutes(10);


                    if (today >= warningNotVerified && today < deleteNotVerified)
                    {
                        //Enviar correo electrónico (he de crear la plantilla)
                    }

                    if (today >= deleteNotVerified)
                    {
                        await _firestoreDb.Collection("users").Document(document.Id).DeleteAsync();
                    }


                }
            }

            await Task.CompletedTask;
        }
    }
}
