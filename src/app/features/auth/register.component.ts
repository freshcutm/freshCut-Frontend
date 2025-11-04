import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto p-8 bg-white shadow-sm border rounded-lg">
      <h2 class="text-2xl font-semibold mb-6">Crear cuenta</h2>
      <form (ngSubmit)="register()" class="space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1">Nombre</label>
          <input [(ngModel)]="name" name="name" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input [(ngModel)]="email" name="email" type="email" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Contraseña</label>
          <input [(ngModel)]="password" name="password" type="password" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div class="flex items-center gap-3">
          <button class="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" type="submit">Crear cuenta</button>
          <a routerLink="/auth/register/barbero" class="text-indigo-600 hover:underline">Soy barbero</a>
        </div>
      </form>
    </div>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    try {
      await this.auth.register(this.name, this.email, this.password);
      alert('Cuenta creada correctamente. Ahora inicia sesión.');
      this.router.navigateByUrl('/auth/login');
    } catch (e: any) {
      alert(e?.error?.message || e?.error?.error || e?.message || 'No se pudo registrar');
    }
  }
}