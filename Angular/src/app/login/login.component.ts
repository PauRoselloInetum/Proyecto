import { Component } from '@angular/core';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: '../../assets/css/auth.css'
})
export class LoginComponent {
  login() {
    alert('LoggedIn');
  }
}
