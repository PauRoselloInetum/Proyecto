import { Component } from '@angular/core';

import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './../../assets/css/landing-page.css'
})
export class LandingPageComponent {

}
