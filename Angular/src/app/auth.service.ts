import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  backendUrl = 'https://localhost:7272/api/';
  loginUrl = this.backendUrl + 'login';
  registerUrl = this.backendUrl + 'register';
  validateUrl = this.backendUrl + 'home';
  forgotUrl = this.backendUrl + 'forgotPassword';
  authUrl: string = '';
  error: string = '';
  info: string = '';
  session: string = this.cookieService.get('token');
  loading: string = '';

  emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%_*?&.]{8,}$/;

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
        this.infoSubject.next('Inicio de sesión exitoso, redireccionando...');
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

  register(email: string, password: string, passwordconfirm: string): void {
    if (!this.emailRegex.test(email)) {
      this.errorSubject.next('Formato de correo inválido');
      return;
    }

    if (password !== passwordconfirm) {
      this.errorSubject.next('Las contraseñas no coinciden');
      return;
    }

    if (!this.passwordRegex.test(password)) {
      this.errorSubject.next(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
      );
      return;
    }

    this.loadingSubject.next('Registrándote...');
    this.authUrl = this.registerUrl;
    const registerData = { email, password };
    this.postAuth(registerData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.infoSubject.next('Registro exitoso, redireccionando...');
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

  forgotPassword(email: string) {
    this.loadingSubject.next('Enviando correo...');
    const sessionData = { email: email };
    this.postForgot(sessionData).subscribe({
      next: (response) => {
        this.emailSubject.next(response);
        this.loadingSubject.next('');
        this.error = '';
        console.log(response);
      },
      error: (error) => {
        this.loadingSubject.next('');
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

  postForgot(data: { email: string }): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    return this.http.post(this.forgotUrl, data, { headers });
  }
}
