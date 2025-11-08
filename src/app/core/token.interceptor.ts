import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Solo añade Authorization para llamadas al backend propio.
  // Evita adjuntar el header en dominios externos (p.ej., exchangerate.host),
  // que rechazan 'authorization' en CORS y provocan errores de preflight.
  const isBackendRequest = req.url.startsWith('http://localhost:8080') || req.url.startsWith('http://localhost:8081');

  if (token && isBackendRequest) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};