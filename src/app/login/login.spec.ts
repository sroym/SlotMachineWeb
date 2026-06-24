import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Login} from './login';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import {routes} from '../app.routes';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../environment/environment';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });
  afterEach(() => {
    httpMock.verify();
  })

  it('按下登入呼叫/Login API', () => {
    component.username = 'Roy';
    component.Password = 'password7777';
    component.ClickLogin();
    httpMock.expectOne(`${environment.apiUrl}/Login`).flush('fake-token');
    expect(authService.GetToken()).toBe('fake-token');
  });
  it('登入成功後跳到/slot', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.username = 'Roy';
    component.Password = 'password7777';
    component.ClickLogin();
    httpMock.expectOne(`${environment.apiUrl}/Login`).flush('fake-token');
    expect(navigateSpy).toHaveBeenCalledWith(['/slot']);
  });
  it('帳號密碼錯誤，顯示錯誤訊息', () => {
    component.username = 'Roy';
    component.Password = 'wrongpassword';
    component.ClickLogin();
    httpMock.expectOne(`${environment.apiUrl}/Login`).flush(
      'Invalid credentials',
      {status: 401, statusText: 'Unauthorized'});
    expect(component.ErrorMessage()).toBe('Invalid credentials');
  });
})
