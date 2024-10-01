import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-loading', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [], // No hay ninguna importación para este componente
  templateUrl: './loading.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrl: './../../assets/css/loading.css', // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación
// Muestra un indicador de carga en la interfaz de usuarip mientras se realizan operaciones asíncronas
export class LoadingComponent {
  // PROPIEDADES
  loading: string = '';

  // Constructor vacío para interactuar con AuthService - inyecta el servicio de autenticación que maneja la lógica del loading/carga de la página
  constructor(private authservice: AuthService){

  }

  // Método ngOnInit - busca los valores de AuthService para actualizar las propiedades locales del componente cuando estos valores cambian
  ngOnInit() {
    // Actualiza el mensaje de carga
    this.authservice.loading$.subscribe((loading) => {
      this.loading = loading;
    });
  }
}
