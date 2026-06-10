import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string = '';

  SetToken(token: string){
    this.token = token;
    localStorage.setItem('Token', token);
  }
  GetToken(): string{
    if(!this.token){
      this.token = localStorage.getItem('Token') ??'';
    }
    return this.token;
  }
  Logout() {
    this.token = '';
    localStorage.removeItem('Token');
  }
}
