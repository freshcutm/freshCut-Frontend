import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { Barber } from '../../core/catalog.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-barber-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-xl mx-auto p-6 bg-white shadow rounded" *ngIf="loaded; else loading">
      <h2 class="barber-title text-3xl font-bold mb-4">Editar barbero</h2>
      <form (ngSubmit)="save()" class="grid gap-4">
        <div>
          <label class="block text-sm font-medium">Nombre</label>
          <input [(ngModel)]="name" name="name" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Especialidades (separadas por coma)</label>
          <input [(ngModel)]="specialtiesText" name="specialties" class="w-full border rounded px-3 py-2"/>
          <p class="text-xs text-gray-500 mt-1">Ej: degradado, barba, mullet</p>
        </div>
        <div>
          <label class="block text-sm font-medium">Tipos de cortes (separadas por coma)</label>
          <input [(ngModel)]="cutTypesText" name="cutTypes" class="w-full border rounded px-3 py-2"/>
          <p class="text-xs text-gray-500 mt-1">Ej: buzz, pompadour, crew</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium">Experiencia (años)</label>
            <input [(ngModel)]="experienceYears" name="experienceYears" type="number" min="0" class="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium">Acerca de mí</label>
          <textarea [(ngModel)]="bioText" name="bio" rows="3" class="w-full border rounded px-3 py-2"></textarea>
        </div>
        <div class="flex items-center gap-2">
          <input [(ngModel)]="active" name="active" type="checkbox" class="h-4 w-4" />
          <label class="text-sm">Activo</label>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" type="submit">Guardar cambios</button>
          <button type="button" (click)="cancel()" class="w-full sm:w-auto border px-4 py-2 rounded">Cancelar</button>
        </div>
      </form>
    </div>
    <ng-template #loading>
      <div class="max-w-xl mx-auto p-6">Cargando barbero...</div>
    </ng-template>
  `
})
export class BarberEditComponent implements OnInit {
  id = '';
  loaded = false;
  name = '';
  specialtiesText = '';
  cutTypesText = '';
  experienceYears: number | null = null;
  bioText = '';
  active = true;

  constructor(private route: ActivatedRoute, private router: Router, private admin: AdminService, private notifications: NotificationsService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.admin.listBarbers().subscribe({
      next: (bs) => {
        const b = bs.find(x => x.id === this.id);
        if (!b) {
          this.notifications.error('Barbero no encontrado');
          this.router.navigateByUrl('/admin/barberos');
          return;
        }
        this.name = b.name;
        this.specialtiesText = (b.specialties ?? []).join(', ');
        this.cutTypesText = (b.cutTypes ?? []).join(', ');
        this.experienceYears = b.experienceYears ?? null;
        this.bioText = b.bio ?? '';
        this.active = b.active;
        this.loaded = true;
      },
      error: () => {
        this.notifications.error('No se pudo cargar el barbero');
        this.router.navigateByUrl('/admin/barberos');
      }
    });
  }

  save() {
    const specialties = this.specialtiesText
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s);
    const cutTypes = this.cutTypesText
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s);
    this.admin.updateBarber(this.id, { name: this.name, specialties, cutTypes, experienceYears: this.experienceYears ?? undefined, bio: this.bioText || undefined, active: this.active }).subscribe({
      next: () => {
        this.notifications.success('Barbero actualizado');
        this.router.navigateByUrl('/admin/barberos');
      },
      error: (err) => this.notifications.error(err?.error?.error || 'No se pudo actualizar')
    });
  }

  cancel() { this.router.navigateByUrl('/admin/barberos'); }
}