import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { ServiceItem } from '../../core/catalog.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-service-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-xl mx-auto p-8 bg-white shadow-sm border rounded-lg" *ngIf="loaded; else loading">
      <h2 class="text-2xl font-semibold mb-6">Editar servicio</h2>
      <form (ngSubmit)="save()" class="grid gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nombre</label>
          <input [(ngModel)]="name" name="name" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <p *ngIf="!name.trim()" class="text-xs text-red-600 mt-1">El nombre es obligatorio.</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Duración (minutos)</label>
          <input [(ngModel)]="duration" name="duration" type="number" min="5" max="240" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <p *ngIf="duration < 5 || duration > 240" class="text-xs text-red-600 mt-1">Duración entre 5 y 240 minutos.</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Precio (centavos)</label>
          <input [(ngModel)]="price" name="price" type="number" min="100" max="20000" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          <p *ngIf="price < 100 || price > 20000" class="text-xs text-red-600 mt-1">Precio entre 100 y 20000 centavos.</p>
        </div>
        <div class="flex items-center gap-2">
          <input [(ngModel)]="active" name="active" type="checkbox" class="h-4 w-4" />
          <label class="text-sm">Activo</label>
        </div>
        <div class="flex flex-wrap gap-2">
          <button [disabled]="!canSave()" class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50" type="submit">Guardar cambios</button>
          <button type="button" (click)="cancel()" class="w-full sm:w-auto border px-4 py-2 rounded">Cancelar</button>
        </div>
      </form>
    </div>
    <ng-template #loading>
      <div class="max-w-xl mx-auto p-6">Cargando servicio...</div>
    </ng-template>
  `
})
export class ServiceEditComponent implements OnInit {
  id = '';
  loaded = false;
  name = '';
  duration = 30;
  price = 1500;
  active = true;

  constructor(private route: ActivatedRoute, private router: Router, private admin: AdminService, private notifications: NotificationsService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.admin.getService(this.id).subscribe({
      next: (s: ServiceItem) => {
        if (!s) {
          this.notifications.error('Servicio no encontrado');
          this.router.navigateByUrl('/admin/servicios');
          return;
        }
        this.name = s.name;
        this.duration = s.durationMinutes;
        this.price = s.priceCents;
        this.active = s.active;
        this.loaded = true;
      },
      error: () => {
        this.notifications.error('No se pudo cargar el servicio');
        this.router.navigateByUrl('/admin/servicios');
      }
    });
  }

  canSave() {
    const nameOk = !!this.name.trim();
    const durationOk = this.duration >= 5 && this.duration <= 240;
    const priceOk = this.price >= 100 && this.price <= 20000;
    return nameOk && durationOk && priceOk;
  }

  save() {
    if (!this.canSave()) return;
    this.admin.updateService(this.id, {
      name: this.name.trim(),
      durationMinutes: this.duration,
      priceCents: this.price,
      active: this.active
    }).subscribe({
      next: () => {
        this.notifications.success('Servicio actualizado');
        this.router.navigateByUrl('/admin/servicios');
      },
      error: (err) => this.notifications.error(err?.error?.error || 'No se pudo actualizar')
    });
  }

  cancel() { this.router.navigateByUrl('/admin/servicios'); }
}