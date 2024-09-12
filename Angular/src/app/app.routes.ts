import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PerfilComponent } from './perfil/perfil.component';
import { VerificationComponent } from './verification/verification.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent , pathMatch: 'full' },
  { path: 'login/verify', component: VerificationComponent , pathMatch: 'full' },
  { path: 'profile', component: PerfilComponent , pathMatch: 'full' },
];
