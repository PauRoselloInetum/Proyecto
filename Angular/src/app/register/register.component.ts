import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, LoadingComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/css/auth.css'],
  providers: [AuthService],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  passwordconfirm: string = '';
  loading: boolean = false;
  error: string = '';
  info: string = '';

  constructor(private authservice: AuthService) {}

  async register() {
    this.error = '';
    this.info = '';

    if (this.password !== this.passwordconfirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;

    try {
      await this.authservice.register(this.email, this.password);
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
}
