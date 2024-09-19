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
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, LoadingComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/css/auth.css'],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  passwordconfirm: string = '';
  loading: boolean = false;
  error: string = '';
  info: string = '';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {}

  register() {
    this.loading = true;
    const loginData = {
      email: this.email,
      password: this.password,
      passwordconfirm: this.passwordconfirm,
    };
    console.log(this.passwordconfirm, this.password)

    if (!this.email || !this.password || !this.passwordconfirm){
      this.loading = false;
      this.error = "Correo y/o contraseñas vacias"
      return
    }

    if (this.password !== this.passwordconfirm){
      this.loading = false;
      this.error = "Las contraseñas no coinciden"
      return
    }

    this.postLogin(loginData).subscribe({
      next: (response) => {
        this.cookieService.set('token', response);
        this.error = '';
        this.loading = false;
        this.info = 'Login exitoso, redireccionando...';
        setTimeout(() =>
          {
            window.location.href = '/';
          },
          1500);
      },
      error: (error) => {
        if (error.status === 401 ){
          this.error = "Usuario ya registrado"
        }
        else {
          this.error = "Error con Servidor. Prueba otra vez."
        }
        this.loading = false;
      },
    });
  }

  postLogin(data: { email: string; password: string }): Observable<any> {
    const apiUrl = 'https://localhost:7272/api/registro';

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Allow-Origin': '*',
    });

    return this.http.post(apiUrl, data, { headers });
  }
}
