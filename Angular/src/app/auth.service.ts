import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly BASE_URL = 'https://localhost:7272/api/';
  private readonly LOGIN_URL = `${this.BASE_URL}login`;
  private readonly REGISTER_URL = `${this.BASE_URL}register`;
  private readonly VALIDATE_URL = `${this.BASE_URL}home`;
  private readonly VERIFY_URL = `${this.BASE_URL}verifyAccount`;
  private readonly FORGOT_URL = `${this.BASE_URL}forgotPassword`;
  private readonly FORGOT_CHANGE_URL = `${this.BASE_URL}changePass`;
  authUrl: string = '';
  error: string = '';
  info: string = '';
  session: string = this.cookieService.get('token');
  loading: string = '';
  submitted: boolean = false;

  emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,}$/;
  usernameRegex = /^[a-z0-9._-]{6,}$/;

  headers = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });

  private emailSubject = new BehaviorSubject<string>('');
  email$ = this.emailSubject.asObservable();

  private errorSubject = new BehaviorSubject<string>('');
  error$ = this.errorSubject.asObservable();

  private infoSubject = new BehaviorSubject<string>('');
  info$ = this.infoSubject.asObservable();

  private loadingSubject = new BehaviorSubject<string>('');
  loading$ = this.loadingSubject.asObservable();

  private submittedSubject = new BehaviorSubject<boolean>(false);
  submitted$ = this.submittedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
  ) {}

  private areFieldsComplete(fields: { [key: string]: any }): boolean {
    for (const value of Object.values(fields)) {
      if (!value) {
        this.errorSubject.next('Todos los campos deben estar completos.');
        return false;
      }
    }
    return true;
  }


  private isValidEmail(email: string): boolean {
    return (
      this.emailRegex.test(email) ||
      (this.errorSubject.next('Formato de correo inválido.'), false)
    );
  }
  private isValidPassword(password: string): boolean {
    return (
      this.passwordRegex.test(password) ||
      (this.errorSubject.next(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
      ),
      false)
    );
  }
  private isValidUsername(username: string): boolean {
    return (
      this.usernameRegex.test(username) ||
      (this.errorSubject.next('Formato de usuario inválido.'), false)
    );
  }
  private EqualPasswords(password: string, passwordconfirm: string): boolean {
    return (
      password === passwordconfirm ||
      (this.errorSubject.next('Las contraseñas no coinciden.'), false)
    );
  }

  login(email: string, password: string): void {
    if (
      !this.areFieldsComplete({ email, password }) ||
      !this.isValidEmail(email) ||
      !this.isValidPassword(password)
    ) {
      return;
    }

    this.loadingSubject.next('Iniciando Sesión...');
    this.authUrl = this.LOGIN_URL;

    const loginData = { email, password };

    this.postLogin(loginData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.infoSubject.next('Inicio de sesión exitoso, redireccionando...');
        setTimeout(() => {
          this.router.navigate(['/']);
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

  preregister(
    username: string,
    email: string,
    password: string,
    passwordconfirm: string,
  ) {
    this.errorSubject.next('');

    if (
      !this.areFieldsComplete({ username, email, password, passwordconfirm }) ||
      !this.isValidEmail(email) ||
      !this.isValidUsername(username) ||
      !this.isValidPassword(password) ||
      !this.EqualPasswords(password, passwordconfirm)
    ) {
      return;
    }

    this.submittedSubject.next(true);
  }

  register(
    username: string,
    email: string,
    password: string,
    type: string,
  ): void {
    if (!this.areFieldsComplete({ type })){
      return
    }
    this.loadingSubject.next('Registrándote...');
    this.authUrl = this.REGISTER_URL;
    const registerData = { username, email, password, type };
    this.postRegister(registerData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.infoSubject.next('Registro exitoso, redireccionando...');
        setTimeout(() => {
          this.router.navigate(['/']);
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
        this.router.navigate(['/login']);
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
          error.status === 404
            ? 'Correo no registrado'
            : error.status === 408
              ? 'Tiempo de espera agotado. Intente nuevamente.'
              : 'Error con el servidor. Intente nuevamente más tarde.',
        );
      },
    });
  }

  forgotChangePassword(password: string, token: string) {
    if (!this.passwordRegex.test(password)) {
      this.errorSubject.next(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
      );
      return;
    }

    this.loadingSubject.next('Cambiando contraseña...');
    const passwordData = { password: password, token: token };
    this.postForgotChange(passwordData).subscribe({
      next: (response) => {
        this.loadingSubject.next('');
        this.errorSubject.next('');
        this.infoSubject.next('Contraseña cambiada exitosamente.');
        setTimeout(() => {
          this.router.navigate(['/login']);
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
          this.router.navigate(['/login']);
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
          this.router.navigate(['/login']);
        }, 3500);
      },
    });
  }

  postRegister(data: {
    username: string;
    email: string;
    password: string;
    type: string;
  }): Observable<any> {
    const headers = this.headers;
    return this.http.post(this.authUrl, data, { headers });
  }

  postLogin(data: { email: string; password: string }): Observable<any> {
    const headers = this.headers;
    return this.http.post(this.authUrl, data, { headers });
  }

  postValidate(data: { token: string }): Observable<any> {
    const headers = this.headers;
    return this.http.post(this.VALIDATE_URL, data, { headers });
  }

  postForgot(data: { email: string }): Observable<any> {
    const headers = this.headers;
    return this.http.post(this.FORGOT_URL, data, { headers });
  }

  postForgotChange(data: { password: string; token: string }): Observable<any> {
    const headers = this.headers;
    return this.http.post(this.FORGOT_CHANGE_URL, data, { headers });
  }

  postVerifyUser(data: { token: string }): Observable<any> {
    const headers = this.headers;
    return this.http.post(this.VERIFY_URL, data, { headers });
  }
}
