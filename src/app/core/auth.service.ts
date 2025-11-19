import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { API_BASE_URL } from './api.config';
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

  private async sha256Hex(text: string): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  async login(email: string, password: string) {
    // No enviar la contraseña en texto plano: aplicar SHA-256 en cliente
    const hash = await this.sha256Hex(password || '');
    const payload = { email: (email || '').trim(), password: hash };
    const res = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload));
    // Evitar guardar sesión si el backend respondió éxito lógico pero sin token
    if (!res?.token || !res.token.trim()) {
      throw { error: { message: 'Credenciales inválidas' } };
    }
    this.setSession(res);
    this.navCtrl.activateSessionLock();
    return res;
  }

  async register(name: string, email: string, password: string, role?: 'USER' | 'ADMIN' | 'BARBER', barberId?: string) {
    // No enviar la contraseña en texto plano: aplicar SHA-256 en cliente
    const hash = await this.sha256Hex(password || '');
    const payload: any = { name: (name || '').trim(), email: (email || '').trim(), password: hash };
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
    this.navCtrl.deactivateSessionLockAndCleanup();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }

  async requestPasswordReset(email: string) {
    // No exponer si el correo existe; responder genéricamente
    try {
      await firstValueFrom(this.http.post(`${this.baseUrl}/forgot`, { email }));
    } catch {}
    return true;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    // También evitar texto plano en reset: enviar SHA-256
    const hash = await this.sha256Hex(newPassword || '');
    await firstValueFrom(this.http.post(`${this.baseUrl}/reset`, { email: (email || '').trim(), code: (code || '').trim(), newPassword: hash }));
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

  // Las contraseñas ya no se envían en texto plano: se envía SHA-256.
}
