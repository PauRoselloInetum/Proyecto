import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: '../../assets/css/auth.css'
})
export class RegisterComponent {
  register() {
    alert('RegisterIn');
  }
}
