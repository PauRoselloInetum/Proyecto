import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, LoadingComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../../assets/css/auth.css',
})
export class ForgotPasswordComponent {
  email: string = '';
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

  forgotPassword() {
    this.authservice.forgotPassword(this.email);
  }
}
