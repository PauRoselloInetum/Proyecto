import {
  Component,
  HostListener,
  ElementRef,
  Renderer2,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./../../assets/css/header.css'],
  standalone: true,
  imports: [CommonModule],
})
export class HeaderComponent implements AfterViewInit {
  @ViewChild('headerElement') headerElement!: ElementRef;
  animationStartPx: number = 50;
  constructor(private renderer: Renderer2) {}

  home(){
    if (window.location.pathname === '/'){
      window.scrollTo(0,0);
    }else{
      window.location.href = '/';
    }
  }

  ngAfterViewInit() {
    this.adjustMainPadding();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY;
    if (scrollPosition > this.animationStartPx) {
      this.renderer.addClass(this.headerElement.nativeElement, 'compact');
    } else {
      this.renderer.removeClass(this.headerElement.nativeElement, 'compact');
    }
    this.adjustMainPadding();
  }

  private adjustMainPadding() {
    const headerHeight = this.headerElement.nativeElement.offsetHeight;
    const mainElement = document.querySelector('main') as HTMLElement;
    if (mainElement) {
      mainElement.style.paddingTop = `${headerHeight}px`;
    }
  }
}
