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

    try {
      await this.authservice.register(
        this.email,
        this.password,
        this.passwordconfirm,
      );
      this.info = this.authservice.info;
      this.error = this.authservice.error;
      setTimeout(() => {
        window.location.href = '/';
      }, 3500);
    } catch (err) {
      this.error = this.authservice.error;
    }
  }
}
