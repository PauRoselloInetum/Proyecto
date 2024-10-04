using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HireAProBackend.Services;
using HireAProBackend.Models;
using Google.Cloud.Firestore;

var builder = WebApplication.CreateBuilder(args);
IdentityModelEventSource.ShowPII = true;


string path = new HireAProBackend.Models.Path().path; // Asegúrate de que Path esté accesible
Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", path);

builder.Services.AddSingleton<FirestoreDb>(provider =>
{
    return FirestoreDb.Create("hire-a-pro-database");
});

// Agregar servicios al contenedor
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Configuración de CORS para permitir solicitudes desde Angular (localhost:4200)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder => builder
            .WithOrigins("http://localhost:4200") // Permitir origen de Angular
            .AllowAnyMethod() // Permitir todos los métodos HTTP (GET, POST, etc.)
            .AllowAnyHeader()); // Permitir cualquier encabezado
});

// Configuración de autenticación con JWT para múltiples esquemas
builder.Services.AddAuthentication(options =>

{
    // Esquema predeterminado para login
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer("LoginScheme", options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:LoginKey"]))
    };
});

builder.Services.AddTransient<IHmacShaHash,HmacShaHash>();
//Configuracion servicio de correo
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHostedService<DelUsersService>();


var app = builder.Build();

// Configuración del pipeline de solicitudes HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Aplicar la política CORS antes de otros middlewares
app.UseCors("AllowAngularApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
