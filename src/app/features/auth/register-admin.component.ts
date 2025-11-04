import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 class="text-xl font-semibold mb-2">Registro admin (solo desarrollo)</h2>
      <p class="text-sm text-red-600 mb-4">Esta página crea una cuenta con rol ADMIN. Úsala solo en desarrollo.</p>
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
        <button class="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" type="submit">Crear admin</button>
      </form>

      <div class="text-sm text-gray-600 mt-4">
        ¿Quieres una cuenta normal? <a routerLink="/auth/register" class="text-indigo-600 hover:underline">Registro de usuario</a>
      </div>
      <div class="text-sm text-gray-600">
        ¿Eres barbero? <a routerLink="/auth/register/barbero" class="text-indigo-600 hover:underline">Registro de barbero</a>
      </div>
    </div>
  `
})
export class RegisterAdminComponent {
  name = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    try {
      await this.auth.register(this.name, this.email, this.password, 'ADMIN');
      alert('Cuenta admin creada. Ahora inicia sesión.');
      this.router.navigateByUrl('/auth/login');
    } catch (e: any) {
      alert(e?.error?.message || e?.error?.error || e?.message || 'No se pudo registrar');
    }
  }
}