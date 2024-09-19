import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingComponent } from '../loading/loading.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/css/auth.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;


  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login() {
    this.loading = true;
    const loginData = {
      email: this.email,
      password: this.password
    };

    this.postLogin(loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso');
        this.cookieService.set('token', response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en el login', error);
        this.loading = false;
      }
    });
  }

  postLogin(data: { email: string; password: string }): Observable<any> {
    const apiUrl = 'https://localhost:7272/api/Controlador/login';

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Allow-Origin': '*'
    });

    return this.http.post(apiUrl, data, { headers });
  }
}
