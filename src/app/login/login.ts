import {Component} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'login',
  template: ``,
})
export class Login {
  Account: string = '';
  Password: string = '';

  constructor(private http: HttpClient) {}
  ClickLogin() {
    this.http.post('http://localhost:5141/Login', {
      account: this.Account,
      password: this.Password
    }).subscribe();
  }
}
