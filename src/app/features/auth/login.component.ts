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
    <div class="max-w-xl mx-auto p-10 bg-white shadow-lg border border-indigo-100 rounded-2xl">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold tracking-tight">Bienvenido a FreshCut</h2>
        <p class="text-sm text-gray-600 mt-2">Nos alegra verte. Inicia sesión para reservar y disfrutar del asistente IA.</p>
      </div>
      <h3 class="text-xl font-semibold mb-6">Iniciar sesión</h3>
      <form (ngSubmit)="login()" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="w-full border rounded px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Contraseña</label>
          <div class="relative">
            <input [(ngModel)]="password" name="password" [type]="showPassword ? 'text' : 'password'" autocomplete="current-password" class="w-full border rounded px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            <button type="button" (click)="togglePassword()" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.title]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
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
          <button class="w-full sm:w-auto btn btn-primary px-6 py-3 text-base" type="submit" [disabled]="isSubmitting">Entrar</button>
        </div>

        <div *ngIf="showSpinner" class="flex items-center gap-2 text-sm text-gray-600">
          <span class="inline-block w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></span>
          <span>Iniciando sesión...</span>
        </div>
      </form>
      <div class="text-sm text-gray-600 mt-4">
        <a routerLink="/auth/forgot" class="text-indigo-600 hover:underline">¿Olvidaste tu contraseña?</a>
      </div>
    </div>

    <!-- Modal de migración: si el login falla, ofrecer cambio de contraseña seguro -->
    <div *ngIf="showMigrationDialog" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-md w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-3">Actualizar contraseña para mayor seguridad</h3>
        <p class="text-sm text-gray-600 mb-4">Tu cuenta necesita actualizar la contraseña para iniciar sesión sin enviar texto plano. No se enviará tu contraseña en el payload.</p>
        <form (ngSubmit)="migratePassword()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nueva contraseña</label>
            <input [(ngModel)]="newPassword" name="newPassword" type="password" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Confirmar contraseña</label>
            <input [(ngModel)]="confirmPassword" name="confirmPassword" type="password" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div class="text-xs text-gray-500">Debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.</div>
          <div class="flex items-center gap-3 mt-2">
            <button class="btn btn-primary" type="submit" [disabled]="isMigrating">{{ isMigrating ? 'Actualizando...' : 'Actualizar y entrar' }}</button>
            <button type="button" class="btn btn-secondary" (click)="cancelMigration()" [disabled]="isMigrating">Cancelar</button>
          </div>
        </form>
      </div>
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
  // Estado de migración
  showMigrationDialog = false;
  newPassword = '';
  confirmPassword = '';
  isMigrating = false;

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
      if (res.role === 'BARBER') this.router.navigateByUrl('/home', { replaceUrl: true });
      else if (res.role === 'ADMIN') this.router.navigateByUrl('/admin', { replaceUrl: true });
      else if (res.role === 'USER') this.router.navigateByUrl('/home', { replaceUrl: true });
      else this.router.navigateByUrl('/reservas', { replaceUrl: true });
    } catch (e: any) {
      // Si las credenciales son inválidas, ofrecer migración inmediata
      const msg = e?.error?.message || '';
      if ((msg || '').toLowerCase().includes('credenciales inválidas')) {
        this.showMigrationDialog = true;
      } else {
        const fallback = 'No se pudo iniciar sesión. Si tu cuenta fue creada antes, usa “Olvidé mi contraseña” para actualizarla y mejorar seguridad.';
        this.notifications.error(msg || fallback);
      }
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

  async migratePassword() {
    try {
      const email = (this.email || '').trim().toLowerCase();
      const pw = this.newPassword || '';
      const confirm = this.confirmPassword || '';
      if (!pw || pw !== confirm) {
        this.notifications.error('Las contraseñas no coinciden');
        return;
      }
      // Reglas de fuerza
      const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
      if (!strong) {
        this.notifications.error('Contraseña inválida: mínimo 8, mayúscula, minúscula, número y símbolo');
        return;
      }
      this.isMigrating = true;
      await this.auth.resetPasswordSimple(email, pw);
      // Intentar login de nuevo sin enviar texto plano (solo hash)
      const res = await this.auth.login(email, pw);
      this.showMigrationDialog = false;
      if (res.role === 'BARBER') this.router.navigateByUrl('/home', { replaceUrl: true });
      else if (res.role === 'ADMIN') this.router.navigateByUrl('/admin', { replaceUrl: true });
      else if (res.role === 'USER') this.router.navigateByUrl('/home', { replaceUrl: true });
      else this.router.navigateByUrl('/reservas', { replaceUrl: true });
    } catch (e: any) {
      const msg = e?.error?.message || 'No fue posible actualizar la contraseña. Intenta nuevamente o usa “Olvidé mi contraseña”.';
      this.notifications.error(msg);
    } finally {
      this.isMigrating = false;
    }
  }

  cancelMigration() {
    this.showMigrationDialog = false;
    this.newPassword = '';
    this.confirmPassword = '';
  }
}