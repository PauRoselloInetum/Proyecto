import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WrongRouteComponent } from './404/404.component';
import { LoadingComponent } from './loading/loading.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerificationComponent } from './verification/verification.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login' , pathMatch: 'full' },
  { path: 'login', component: LoginComponent , pathMatch: 'full' },
  { path: 'register', component: RegisterComponent , pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent , pathMatch: 'full' },
  { path: 'login/reset-password', component: ResetPasswordComponent , pathMatch: 'full' },
  { path: 'login/forgot-password', component: ForgotPasswordComponent , pathMatch: 'full' },
  { path: 'login/verify', component: VerificationComponent , pathMatch: 'full' },
  // { path: 'profile', component: PerfilComponent , pathMatch: 'full' },

  { path: '**', component: WrongRouteComponent, pathMatch: 'full' },
];
