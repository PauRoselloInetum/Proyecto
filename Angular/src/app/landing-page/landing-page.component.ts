import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './../../assets/css/landing-page.css',
})
export class LandingPageComponent implements AfterViewInit {
  @ViewChild('professions', { static: false }) professions!: ElementRef;
  @ViewChild('box', { static: false }) box!: ElementRef;
  @ViewChild('rightScroll', { static: false }) rightScroll!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    this.professions.nativeElement.addEventListener('animationend', () => {
      this.box.nativeElement.style.width = '310px'; // Reduce el tamaño del contenedor
      this.rightScroll.nativeElement.style.width = '100px'; // Ajusta el área de scroll
    });
  }
}
