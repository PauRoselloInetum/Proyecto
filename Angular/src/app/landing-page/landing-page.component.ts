import { Component } from '@angular/core';

import { HeaderComponent } from '../header/header.component';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-landing-page', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [HeaderComponent], // Importar el componente secundario para poder usarlo en este componente
  templateUrl: './landing-page.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrl: './../../assets/css/landing-page.css' // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación - Clase vacía sin lógica implementada. 
// Sólo muestra la vista html de la landing page
export class LandingPageComponent {

}
