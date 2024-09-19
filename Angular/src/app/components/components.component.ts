import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [],
  templateUrl: './components.component.html',
  styleUrl: './components.component.css'
})
export class ComponentsComponent {
  constructor(
    private cookieService: CookieService,
  ) {}
  clearCookies(){
    this.cookieService.deleteAll()
  }
}
