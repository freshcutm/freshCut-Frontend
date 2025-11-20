import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { API_BASE_URL } from './api.config';
import { sha256Hex } from './crypto.util';
import { NavigationControlService } from './navigation-control.service';

interface AuthResponse { token: string; email: string; role: 'USER' | 'ADMIN' | 'BARBER'; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${API_BASE_URL}/auth`;
  private _token = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null);
  private _email = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem('auth_email') : null);
  private _role = signal<'USER' | 'ADMIN' | 'BARBER' | null>(typeof localStorage !== 'undefined' ? (localStorage.getItem('auth_role') as any) : null);

  isLoggedIn = computed(() => !!this._token());
  role = computed(() => this._role());
  email = computed(() => this._email());

  constructor(private http: HttpClient, private router: Router, private navCtrl: NavigationControlService) {}

  async login(email: string, password: string) {
    const emailNorm = (email || '').trim().toLowerCase();
    let passwordSha = '';
    try {
      // Hash de contraseña en el cliente; no enviar texto plano en la solicitud
      passwordSha = await sha256Hex(password || '');
    } catch {
      // Si el navegador no soporta Web Crypto, no enviar la contraseña
      // y avisar claramente al usuario para proteger su privacidad
      throw { error: { message: 'Tu navegador no soporta cifrado local. No enviaremos tu contraseña en texto plano. Actualiza el navegador para iniciar sesión de forma segura.' } };
    }
    // Enviar únicamente el hash, nunca el campo "password" en el payload
    const payload: any = { email: emailNorm, passwordSha256: passwordSha };
    const res = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload, { withCredentials: true }));
    // Evitar guardar sesión si el backend respondió éxito lógico pero sin token
    if (!res?.token || !res.token.trim()) {
      throw { error: { message: 'Credenciales inválidas' } };
    }
    this.setSession(res);
    this.navCtrl.activateSessionLock();
    return res;
  }

  async register(name: string, email: string, password: string, role?: 'USER' | 'ADMIN' | 'BARBER', barberId?: string) {
    const payload: any = { name: (name || '').trim(), email: (email || '').trim().toLowerCase(), password };
    if (role) payload.role = role;
    if (role === 'BARBER' && barberId) payload.barberId = barberId;
    const res = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload, { withCredentials: true }));
    // No auto-login en registro: el usuario debe iniciar sesión después.
    return res;
  }

  async me() {
    try {
      const res = await firstValueFrom(this.http.get<AuthResponse>(`${this.baseUrl}/me`, { withCredentials: true }));
      this._email.set(res.email);
      this._role.set(res.role as any);
    } catch {
      // Si el token no es válido/expiró, cerrar sesión para evitar estados incoherentes
      this.logout();
    }
  }

  logout() {
    try { this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).subscribe({}); } catch {}
    this._token.set(null); this._email.set(null); this._role.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_role');
    }
    this.navCtrl.deactivateSessionLockAndCleanup();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  async requestPasswordReset(email: string) {
    // No exponer si el correo existe; responder genéricamente
    try {
      await firstValueFrom(this.http.post(`${this.baseUrl}/forgot`, { email }, { withCredentials: true }));
    } catch {}
    return true;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    await firstValueFrom(this.http.post(`${this.baseUrl}/reset`, { email: (email || '').trim().toLowerCase(), code: (code || '').trim(), newPassword }, { withCredentials: true }));
    return true;
  }

  async resetPasswordSimple(email: string, newPassword: string) {
    await firstValueFrom(this.http.post(`${this.baseUrl}/reset-simple`, { email: (email || '').trim().toLowerCase(), newPassword }, { withCredentials: true }));
    return true;
  }

  private setSession(res: AuthResponse) {
    if (!res?.token || !res.token.trim()) return; // no persistir sesiones inválidas
    this._token.set(res.token);
    this._email.set(res.email);
    this._role.set(res.role);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_email', res.email);
      localStorage.setItem('auth_role', res.role);
    }
  }

  getToken() { return this._token(); }

  // En login se envía también SHA-256 opcional (passwordSha256) para mayor protección.
}
