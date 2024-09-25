import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpClientModule,
} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loginUrl = 'https://localhost:7272/api/login';
  validateUrl = 'https://localhost:7272/api/home';
  error: string = '';
  info: string = '';
  session: string = '';
  email: string = '';
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  login(email: string, password: string): Promise<any> {
    this.loading = true;
    const loginData = { email, password };
    return this.postLogin(loginData).toPromise().then(
      (response) => {
        this.loading = false;
        this.cookieService.set('token', response);
        this.error = '';
        this.info = 'Login exitoso, redireccionando...';
      },
      (error) => {
        this.loading = false;
        this.error =
          error.status === 401
            ? 'Usuario o Contraseña incorrectas.'
            : 'Error con el servidor. Intente nuevamente.';
      }
    );
  }

  validateSession(session: string) {
    const sessionData = {
      token: session,
    };

    this.postValidate(sessionData).subscribe({
      next: (response) => {
        this.email = response;
        this.error = '';
      },
      error: (error) => {
        window.location.href = '/login';
      },
    });
  }

  postLogin(data: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    return this.http.post(this.loginUrl, data, { headers });
  }

  postValidate(data: { token: string }): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Allow-Origin': '*',
    });

    return this.http.post(this.validateUrl, data, { headers });
  }
}
