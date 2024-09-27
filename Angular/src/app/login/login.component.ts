import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/css/auth.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: string = '';
  error: string = '';
  info: string = '';

  constructor(private authservice: AuthService) {}

  ngOnInit() {
    this.authservice.loading$.subscribe((loading) => {
      this.loading = loading;
    });

    this.authservice.error$.subscribe((error) => {
      this.error = error;
    });

    this.authservice.info$.subscribe((info) => {
      this.info = info;
    });
  }

  login() {
    this.authservice.login(this.email, this.password);
  }
}
