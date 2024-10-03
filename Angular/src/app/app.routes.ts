import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { WrongRouteComponent } from './404/404.component';
import { LoadingComponent } from './loading/loading.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerificationComponent } from './verification/verification.component';
import { ComponentsComponent } from './components/components.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent , pathMatch: 'full' },
  { path: 'login', component: LoginComponent , pathMatch: 'full' },
  { path: 'register', component: RegisterComponent , pathMatch: 'full' },
  { path: 'loading', component: LoadingComponent , pathMatch: 'full' },
  { path: 'login/forgot-password', component: ForgotPasswordComponent , pathMatch: 'full' },
  { path: 'login/verify', component: VerificationComponent , pathMatch: 'full' },

  { path: 'components', component: ComponentsComponent , pathMatch: 'full' }, //FOR TESTING

  // { path: 'profile', component: PerfilComponent , pathMatch: 'full' },

  { path: '**', component: WrongRouteComponent, pathMatch: 'full' },
];
