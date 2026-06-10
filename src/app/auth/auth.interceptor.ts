import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
export const  AuthInterceptor: HttpInterceptorFn = ((req, next) => {
  const authService = inject(AuthService);
  const token = authService.GetToken();
  const router = inject(Router);
  if(token){
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      }
    });
    return next(cloned).pipe(
      catchError((err) => {
        if(err.status === 401){
          router.navigate(['/login']);
          authService.Logout();
        }
        return throwError(() => err);
      })
    );
  }
  return next(req);
});
