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
  session: boolean = false;
  constructor(
    private cookieService: CookieService
  ) {}
  ngOnInit() {
      if (this.cookieService.get('token')) {
        this.session = true
      }
  }

  clearCookies(){
    this.cookieService.deleteAll()
    this.session = false
  }
}
