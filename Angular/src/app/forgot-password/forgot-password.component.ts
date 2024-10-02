import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
  password: string = '';
  loading: string = '';
  error: string = '';
  info: string = '';
  token: string = '';

  constructor(
    private authservice: AuthService,
    private route: ActivatedRoute,
  ) {}

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

    this.route.queryParams.subscribe((params) => {
      this.token = params['t'];
    });
  }

  forgotPassword() {
    if (this.token) {
      this.authservice.forgotChangePassword(this.password, this.token);
    } else {
      this.authservice.forgotPassword(this.email);
    }
  }
}
