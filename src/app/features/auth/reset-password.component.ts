import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto p-8 bg-white shadow-sm border rounded-lg">
      <h2 class="text-2xl font-semibold mb-2">Cambiar contraseña</h2>
      <p class="text-sm text-gray-600 mb-6">Introduce tu email, el código recibido y tu nueva contraseña.</p>
      <form (ngSubmit)="submit()" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Código</label>
          <input [(ngModel)]="code" name="code" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Nueva contraseña</label>
          <input [(ngModel)]="password" name="password" type="password" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Confirmar contraseña</label>
          <input [(ngModel)]="confirm" name="confirm" type="password" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
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
  code = '';
  password = '';
  confirm = '';
  done = false;
  submitting = false;
  constructor(private auth: AuthService, private router: Router) {}
  async submit() {
    if (this.submitting) return;
    if (!this.email || !this.code || !this.password || !this.confirm) return;
    if (this.password !== this.confirm) { alert('Las contraseñas no coinciden'); return; }
    this.submitting = true;
    try {
      await this.auth.resetPassword(this.email, this.code, this.password);
      this.done = true;
      setTimeout(() => this.router.navigateByUrl('/auth/login'), 1200);
    } catch (e: any) {
      alert(e?.error?.message || e?.error?.error || 'No se pudo cambiar la contraseña');
    } finally {
      this.submitting = false;
    }
  }
}