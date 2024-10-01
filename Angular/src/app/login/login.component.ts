import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../auth.service';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-login', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [FormsModule, LoadingComponent], // Importar los componentes secundarios para poder usarlo en este componente
  templateUrl: './login.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrls: ['../../assets/css/auth.css'], // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación
// Maneja la funcionalidad del formulario html de login. Este componente interactua con la clase AuthService para autenticar un usuario
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: string = '';
  error: string = '';
  info: string = '';

  // Constructor vacío para interactuar con AuthService - inyecta el servicio de autenticación que maneja la lógica del login
  constructor(private authservice: AuthService) {

  }

  // Método ngOnInit - busca los valores de AuthService para actualizar las propiedades locales del componente cuando estos valores cambian
  ngOnInit() {
    this.authservice.loading$.subscribe((loading) => {
      this.loading = loading;
    });

    this.authservice.error$.subscribe((error) => {
      this.error = error;
    });

    this.authservice.info$.subscribe((info) => {
      this.info = info;
    });
  }

  // Método ASÍNCRONO 'login' de este componente
  async login() {
    // Verifica que el email y la password no estén vacíos. Si están vacíos, mensaje de error
    if (this.email.trim() === '' || this.password.trim() === '') {
      this.error = 'Email y Contraseña son requeridos.';
      return;
    }

    // Limpia los mensajes de error e información
    this.error = '';
    this.info = '';

    // Llama al método 'login' de AuthService. Si el login es exitoso, redirige al usuario a la página principal después de un breve retraso de 3500ms 
    try {
      await this.authservice.login(this.email, this.password);
      this.info = this.authservice.info;
      this.error = this.authservice.error;
      setTimeout(() => {
        window.location.href = '/';
      }, 3500);

    // Si el login NO es exitoso, da error
    } catch (err) {
      this.error = this.authservice.error;
    }
  }
}
