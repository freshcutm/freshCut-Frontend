import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto p-8 bg-white shadow-sm border rounded-lg">
      <h2 class="text-2xl font-semibold mb-6">Iniciar sesión</h2>
      <form (ngSubmit)="login()" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Contraseña</label>
          <div class="relative">
            <input [(ngModel)]="password" name="password" [type]="showPassword ? 'text' : 'password'" autocomplete="current-password" class="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            <button type="button" (click)="togglePassword()" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.title]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" class="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700">
              <svg *ngIf="!showPassword" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg *ngIf="showPassword" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M4 4l16 16" stroke-linecap="round"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="w-full sm:w-auto btn btn-primary" type="submit" [disabled]="isSubmitting">Entrar</button>
        </div>

        <div *ngIf="showSpinner" class="flex items-center gap-2 text-sm text-gray-600">
          <span class="inline-block w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></span>
          <span>Iniciando sesión...</span>
        </div>
      </form>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isSubmitting = false;
  showSpinner = false;
  private loadingTimeout: any;

  constructor(private auth: AuthService, private router: Router, private notifications: NotificationsService) {}

  async login() {
    try {
      const email = (this.email || '').trim();
      const password = this.password || '';
      if (!email || !password) {
        this.notifications.error('Introduce un email y contraseña válidos');
        return;
      }
      // Validación adicional de formato de email para evitar peticiones 400 por @Valid en backend
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.notifications.error('Email no válido');
        return;
      }
      // Marcar envío y preparar spinner retrasado (2s)
      this.isSubmitting = true;
      this.showSpinner = false;
      this.loadingTimeout = setTimeout(() => {
        if (this.isSubmitting) this.showSpinner = true;
      }, 2000);

      const res = await this.auth.login(email, password);
      if (res.role === 'BARBER') this.router.navigateByUrl('/barbero', { replaceUrl: true });
      else if (res.role === 'ADMIN') this.router.navigateByUrl('/admin', { replaceUrl: true });
      else if (res.role === 'USER') this.router.navigateByUrl('/cliente', { replaceUrl: true });
      else this.router.navigateByUrl('/reservas', { replaceUrl: true });
    } catch (e: any) {
      // Mensaje más claro y guía: si tu cuenta es antigua, recupera la contraseña para migrar al esquema seguro
      const msg = e?.error?.message || 'No se pudo iniciar sesión. Si tu cuenta fue creada antes, usa “Olvidé mi contraseña” para actualizarla y mejorar seguridad.';
      this.notifications.error(msg);
    }
    finally {
      // Limpiar estado de carga
      this.isSubmitting = false;
      this.showSpinner = false;
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}