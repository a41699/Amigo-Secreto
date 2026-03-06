import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Lê token persistido e anexa apenas nas chamadas da API.
  const token = localStorage.getItem('admin_auth_token') || '';
  const isApiCall = req.url.startsWith('/api/');
  const isLoginCall = req.url.startsWith('/api/auth/login');

  const request = isApiCall && token && !isLoginCall
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error) => {
      if (error?.status === 401) {
        // Se a sessão expirar, limpa dados locais e força novo login.
        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('admin_auth_user');
        router.navigateByUrl('/admin/login');
      }
      return throwError(() => error);
    })
  );
};
