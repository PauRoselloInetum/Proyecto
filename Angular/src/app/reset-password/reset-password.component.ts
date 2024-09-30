import { Component } from '@angular/core';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-reset-password', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [], // No hay ninguna importación para este componente
  templateUrl: './reset-password.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrl: '../../assets/css/auth.css' // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación
// Muestra la vista html para restablecer la password + un método que alerta al usuario
export class ResetPasswordComponent {
  restart() {
    alert('RegisterIn');
  }
}
