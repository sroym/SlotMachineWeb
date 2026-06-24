import { TestBed } from '@angular/core/testing';
import {AuthService} from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });
  it('存入token，可以取出來', () => {
    service.SetToken('fake-token');
    expect(service.GetToken()).toBe('fake-token');
  });
  it('登出後token被清除', () => {
    service.SetToken('fake-token');
    service.Logout();
    expect(service.GetToken()).toBe('');
  });
})
