import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../auth.service';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-register', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [FormsModule, LoadingComponent], // Importar los componentes secundarios para poder usarlos en este componente
  templateUrl: './register.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrls: ['../../assets/css/auth.css'] // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación
// Maneja la funcionalidad del formulario html de registro. Este componente interactua con la clase AuthService para registrar un usuario
export class RegisterComponent {
  // PROPIEDADES
  email: string = '';
  password: string = '';
  passwordconfirm: string = '';
  loading: string = '';
  error: string = '';
  info: string = '';

  // Constructor vacío para interactuar con AuthService - inyecta el servicio de autenticación que maneja la lógica del registro
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

  // Método ASÍNCRONO 'register' de este componente
  async register() {
    // Limpia los mensajes de error e información
    this.error = '';
    this.info = '';
    
    // Llama al método 'register' de AuthService. Si el registro es exitoso, redirige al usuario a la página principal después de un breve retraso de 3500ms 
    try {
      await this.authservice.register(
        this.email,
        this.password,
        this.passwordconfirm,
      );
      this.info = this.authservice.info;
      this.error = this.authservice.error;
      setTimeout(() => {
        window.location.href = '/';
      }, 3500);

    // Si el registro NO es exitoso, da error
    } catch (err) {
      this.error = this.authservice.error;
    }
  }
}
