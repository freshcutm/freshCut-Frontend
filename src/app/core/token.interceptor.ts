import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { API_BASE_URL, API_ORIGIN } from './api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Solo añade Authorization para llamadas al backend propio.
  // Evita adjuntar el header en dominios externos (p.ej., exchangerate.host),
  // que rechazan 'authorization' en CORS y provocan errores de preflight.
  // Detecta llamadas a nuestro backend dinámicamente
  const isBackendRequest = req.url.startsWith(API_BASE_URL) || req.url.startsWith(API_ORIGIN);

  if (token && isBackendRequest) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
//forzar commit