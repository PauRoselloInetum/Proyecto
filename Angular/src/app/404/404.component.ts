import { Component } from '@angular/core';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-404', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [], // No hay ninguna importación para este componente
  templateUrl: './404.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrl: './../../assets/css/404.css' // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación - Clase vacía sin lógica implementada. 
// Sólo muestra la vista html de ERROR 404
export class WrongRouteComponent {

}
