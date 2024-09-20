import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingComponent } from '../loading/loading.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/css/auth.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  info: string = '';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  ngOnInit() {
    if (this.cookieService.get('token')) {
      this.info = 'Ya estas logeado, redireccionando...';
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  }

  login() {
    this.loading = true;
    const loginData = {
      email: this.email,
      password: this.password,
    };

    this.postLogin(loginData).subscribe({
      next: (response) => {
        this.cookieService.set('token', response);
        this.error = '';
        this.loading = false;
        this.info = 'Login exitoso, redireccionando...';
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      },
      error: (error) => {
        if (error.status === 401) {
          this.error = 'Usuario o Contraseña Incorrectas.';
        } else {
          this.error = 'Error con Servidor. Prueba otra vez.';
        }
        this.loading = false;
      },
    });
  }

  postLogin(data: { email: string; password: string }): Observable<any> {
    const apiUrl = 'https://localhost:7272/api/login';

    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Allow-Origin': '*',
    });

    return this.http.post(apiUrl, data, { headers });
  }
}
