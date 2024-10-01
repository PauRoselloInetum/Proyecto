import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrl: '../../assets/css/auth.css'
})
export class ResetPasswordComponent {
  restart() {
    alert('RegisterIn');
  }
}
