import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto p-8 bg-white shadow-sm border rounded-lg">
      <h2 class="text-2xl font-semibold mb-2">Recuperar contraseña</h2>
      <p class="text-sm text-gray-600 mb-6">Introduce tu email y te enviaremos instrucciones si la cuenta existe.</p>
      <form (ngSubmit)="submit()" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <button class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" type="submit">Enviar enlace</button>
      </form>
      <div class="text-sm text-gray-600 mt-4">
        <a routerLink="/auth/login" class="text-indigo-600 hover:underline">Volver a iniciar sesión</a>
        <span class="mx-2">·</span>
        <a routerLink="/auth/reset" class="text-indigo-600 hover:underline">Ya tengo el código</a>
      </div>
      <div *ngIf="sent" class="mt-4 text-sm bg-green-50 text-green-700 border border-green-200 rounded p-3">
        Si el correo existe, te hemos enviado instrucciones.
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  sent = false;
  constructor(private auth: AuthService) {}
  async submit() {
    try {
      await this.auth.requestPasswordReset(this.email);
    } catch {}
    this.sent = true;
  }
}