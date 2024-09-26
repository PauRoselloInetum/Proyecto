import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './../../assets/css/loading.css',
})
export class LoadingComponent {
  loading: string = '';

  constructor(private authservice: AuthService){}

  ngOnInit() {
    this.authservice.loading$.subscribe((loading) => {
      this.loading = loading;
    });
  }
}
