import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-register-barber',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 class="text-xl font-semibold mb-4">Registro de barbero</h2>
      <form (ngSubmit)="register()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Nombre</label>
          <input [(ngModel)]="name" name="name" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Contraseña</label>
          <input [(ngModel)]="password" name="password" type="password" class="w-full border rounded px-3 py-2" required />
        </div>

        <p class="text-xs text-gray-500">Se creará automáticamente tu perfil de barbero.</p>
        <button class="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" type="submit">Crear cuenta de barbero</button>
        <div class="text-sm text-gray-600 mt-3">
          ¿Quieres crear una cuenta normal? <a routerLink="/auth/register" class="text-indigo-600 hover:underline">Registrarme como usuario</a>
        </div>
      </form>
    </div>
  `
})
export class RegisterBarberComponent {
  name = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router, private notifications: NotificationsService) {}

  async register() {
    try {
      await this.auth.register(this.name, this.email, this.password, 'BARBER');
      this.notifications.success('Cuenta de barbero creada. Ahora inicia sesión.');
      this.router.navigateByUrl('/auth/login');
    } catch (e: any) {
      this.notifications.error(e?.error?.message || e?.error?.error || e?.message || 'No se pudo registrar');
    }
  }
}