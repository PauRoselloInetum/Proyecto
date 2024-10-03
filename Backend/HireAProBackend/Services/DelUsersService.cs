using Google.Cloud.Firestore;
using HireAProBackend.Models;
using HireAProBackend.Templates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HireAProBackend.Services
{

    /*Los servicios pueden tener distintos ciclos de vida:
     *      - Singleton: el ciclo de vida dura tanto como la aplicación esté en ejecución. Este es el caso de este servicio
     *      - Scoped: ciclo de vida corto que corresponde al de una solicitud HTTP
     *      - Transient: se crea una nueva instancia del servicio cada vez que se solicita
     */
    public class DelUsersService : BackgroundService
    {
        //Es necesario llamar al IServiceProvider ya que estos servicios tienen distintos ciclos de vida
        //Lo siguiente es para acceder a la base de datos
        private readonly IServiceProvider _serviceProvider;
        private readonly FirestoreDb _firestoreDb;

        //Aquí se inyectan las dependencias (igual que en el controlador)
        public DelUsersService(FirestoreDb firestoreDb, IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
            _firestoreDb = firestoreDb;
        }

        //Método que se ejectua de forma continúa a no ser que se solicite la cancelación
        protected override async Task ExecuteAsync(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                //Espera la repsuesta de la función para eliminar usuarios
                await DeleteUnverifiedUsers();

                //El ciclo se repetirá cada hora, podemos añadir más tiempo si no queremos que se realicen tantas solicitudes a la base de datos
                //Se puede cambiar a minutos e incluso segundos para probar (no recomendado, ya que más de una vez me ha tirado el servidor
                //cuando he puesto un intervalo más pequeño)
                await Task.Delay(TimeSpan.FromHours(1), cancellationToken);
            }
        }

        private async Task DeleteUnverifiedUsers()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                //Crea un scope para simular una solicitud HTTP y poder utlizar el servicio de correo electrónico
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                //Extrae los usuarios que no han sido verificados
                var usuarios = new List<Usuario>();
                Query consulta = _firestoreDb.Collection("users").WhereEqualTo("verified", false);
                QuerySnapshot snapshot = await consulta.GetSnapshotAsync();

                //Comprueba uno a uno los usuarios, por eso es conveniente que el servicio no se ejecute de manera muy frecuente
                foreach (var document in snapshot.Documents)
                {
                    if (document.Exists)
                    {
                        Usuario usuario = document.ConvertTo<Usuario>();
                        usuarios.Add(usuario);

                        DateTime createdAt = usuario.CreatedAt;

                        //Comprueba la fecha de creación del registro, y genera dos fechas. La primera servirá para enviarle un correo de advertencia
                        //y la segunda para ya eliminar el usuario de la DB
                        DateTime today = DateTime.UtcNow;
                        DateTime warningNotVerified = createdAt.AddDays(7);
                        DateTime deleteNotVerified = createdAt.AddDays(10);

                        //Primer if que genera el correo electrónico
                        if (today >= warningNotVerified && today < deleteNotVerified)
                        {
                            //Se inicializan los objectos para enviar el correo electrónico
                            EmailDTO verifyEmail = new EmailDTO();
                            EmailContent verifyContent = new EmailContent();

                            //Obtiene el correo del usuario buscando el token (que no tiene fecha de caducidad y solo se elimina una vez el usuario
                            //se ha verificado) y rellena los campos del correo electrónico
                            Query consultaToken = _firestoreDb.Collection("tokens").WhereEqualTo("email", usuario.Email);
                            QuerySnapshot snapshotToken = await consultaToken.GetSnapshotAsync();

                            if (snapshotToken.Documents.Count != 0)
                            {
                                verifyEmail.To = usuario.Email;
                                verifyEmail.Subject = verifyContent.VerifyAgainSubject;

                                string verifyToken = snapshotToken[0].GetValue<string>("token");

                                string link = "http://localhost:4200/login/verify?t=" + verifyToken;

                                string verifyBody = verifyContent.Ver2Body(usuario.Username, link, deleteNotVerified.Date.ToString());
                                verifyEmail.Body = verifyBody;
                                emailService.SendEmail(verifyEmail);
                            }
                        }
                        //En caso que el usuario no haya verificado su cuenta tras 10 días, se elimina su registro de la base de datos
                        if (today >= deleteNotVerified)
                        {
                            await _firestoreDb.Collection("users").Document(document.Id).DeleteAsync();

                            //Elimina el token en caso que el usuario no se haya verificado
                            Query consultaToken = _firestoreDb.Collection("tokens").WhereEqualTo("email", usuario.Email);
                            QuerySnapshot snapshotToken = await consultaToken.GetSnapshotAsync();

                            if (snapshotToken.Documents.Count != 0)
                            {
                                foreach (var tokenDoc in snapshotToken.Documents)
                                {
                                    await _firestoreDb.Collection("tokens").Document(tokenDoc.Id).DeleteAsync();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
