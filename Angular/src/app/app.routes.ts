import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WrongRouteComponent } from './404/404.component';
import { LoadingComponent } from './loading/loading.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login' , pathMatch: 'full' },
  { path: 'login', component: LoginComponent , pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent , pathMatch: 'full' },
  // { path: 'login/verify', component: VerificationComponent , pathMatch: 'full' },
  // { path: 'profile', component: PerfilComponent , pathMatch: 'full' },

  { path: '**', component: WrongRouteComponent, pathMatch: 'full' },
];
