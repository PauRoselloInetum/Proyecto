import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; // Importamos HttpHeaders
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule], // Importa FormsModule y HttpClientModule
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/css/auth.css']
})
export class LoginComponent {
  email: string = ''; // Variable para capturar el email/usuario
  password: string = ''; // Variable para capturar la contraseña

  constructor(private http: HttpClient) {} // Inyectamos HttpClient

  // Método para iniciar sesión
  login() {
    const loginData = {
      email: this.email,
      password: this.password
    };

    // Realiza la solicitud POST
    this.postLogin(loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
      },
      error: (error) => {
        console.error('Error en el login', error);
      }
    });
  }

  // Función que hace la solicitud POST al API
  postLogin(data: { email: string; password: string }): Observable<any> {
    const apiUrl = 'https://localhost:7272/api/Controlador/login';

    // Definir las cabeceras de la solicitud
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Allow-Origin': '*'
    });

    return this.http.post(apiUrl, data, { headers });
  }
}
