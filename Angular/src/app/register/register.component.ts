import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, LoadingComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/css/auth.css'],
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  passwordconfirm: string = '';
  loading: string = '';
  error: string = '';
  info: string = '';
  type: string = '';
  submitted: boolean = false;

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

  register() {
    this.authservice.register(this.username, this.email, this.password, this.passwordconfirm, this.type);
  }


  // crea funcion preregister
  preregister(){
    this.submitted = true;
    this.authservice.preregister(this.username, this.email, this.password, this.passwordconfirm);
  }
}
