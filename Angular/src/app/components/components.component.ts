import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [FormsModule, LoadingComponent, HttpClientModule],
  templateUrl: './components.component.html',
  styleUrl: './components.component.css'
})
export class ComponentsComponent {
  loggedIn: boolean = false;
  deleteuser: boolean = false;
  deleteemail: string = "";
  sessionemail: string = "";
  loading: boolean = false;
  error: string = "";
  info: string = "";

  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
  ) {}
  ngOnInit() {
      if (this.cookieService.get('token')) {
        this.loggedIn = true
      }
  }

  clearCookies(){
    this.cookieService.deleteAll()
    this.loggedIn = false
  }

  borraruser(){
    this.deleteuser = false
    this.loading = true;
    email: String;
    const loginData = {
      email: this.deleteemail,
    };

    this.DeleteUser(loginData).subscribe({
      next: (response) => {
        this.error = '';
        this.loading = false;
        this.info = 'Usuario Eliminado Correctamente';
        this.deleteemail = ""
        setTimeout(() =>
          {
            this.info = ""
          },
          3000);
      },
      error: (error) => {
        this.error = "Ha habido algun error..."
        this.loading = false;
      },
    });
  }
  DeleteUser(data: { email: string }): Observable<any> {
    const apiUrl = 'https://localhost:7272/api/eliminarUsuario';

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Allow-Origin': '*',
    });

    return this.http.request('delete', apiUrl, { headers, body: data });
  }
}
