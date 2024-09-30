import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-components', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [FormsModule, LoadingComponent, HttpClientModule], // Importar los componentes secundarios para poder usarlos en este componente
  templateUrl: './components.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrl: './components.component.css', // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación
// Permite al usuario gestionar la eliminación de su cuenta
export class ComponentsComponent {
  // PROPIEDADES
  loggedIn: boolean = false; // Indica si el usuario está autenticado
  deleteuser: boolean = false; // Indica si la acción de eliminación está activa
  deleteemail: string = ''; // Almacena el correo electrónico del usuario a eliminar
  sessionemail: string = ''; // Almacena el correo electrónico de la sesión activa
  loading: boolean = false; // Indica si hay una operación en curso
  error: string = ''; // Almacena mensaje de error
  info: string = ''; // Almacena mensaje de información
  public email: string = ''; // Almacena el correo electrónico del usuario

  // Constructor vacío - inyecta los servicios CookieService, HttpClient y AuthService para interactuar con ellos
  constructor(private cookieService: CookieService, private http: HttpClient, private authservice: AuthService) {

  }

  // Método 'ngOnInit' - Se ejecuta al inicializar el componente
  ngOnInit() {
    // Verifica si hay un token en las cookies para determinar si el usuario está autenticado
    if (this.cookieService.get("token")){
      this.loggedIn = true
    }

    // Se suscribe a email$ de AuthService para obtener el correo electrónico del usuario
    this.authservice.email$.subscribe((email) => {
      this.email = email;
    })
  }

  // Método 'clearCookies'
  clearCookies() {
    this.cookieService.deleteAll(); // Elimina las cookies
    this.loggedIn = false; // Desloggea al usuario
    window.location.reload(); // Recarga la página (sin el login)
  }

  // Método 'borrarUser' para iniciar el proceso de eliminación de usuario
  borraruser() {
    // Variables de la función
    this.deleteuser = false;
    this.loading = true;
    const loginData = {
      email: this.deleteemail,
    };

    // Llama a la función 'DeleteUser' para eliminar al usuario
    this.DeleteUser(loginData).subscribe({
      next: (response) => {
        this.error = '';
        this.loading = false;
        this.info = 'Usuario Eliminado Correctamente';
        this.deleteemail = '';
        setTimeout(() => {
          this.info = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Ha habido algun error...';
        this.loading = false;
      },
    });
  }

  // Método secundario 'DeleteUSer' que elimina al usuario, se llama dentro de otras funciones
  DeleteUser(data: { email: string }): Observable<any> {
    const apiUrl = 'https://localhost:7272/api/eliminarUsuario';

    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Allow-Origin': '*',
    });

    // Realiza una solicitud HTTP DELETE para eliminar un usuario
    return this.http.request('delete', apiUrl, { headers, body: data });
  }
}
