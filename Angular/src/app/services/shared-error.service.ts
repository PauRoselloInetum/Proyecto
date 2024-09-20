import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedErrorService {
  private errorSubject = new BehaviorSubject<string>('');
  public error$ = this.errorSubject.asObservable();

  constructor() {}

  setError(error: string) {
    this.errorSubject.next(error);
  }
}
