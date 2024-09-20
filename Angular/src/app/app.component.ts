import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerificationComponent } from './verification/verification.component';

import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoginComponent,
    VerificationComponent,
    RegisterComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    HttpClientModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  session = '';
  email = '';
  error = '';
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}
  ngOnInit() {
    this.ValidateSession();
  }
  ValidateSession() {
    if (this.cookieService.get('token')) {
      this.session = this.cookieService.get('token');

      const sessionData = {
        token: this.session,
      };
      this.postValidate(sessionData).subscribe({
        next: (response) => {
          const decodedToken = this.decodeToken(this.session);
          this.email = decodedToken.email;
          this.error = ""
          console.log(this.email)
          console.log(this.session)
        },
        error: (error) => {
          console.log(error);
          this.error = "Token no valido"
        },
      });
    } else {
      if (
        window.location.pathname === '/login' ||
        window.location.pathname === '/register'
      ) {
      } else {
        window.location.href = '/login';
      }
    }
  }
  postValidate(data: { token: string }): Observable<any> {
    const apiUrl = 'https://localhost:7272/api/home';

    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Allow-Origin': '*',
    });

    return this.http.post(apiUrl, data, { headers });
  }
  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  }
}
