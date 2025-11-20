import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto p-8 bg-white shadow-sm border rounded-lg">
      <h2 class="text-2xl font-semibold mb-2">Cambiar contraseña</h2>
      <p class="text-sm text-gray-600 mb-6">Introduce tu email y tu nueva contraseña. No necesitas código.</p>
      <form (ngSubmit)="submit()" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Nueva contraseña</label>
          <div class="relative">
            <input [(ngModel)]="password" name="password" [type]="showPassword ? 'text' : 'password'" autocomplete="new-password" class="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
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
        <div>
          <label class="block text-sm font-medium mb-1">Confirmar contraseña</label>
          <div class="relative">
            <input [(ngModel)]="confirm" name="confirm" [type]="showConfirm ? 'text' : 'password'" autocomplete="new-password" class="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            <button type="button" (click)="toggleConfirm()" [attr.aria-label]="showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'" [attr.title]="showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'" class="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700">
              <svg *ngIf="!showConfirm" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg *ngIf="showConfirm" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M4 4l16 16" stroke-linecap="round"></path>
              </svg>
            </button>
          </div>
        </div>
        <button class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" type="submit">Cambiar contraseña</button>
      </form>
      <div class="text-sm text-gray-600 mt-4">
        ¿No tienes código? <a routerLink="/auth/forgot" class="text-indigo-600 hover:underline">Solicitar recuperación</a>
      </div>
      <div *ngIf="done" class="mt-4 text-sm bg-green-50 text-green-700 border border-green-200 rounded p-3">
        Contraseña actualizada. Ya puedes iniciar sesión.
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  email = '';
  password = '';
  confirm = '';
  showPassword = false;
  showConfirm = false;
  done = false;
  submitting = false;
  constructor(private auth: AuthService, private router: Router, private notifications: NotificationsService) {}
  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }
  async submit() {
    if (this.submitting) return;
    if (!this.email || !this.password || !this.confirm) return;
    if (this.password !== this.confirm) { this.notifications.error('Las contraseñas no coinciden'); return; }
    this.submitting = true;
    try {
      await this.auth.resetPasswordSimple(this.email, this.password);
      this.done = true;
      this.notifications.success('Contraseña actualizada');
      setTimeout(() => this.router.navigateByUrl('/auth/login'), 1200);
    } catch (e: any) {
      this.notifications.error(e?.error?.message || e?.error?.error || 'No se pudo cambiar la contraseña');
    } finally {
      this.submitting = false;
    }
  }
}