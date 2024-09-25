import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LoadingComponent],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/css/auth.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  info: string = '';

  constructor(private authservice: AuthService) {}

  async login() {
    if (this.email.trim() === '' || this.password.trim() === '') {
      this.error = 'Email y Contraseña son requeridos.';
      return;
    }

    this.error = '';
    this.info = '';
    this.loading = true;

    try {
      await this.authservice.login(this.email, this.password);
      this.info = this.authservice.info;
      this.error = this.authservice.error;
      if (this.info) {
        setTimeout(() => {
          window.location.href = '/';
        }, 3500);
      }
    } catch (err) {
      this.error = this.authservice.error;
    } finally {
      this.loading = false;
    }
  }

  ngOnInit() {}
}
