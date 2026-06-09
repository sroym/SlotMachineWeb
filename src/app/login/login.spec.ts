import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Login} from './login';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),

      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
  })

  it('按下登入呼叫/Login API', () => {
    component.Account = 'Roy';
    component.Password = 'password7777';
    component.ClickLogin();
    httpMock.expectOne('http://localhost:5141/Login').flush({
      token: 'fake-token'
    });
    expect(component.Token()).toBe('fake-token');

  });
  it('帳號密碼錯誤，顯示錯誤訊息', () => {
    component.Account = 'Roy';
    component.Password = 'wrongpassword';
    component.ClickLogin();
    httpMock.expectOne('http://localhost:5141/Login').flush(
      'Invalid credentials.',
      {status: 401, statusText: 'Unauthorized'});
    expect(component.ErrorMessage()).toBe('Invalid credentials.');
  });
})
