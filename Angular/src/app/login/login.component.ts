import { Component } from '@angular/core';
import { MatButtonModule} from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  valid: boolean = true;
  error: string = '';

  constructor(private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  onSubmit() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    if (this.loginForm.valid) {
      console.log('Email:', email);
      console.log('Password:', password);

      this.router.navigate(['/profile']);

    } else {
      this.valid = false;

      if (email === '' || password === '') {
        this.error = 'Rellena todos los campos';
      }

      else if (password.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres';
      }

      else if (!email.valid) {
        this.error = 'El correo no es válido';
      }


    }
  }
}
