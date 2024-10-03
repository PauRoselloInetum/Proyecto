import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoadingComponent } from "../loading/loading.component";

import { AuthService } from "../auth.service";

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [LoadingComponent],
  templateUrl: './verification.component.html',
  styleUrl: '../../assets/css/auth.css'
})
export class VerificationComponent {
  loading: string = '';
  error: string = '';
  info: string = '';
  token: string = '';

  constructor(
    private authservice: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.authservice.loading$.subscribe((loading) => {
      this.loading = loading;
    });

    this.authservice.info$.subscribe((info) => {
      this.info = info;
    });

    this.route.queryParams.subscribe((params) => {
      this.token = params['t'];
    });

    if (!this.token) {
      this.info = 'Token inválido o expirado. Redireccionando...';
      setTimeout(() => {
        window.location.href = '/login';
      }, 3500);
      return;
    }
    this.authservice.verifyUser(this.token);
  }
}
