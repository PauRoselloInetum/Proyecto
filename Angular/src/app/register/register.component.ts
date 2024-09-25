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

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;

    if (!emailRegex.test(this.email)) {
      this.error = 'Formato de correo inválido';
      return;
    }

    if (this.password !== this.passwordconfirm) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (!passwordRegex.test(this.password)) {
      this.error = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
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
