import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { Barber } from '../../core/catalog.service';
import { NotificationsService } from '../../ui/notifications.service';
import { ConfirmService } from '../../ui/confirm.service';

@Component({
  selector: 'app-barber-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-0">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 class="text-2xl font-semibold">Barberos</h2>
        <a routerLink="/admin/barberos/nuevo" class="bg-indigo-600 text-white px-4 py-2 rounded w-full md:w-auto text-center">Nuevo barbero</a>
      </div>

      <div class="bg-white shadow-sm border rounded divide-y overflow-x-auto">
        <div class="p-4 grid grid-cols-1 md:grid-cols-5 gap-2 font-medium text-gray-700">
          <div>Nombre</div>
          <div class="md:col-span-2">Especialidades</div>
          <div>Estado</div>
          <div>Acciones</div>
        </div>
        <div *ngFor="let b of barbers" class="p-4 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
          <div class="font-medium">{{ b.name }}</div>
          <div class="md:col-span-2 text-sm text-gray-600">{{ (b.specialties ?? []).join(', ') || '—' }}</div>
          <div>
            <span class="text-xs px-2 py-1 rounded" [ngClass]="b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
              {{ b.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="flex flex-wrap gap-3 items-center">
            <a class="text-indigo-600 hover:underline" [routerLink]="['/admin/barberos/editar', b.id]">Editar</a>
            <button class="text-red-600 hover:underline" (click)="remove(b)">Eliminar</button>
          </div>
        </div>
        <div *ngIf="!barbers.length" class="p-4 text-sm text-gray-500">No hay barberos registrados.</div>
      </div>
    </div>
  `
})
export class BarberListComponent implements OnInit {
  barbers: Barber[] = [];

  constructor(private admin: AdminService, private notifications: NotificationsService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.admin.listBarbers().subscribe({ next: (bs) => this.barbers = bs });
  }

  async remove(b: Barber) {
    if (!b.id) return;
    const ok = await this.confirm.confirm({ message: `¿Eliminar barbero "${b.name}"?`, confirmText: 'Sí, eliminar', cancelText: 'No' });
    if (!ok) return;
    this.admin.deleteBarber(b.id).subscribe({
      next: () => {
        this.barbers = this.barbers.filter(x => x.id !== b.id);
        this.notifications.success('Barbero eliminado');
      },
      error: (err) => this.notifications.error(err?.error?.error || 'No se pudo eliminar')
    });
  }
}