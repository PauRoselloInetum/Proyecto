import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../auth.service';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-forgot-password', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [FormsModule, LoadingComponent], // Importar los componentes secundarios para poder usarlos en este componente
  templateUrl: './forgot-password.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrl: '../../assets/css/auth.css', // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación
// Muestra la vista html de la forgotPassword y permite a los usuarios solicitar un restablecimiento de contraseña mediante su dirección de correo electrónico
export class ForgotPasswordComponent {
  // PROPIEDADES
  email: string = '';
  loading: string = '';
  error: string = '';
  info: string = '';

  // Constructor vacío para interactuar con AuthService - inyecta el servicio de autenticación que maneja la lógica del restablecimiento de password
  constructor(private authservice: AuthService) {

  }

  // Método 'ngOnInit' - busca los valores de AuthService para actualizar las propiedades locales del componente cuando estos valores cambian
  ngOnInit() {
    // Actualiza el mensaje de carga
    this.authservice.loading$.subscribe((loading) => {
      this.loading = loading;
    });

    // Actualiza el mensaje de error
    this.authservice.error$.subscribe((error) => {
      this.error = error;
    });

    // Actualiza el mensaje de información
    this.authservice.info$.subscribe((info) => {
      this.info = info;
    });
  }

  // Método ASÍNCRONO 'forgotPassword' que se llama cuando el usuario solicita un restablecimiento de contraseña
  async forgotpassword() {
    // Inicializa las variables error e info como cadenas vacías
    this.error = '';
    this.info = '';

    // Intenta llamar al método forgotPassword de AuthService con el correo electrónico proporcionado.
      // Si tiene éxito, actualiza 'info' y 'error' con los valores de AuthService
    try {
      await this.authservice.forgotPassword(this.email);
      this.info = this.authservice.info;
      this.error = this.authservice.error;
      
      // Si NO tiene éxito, actualiza 'error' con el valor de AuthService
    } catch (err) {
      this.error = this.authservice.error;
    }
  }
}
