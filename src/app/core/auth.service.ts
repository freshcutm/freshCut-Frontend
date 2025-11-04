import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse { token: string; email: string; role: 'USER' | 'ADMIN' | 'BARBER'; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private _token = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null);
  private _email = signal<string | null>(typeof localStorage !== 'undefined' ? localStorage.getItem('auth_email') : null);
  private _role = signal<'USER' | 'ADMIN' | 'BARBER' | null>(typeof localStorage !== 'undefined' ? (localStorage.getItem('auth_role') as any) : null);

  isLoggedIn = computed(() => !!this._token());
  role = computed(() => this._role());
  email = computed(() => this._email());

  constructor(private http: HttpClient, private router: Router) {}

  async login(email: string, password: string) {
    const hashed = await this.sha256(password);
    const res = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password: hashed }));
    this.setSession(res);
    return res;
  }

  async register(name: string, email: string, password: string, role?: 'USER' | 'ADMIN' | 'BARBER', barberId?: string) {
    const hashed = await this.sha256(password);
    const payload: any = { name, email, password: hashed };
    if (role) payload.role = role;
    if (role === 'BARBER' && barberId) payload.barberId = barberId;
    const res = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload));
    // No auto-login en registro: el usuario debe iniciar sesión después.
    return res;
  }

  async me() {
    try {
      const res = await firstValueFrom(this.http.get<AuthResponse>(`${this.baseUrl}/me`));
      this._email.set(res.email);
      this._role.set(res.role as any);
    } catch {
      // Si el token no es válido/expiró, cerrar sesión para evitar estados incoherentes
      this.logout();
    }
  }

  logout() {
    this._token.set(null); this._email.set(null); this._role.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_email');
      localStorage.removeItem('auth_role');
    }
    this.router.navigateByUrl('/auth/login');
  }

  async requestPasswordReset(email: string) {
    // No exponer si el correo existe; responder genéricamente
    try {
      await firstValueFrom(this.http.post(`${this.baseUrl}/forgot`, { email }));
    } catch {}
    return true;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    // Mantener hashing cliente como en login/register
    const hashed = await this.sha256(newPassword);
    await firstValueFrom(this.http.post(`${this.baseUrl}/reset`, { email, code, newPassword: hashed }));
    return true;
  }

  private setSession(res: AuthResponse) {
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

  private async sha256(text: string): Promise<string> {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    const bytes = Array.from(new Uint8Array(buf));
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
