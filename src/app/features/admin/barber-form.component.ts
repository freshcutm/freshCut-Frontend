import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../core/admin.service';

@Component({
  selector: 'app-barber-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 class="text-xl font-semibold mb-4">Crear barbero</h2>
      <form (ngSubmit)="create()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Nombre</label>
          <input [(ngModel)]="name" name="name" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Especialidades (separadas por coma)</label>
          <input [(ngModel)]="specialties" name="specialties" class="w-full border rounded px-3 py-2" placeholder="Ej: fade, barba" />
        </div>
        <div>
          <label class="block text-sm font-medium">Tipos de cortes (coma)</label>
          <input [(ngModel)]="cutTypes" name="cutTypes" class="w-full border rounded px-3 py-2" placeholder="Ej: buzz, pompadour, crew" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium">Experiencia (años)</label>
            <input [(ngModel)]="experienceYears" name="experienceYears" type="number" min="0" class="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium">Acerca de mí</label>
          <textarea [(ngModel)]="bio" name="bio" rows="3" class="w-full border rounded px-3 py-2" placeholder="Cuéntanos tu estilo y experiencia"></textarea>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" [(ngModel)]="active" name="active" />
          <label class="text-sm">Activo</label>
        </div>
        <button class="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" type="submit">Crear</button>
      </form>
    </div>
  `
})
export class BarberFormComponent {
  name = '';
  specialties = '';
  cutTypes = '';
  experienceYears: number | null = null;
  bio = '';
  active = true;

  constructor(private admin: AdminService, private router: Router) {}

  create() {
    const payload = {
      name: this.name,
      specialties: this.specialties
        ? this.specialties.split(',').map(s => s.trim()).filter(s => !!s)
        : [],
      cutTypes: this.cutTypes
        ? this.cutTypes.split(',').map(s => s.trim()).filter(s => !!s)
        : [],
      experienceYears: this.experienceYears ?? undefined,
      bio: this.bio || undefined,
      active: this.active
    };
    this.admin.createBarber(payload).subscribe({
      next: () => {
        alert('Barbero creado');
        this.router.navigateByUrl('/admin');
      },
      error: () => alert('No se pudo crear el barbero')
    });
  }
}