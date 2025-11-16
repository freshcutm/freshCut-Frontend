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
          <input [(ngModel)]="password" name="password" type="password" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div class="flex items-center gap-3">
          <button class="w-full sm:w-auto btn btn-primary" type="submit">Entrar</button>
          <a routerLink="/auth/register" class="text-indigo-600 hover:underline">Crear cuenta</a>
        </div>
      </form>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router, private notifications: NotificationsService) {}

  async login() {
    try {
      const email = (this.email || '').trim();
      const password = this.password || '';
      if (!email || !password) {
        this.notifications.error('Introduce un email y contraseña válidos');
        return;
      }
      const res = await this.auth.login(email, password);
      if (res.role === 'BARBER') this.router.navigateByUrl('/barbero');
      else if (res.role === 'ADMIN') this.router.navigateByUrl('/admin');
      else if (res.role === 'USER') this.router.navigateByUrl('/cliente');
      else this.router.navigateByUrl('/reservas');
    } catch (e: any) {
      this.notifications.error(e?.error?.message || 'No se pudo iniciar sesión');
    }
  }
}