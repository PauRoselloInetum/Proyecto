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
  verifyUserUrl = this.backendUrl + 'verifyAccount';
  forgotUrl = this.backendUrl + 'forgotPassword';
  forgotChangeUrl = this.backendUrl + 'changePass';
  authUrl: string = '';
  error: string = '';
  info: string = '';
  session: string = this.cookieService.get('token');
  loading: string = '';

  emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/;
  usernameRegex = /^[a-z0-9._-]{6,}$/;

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
    if (!this.usernameRegex.test(email)) {
      this.errorSubject.next('Formato de usuario inválido');
      return;
    }

    if (!this.passwordRegex.test(password)) {
      this.errorSubject.next(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
      );
      return;
    }

    this.loadingSubject.next('Iniciando Sesión...');
    this.authUrl = this.loginUrl;

    const loginData = { email, password };

    this.postLogin(loginData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.infoSubject.next('Inicio de sesión exitoso, redireccionando...');
        setTimeout(() => {
          window.location.href = '/';
        }, 3500);
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

  register(
    username: string,
    email: string,
    password: string,
    passwordconfirm: string,
  ): void {
    if (!this.emailRegex.test(email)) {
      this.errorSubject.next('Formato de correo inválido');
      return;
    }

    if (!this.usernameRegex.test(username)) {
      this.errorSubject.next('Formato de usuario inválido');
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
    const registerData = { username, email, password };
    this.postRegister(registerData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.infoSubject.next('Registro exitoso, redireccionando...');
        setTimeout(() => {
          window.location.href = '/';
        }, 3500);
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
      },
    });
  }

  forgotPassword(email: string) {
    if (!this.emailRegex.test(email)) {
      this.errorSubject.next('Formato de correo inválido');
      return;
    }

    this.loadingSubject.next('Enviando correo...');
    const emailData = { email: email };

    this.postForgot(emailData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.infoSubject.next(
          'Correo de recuperación enviado. Verifica tu bandeja de entrada.',
        );
        this.errorSubject.next('');
      },
      error: (error) => {
        this.loadingSubject.next('');
        this.errorSubject.next(
          error.status === 401
            ? 'Correo no registrado'
            : error.status === 408
              ? 'Tiempo de espera agotado. Intente nuevamente.'
              : 'Error con el servidor. Intente nuevamente más tarde.',
        );
      },
    });
  }

  forgotChangePassword(password: string, token: string) {
    this.loadingSubject.next('Cambiando contraseña...');
    const passwordData = { password: password, token: token };
    this.postForgotChange(passwordData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.errorSubject.next('');
        this.infoSubject.next('Contraseña cambiada exitosamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3500);
      },
      error: (error) => {
        this.loadingSubject.next('');
        this.errorSubject.next(
          error.status === 401
            ? 'Token inválido o expirado.'
            : error.status === 408
              ? 'Tiempo de espera agotado. Intente nuevamente.'
              : 'Error con el servidor. Intente nuevamente.',
        );
      },
    });
  }

  verifyUser(token: string) {
    this.loadingSubject.next('Verificando...');
    const verifyData = { token: token };
    this.postVerifyUser(verifyData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.errorSubject.next('');
        this.infoSubject.next('Te has verificado correctamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3500);
      },
      error: (error) => {
        this.loadingSubject.next('');
        this.infoSubject.next('Verificación fallida, redireccionando...');
        this.errorSubject.next(
          error.status === 401
            ? 'Token inválido o expirado.'
            : error.status === 408
              ? 'Tiempo de espera agotado. Intente nuevamente.'
              : 'Error con el servidor. Intente nuevamente.',
        );
        setTimeout(() => {
          window.location.href = '/login';
        }, 3500);
      },
    });
  }

  postRegister(data: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    return this.http.post(this.authUrl, data, { headers });
  }

  postLogin(data: { email: string; password: string }): Observable<any> {
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

  postForgotChange(data: { password: string; token: string }): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    return this.http.post(this.forgotChangeUrl, data, { headers });
  }

  postVerifyUser(data: { token: string }): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    return this.http.post(this.verifyUserUrl, data, { headers });
  }
}
