import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerificationComponent } from './verification/verification.component';
import { HttpClientModule } from '@angular/common/http';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-root', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [ // Importar los componentes secundarios y el módulo HTTP para poder usarlos en este componente
    RouterOutlet,
    LoginComponent,
    VerificationComponent,
    RegisterComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    HttpClientModule,
  ],
  templateUrl: './app.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrl: './app.component.css', // Definir el archivo CSS que contiene los estilos asociados a este componente
  providers: [AuthService, CookieService], // Definir la lista de proveedores utilizados para el componente
})

// Componente principal de la aplicación.
export class AppComponent {
  // PROPIEDADES
  loading: boolean = false; // Indicador que muestra si alguna operación está en curso 
  public email: string = ''; // Almacena el email del usuario
  error: string = ''; // Almacena mensaje de error
  info: string = ''; // Almacena mensaje de información

  // // Constructor vacío - inyecta los servicios AuthService y CookieService para interactuar con ellos
  constructor(private authservice: AuthService, private cookieService: CookieService) {

  }

  // Método ngOnInit del ciclo de vida del componente que se ejecuta al inicializar el componente
  ngOnInit() {
    this.authservice.email$.subscribe((email) => {
      this.email = email;
    });
  }

  // Método validateSession para validar si hay una sesión activa obteniendo token de las cookies
  validateSession() {
    this.loading = true;
    const session = this.cookieService.get('token');
    this.authservice.validateSession(session);
    this.loading = false;
    this.error = this.authservice.error;
    this.info = this.authservice.info;
  }
}
