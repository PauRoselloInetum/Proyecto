import { Component, HostListener, ElementRef, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Decorador @Component para definir el componente
@Component({
  selector: 'app-header', // Definir selector personalizado de HTML para este componente
  standalone: true, // Marcar este componente como independiente-standalone
  imports: [CommonModule], // Importar el componente secundario para poder usarlo en este componente
  templateUrl: './header.component.html', // Definir el archivo HTML que contiene la plantilla asociada a este componente
  styleUrls: ['./../../assets/css/header.css'], // Definir el archivo CSS que contiene los estilos asociados a este componente
})

// Componente secundario de la aplicación
// Muestra el header y crea las funciones para las funcionalidades del header
export class HeaderComponent implements AfterViewInit {
  // Decorador @ViewChild - Se utiliza para obtener una referencia al elemento del DOM correspondiente al encabezado.
  @ViewChild('headerElement') headerElement!: ElementRef;

  // Define la posición de desplazamiento en píxeles a partir de la cual se aplicará una clase CSS para animar el encabezado.
  animationStartPx: number = 50;

  // Constructor vacío - inyecta el servicio Renderer2 para manipular el DOM (Document Object Model)
  constructor(private renderer: Renderer2) {

  }

  // Método 'home' que redirige a la página home
  home(){
      // Si ya está en la página home, hace scroll hasta la parte superior
    if (window.location.pathname === '/'){
      window.scrollTo(0,0);
    
      // Si no está en la página de inicio, redirige a la página home
    }else{
      window.location.href = '/';
    }
  }

  // Método 'ngAfterViewInit' que se ejecuta después de que la vista ha sido inicializada
  ngAfterViewInit() {
    // Llama a adjustMainPadding() para ajustar el relleno del elemento principal.
    this.adjustMainPadding();
  }

  // Escucha el evento de desplazamiento de la ventana - Llama a onWindowScroll() cada vez que se desplaza la ventana.
  @HostListener('window:scroll', [])

  // Método 'onWindowScroll' que comprueba la posición de desplazamiento. Modifica el header según la posición de la ventana
  onWindowScroll() {
    const scrollPosition = window.scrollY;

      // Si la posición de desplazamiento esté por encima de animationStartPx, agrega la clase 'compact' al header. Se hace pequeño
    if (scrollPosition > this.animationStartPx) {
      this.renderer.addClass(this.headerElement.nativeElement, 'compact');

      // Si la posición de desplazamiento está al inicio, quita la clase 'compact' y el header se hace grande 
    } else {
      this.renderer.removeClass(this.headerElement.nativeElement, 'compact');
    }

    this.adjustMainPadding();
  }

  // Método secundario para facilitar el código y llamarlo dentro de otras funciones - Ajusta el relleno superior del elemento <main> en función de la altura del header
  private adjustMainPadding() {
    const headerHeight = this.headerElement.nativeElement.offsetHeight;
    const mainElement = document.querySelector('main') as HTMLElement;
    if (mainElement) {
      mainElement.style.paddingTop = `${headerHeight}px`;
    }
  }
}
