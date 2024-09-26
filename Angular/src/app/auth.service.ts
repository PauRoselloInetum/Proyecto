import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loginUrl = 'https://localhost:7272/api/login';
  registerUrl = 'https://localhost:7272/api/register';
  validateUrl = 'https://localhost:7272/api/home';
  authUrl: string = '';
  error: string = '';
  info: string = '';
  session: string = this.cookieService.get('token');
  loading: boolean = false;

  private emailSubject = new BehaviorSubject<string>('');
  email$ = this.emailSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  login(email: string, password: string): void {
    this.loadingSubject.next(true);
    this.authUrl = this.loginUrl;
    const loginData = { email, password };

    this.postAuth(loginData).subscribe({
      next: (response) => {
        this.loadingSubject.next(false);
        this.cookieService.set('token', response);
        this.error = '';
        this.info = 'Inicio de sesión exitoso, redireccionando...';
      },
      error: (error) => {
        this.loadingSubject.next(false);
        this.error =
          error.status === 401
            ? 'Usuario o Contraseña incorrectas.'
            : 'Error con el Servidor. Intente nuevamente.';
      },
    });
  }

  register(email: string, password: string): void {
    this.loadingSubject.next(true);
    this.authUrl = this.registerUrl;
    const loginData = { email, password };

    this.postAuth(loginData).subscribe({
      next: (response) => {
        this.loadingSubject.next(false);
        this.cookieService.set('token', response);
        this.error = '';
        this.info = 'Registro exitoso, redireccionando...';
      },
      error: (error) => {
        this.loadingSubject.next(false);
        this.error =
          error.status === 401
            ? 'Ya estás registrado'
            : 'Error con el Servidor. Intente nuevamente.';
      },
    });
  }

  validateSession(session: string) {
    const sessionData = { token: session };
    this.postValidate(sessionData).subscribe({
      next: (response) => {
        this.emailSubject.next(response);
        this.error = '';
      },
      error: () => {
        window.location.href = '/login';
      },
    });
  }

  postAuth(data: { email: string; password: string }): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    return this.http.post(this.authUrl, data, { headers });
  }

  postValidate(data: { token: string }): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    return this.http.post(this.validateUrl, data, { headers });
  }
}
