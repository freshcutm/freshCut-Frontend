import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto p-8 bg-white shadow-sm border rounded-lg">
      <h2 class="text-2xl font-semibold mb-2">Recuperar contraseña</h2>
      <p class="text-sm text-gray-600 mb-6">Primero verificaremos si tu gmail tiene cuenta.</p>
      <form (ngSubmit)="submit()" class="space-y-5" *ngIf="state === 'idle'">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input [(ngModel)]="email" name="email" type="email" [disabled]="verifying" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" required />
        </div>
        <button class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" type="submit" [disabled]="verifying">
          {{ verifying ? 'Verificando...' : 'Verificar gmail' }}
        </button>
      </form>
      <div class="text-sm text-gray-600 mt-4">
        <a routerLink="/auth/login" class="text-indigo-600 hover:underline">Volver a iniciar sesión</a>
        <span class="mx-2">·</span>
        <a routerLink="/auth/reset" class="text-indigo-600 hover:underline">Ya tengo el código</a>
      </div>
      <div *ngIf="state === 'missing'" class="mt-4 text-sm bg-yellow-50 text-yellow-800 border border-yellow-200 rounded p-3">
        <div class="mb-3">gmail no encontrado por favor crear cuenta con el gmail o reescribe el gmail</div>
        <div class="flex flex-wrap gap-2">
          <button type="button" (click)="goRegister()" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Crear cuenta</button>
          <button type="button" (click)="rewriteEmail()" class="border px-4 py-2 rounded">Reescribir email</button>
        </div>
      </div>
      <div *ngIf="state === 'exists'" class="mt-4 text-sm bg-green-50 text-green-700 border border-green-200 rounded p-3">
        Email verificado!! Redirigiendo para cambiar contraseña...
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  state: 'idle' | 'missing' | 'exists' = 'idle';
  verifying = false;
  constructor(private auth: AuthService, private router: Router, private notifications: NotificationsService) {}
  async submit() {
    if (this.verifying) return;
    const e = (this.email || '').trim();
    if (!e) return;
    this.verifying = true;
    const exists = await this.auth.checkEmailExists(e);
    this.verifying = false;
    if (!exists) {
      this.state = 'missing';
      this.notifications.error('gmail no encontrado por favor crear cuenta con el gmail o reescribe el gmail');
      return;
    }
    this.state = 'exists';
    setTimeout(() => {
      this.router.navigateByUrl(`/auth/reset?email=${encodeURIComponent(e)}`);
    }, 800);
  }
  goRegister() { this.router.navigateByUrl(`/auth/register?email=${encodeURIComponent((this.email || '').trim())}`); }
  rewriteEmail() { this.state = 'idle'; }
}