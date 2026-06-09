import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../../environment/environment';
import {AuthInterceptor} from './auth.interceptor';
import { inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
describe('AuthInterceptor', ()=>{
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('有Token，請求戴上 Authorization header', () => {
    authService.SetToken('fake-token');

    TestBed.inject(HttpClient).get(`${environment.apiUrl}/User`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/User`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush({});
  })

  it('收到401，跳回登入頁面', () => {
    authService.SetToken('fake-token');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    TestBed.inject(HttpClient).get(`${environment.apiUrl}/User`).subscribe({
      error:() =>{}
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/User`);
    req.flush('Unauthorized',{status: 401, statusText: 'Unauthorized'});

    expect(navigateSpy).toHaveBeenCalledWith(['/login'])

  });
})
