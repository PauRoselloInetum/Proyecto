import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // PROPIEDADES DE LA CLASE AUTHSERVICE
  // URLs 
  backendUrl = 'https://localhost:7272/api/';
  loginUrl = this.backendUrl + 'login';
  registerUrl = this.backendUrl + 'register';
  validateUrl = this.backendUrl + 'home';
  forgotUrl = this.backendUrl + 'forgotPassword';
  authUrl: string = '';
  error: string = '';
  info: string = '';

  // Obtener token de sesión almacenado en las cookies
  session: string = this.cookieService.get('token');
  loading: string = '';

  // Para validar el formato del correo y la complejidad de la password
  emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%_*?&.]{8,}$/;
  
  // BehaviorSubjects que almacenan el valor actual de estos estados y emiten cambios a los observadores correspondientes (email$ / error$ / info$ / loading$)
  private emailSubject = new BehaviorSubject<string>('');
  email$ = this.emailSubject.asObservable();

  private errorSubject = new BehaviorSubject<string>('');
  error$ = this.errorSubject.asObservable();

  private infoSubject = new BehaviorSubject<string>('');
  info$ = this.infoSubject.asObservable();

  private loadingSubject = new BehaviorSubject<string>('');
  loading$ = this.loadingSubject.asObservable();

  // CONSTRUCTOR DE LA CLASE AUTHSERVICE - constructor vacío
  constructor(private http: HttpClient, private cookieService: CookieService,) {

  }

  // MÉTODOS
  // Método login para autenticar al usuario
  login(email: string, password: string): void {
    // Variables de la función
    this.loadingSubject.next('Iniciando Sesión...');
    this.authUrl = this.loginUrl;
    const loginData = { email, password };

    // Autenticación:
    this.postAuth(loginData).subscribe({
      // Si es exitosa, almacena el token en cookies y sale el mensaje de redirección, no hay error
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.infoSubject.next('Inicio de sesión exitoso, redireccionando...');
      },

      // Si no es exitosa, error. No se almacenan cookies y sale el mensaje de error
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

  // Método register para registrar un nuevo usuario
  register(email: string, password: string, passwordconfirm: string): void {
    // Si el email introducido no cumple las normas de la PROPIEDAD 'emailRegex', error
    if (!this.emailRegex.test(email)) {
      this.errorSubject.next('Formato de correo inválido');
      return;
    }

    // Si la password introducida en el segundo campo no coincide con la del primer campo, error
    if (password !== passwordconfirm) {
      this.errorSubject.next('Las contraseñas no coinciden');
      return;
    }

    // Si la password introducida no cumple las normas de la PROPIEDAD 'passwordRegex', error
    if (!this.passwordRegex.test(password)) {
      this.errorSubject.next(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
      );
      return;
    }

    // Si no entra en ningun condicional, cumple con las normas Regex. Carga las URLs
    this.loadingSubject.next('Registrándote...');
    this.authUrl = this.registerUrl;
    const registerData = { email, password };
    this.postAuth(registerData).subscribe({
      // CORRECTO - El usuario no estaba registrado y el registro es exitoso
      next: (response) => {
        this.loadingSubject.next('');
        this.cookieService.set('token', response);
        this.errorSubject.next('');
        this.infoSubject.next('Registro exitoso, redireccionando...');
      },
      // ERROR - el usuario ya estaba registrado en la DB, o el tiempo de espera se ha agotado, o hay un error con el servidor
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

  // Método validateSession para validar el token de sesión actual
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

  // Método forgotPassword para que el usuario pueda registrar una nueva password
  forgotPassword(email: string) {
    // Se envia un corrreo al email del usuario
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

  // Métodos secundarios postAuth / postValidate / postForgot para facilitar código y llamarlas dentro de los métodos principales. Realizan solicitudes HHTP POST con los headers apropiados

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
