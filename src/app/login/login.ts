import {Component, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import {environment} from '../../environment/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'login',
  imports: [FormsModule],
  templateUrl: './login.html',
  standalone: true,
})
export class Login {
  username: string = '';
  Password: string = '';

  ErrorMessage = signal('');

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) {}
  ClickLogin() {
    this.http
      .post(`${environment.apiUrl}/Login`, {
        username: this.username,
        password: this.Password,
      }, {responseType: "text"})
      .subscribe({
        next: (res: any) => {
          this.authService.SetToken(res);
          this.router.navigate(['/slot']);
        },
        error: (err) => {
          this.ErrorMessage.set(err.error);
        },
      });
  }
}
