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
  loading: string = '';

  private emailSubject = new BehaviorSubject<string>('');
  email$ = this.emailSubject.asObservable();

  private errorSubject = new BehaviorSubject<string>('');
  error$ = this.errorSubject.asObservable();

  private infoSubject = new BehaviorSubject<string>('');
  info$ = this.infoSubject.asObservable();

  private loadingSubject = new BehaviorSubject<string>('');
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  login(email: string, password: string): void {
    this.loadingSubject.next('Iniciando Sesión...');
    this.authUrl = this.loginUrl;
    const loginData = { email, password };

    this.postAuth(loginData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.info = 'Inicio de sesión exitoso, redireccionando...';
      },
      error: (error) => {
        this.loadingSubject.next('');
        this.errorSubject.next(
          error.status === 401
            ? 'Usuario o Contraseña incorrectas.'
            : error.status === 408
              ? 'Tiempo de espera agotado. Intente nuevamente.'
              : 'Error con el Servidor. Intente nuevamente.',
        );
      },
    });
  }

  register(email: string, password: string): void {
    this.loadingSubject.next("Registrándote...");
    this.authUrl = this.registerUrl;
    const loginData = { email, password };

    this.postAuth(loginData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.info = 'Registro exitoso, redireccionando...';
      },
      error: (error) => {
        this.loadingSubject.next('');
        this.errorSubject.next(
          error.status === 401
            ? 'Ya estás registrado'
            : error.status === 408
              ? 'Tiempo de espera agotado. Intente nuevamente.'
              : 'Error con el Servidor. Intente nuevamente.',
        );
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
      error: (error) => {
        window.location.href = '/login';
        console.log(error);
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
