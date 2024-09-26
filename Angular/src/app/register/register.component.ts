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
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  passwordconfirm: string = '';
  loading: string = '';
  error: string = '';
  info: string = '';

  constructor(private authservice: AuthService) {}

  ngOnInit() {
    this.authservice.loading$.subscribe((loading) => {
      this.loading = loading;
    });

    this.authservice.error$.subscribe((error) => {
      this.error = error;
    });

    this.authservice.info$.subscribe((info) => {
      this.info = info;
    });
  }

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

    try {
      await this.authservice.register(this.email, this.password);
      if (this.info) {
        setTimeout(() => {
          window.location.href = '/';
        }, 3500);
      }
    } catch (err) {
      this.error = this.authservice.error;
    }
  }
}
