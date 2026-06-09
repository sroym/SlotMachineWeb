import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string = '';

  SetToken(token: string){
    this.token = token;
  }
  GetToken(): string{
    return this.token;
  }
}
