import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificationsService } from '../../ui/notifications.service';

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
          <p class="mt-1 text-xs" [ngClass]="isStrongPassword(password) ? 'text-gray-500' : 'text-red-600'">
            Debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial.
          </p>
        </div>
        <button class="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" type="submit" [disabled]="isSubmitting">Crear admin</button>
        <div *ngIf="showSpinner" class="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <span class="inline-block w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></span>
          <span>Creando cuenta admin...</span>
        </div>
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
  isSubmitting = false;
  showSpinner = false;
  private loadingTimeout: any;

  constructor(private auth: AuthService, private router: Router, private notifications: NotificationsService) {}

  async register() {
    // Validación de contraseña fuerte: mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
    if (!this.isStrongPassword(this.password)) {
      this.notifications.error('No se pudo crear cuenta: contraseña inválida. Debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial.');
      return;
    }
    try {
      this.isSubmitting = true;
      this.showSpinner = false;
      this.loadingTimeout = setTimeout(() => { if (this.isSubmitting) this.showSpinner = true; }, 1500);
      await this.auth.register(this.name, this.email, this.password, 'ADMIN');
      this.notifications.success('Cuenta admin creada. Ahora inicia sesión.');
      this.router.navigateByUrl('/auth/login');
    } catch (e: any) {
      this.notifications.error(e?.error?.message || e?.error?.error || e?.message || 'No se pudo registrar');
    } finally {
      this.isSubmitting = false;
      this.showSpinner = false;
      if (this.loadingTimeout) { clearTimeout(this.loadingTimeout); this.loadingTimeout = null; }
    }
  }

  isStrongPassword(pw: string): boolean {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return re.test(pw || '');
  }
}