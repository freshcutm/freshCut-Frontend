import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { ServiceItem } from '../../core/catalog.service';
import { CurrencyService } from '../../core/currency.service';
import { ConfirmService } from '../../ui/confirm.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-0">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold">Servicios</h2>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="bg-white shadow-sm border rounded p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <label class="text-sm text-gray-600">Buscar</label>
          <input [(ngModel)]="searchTerm" class="border rounded w-full px-3 py-2" placeholder="Buscar por nombre" />
        </div>
        <div>
          <label class="text-sm text-gray-600">Estado</label>
          <select [(ngModel)]="statusFilter" class="border rounded w-full px-3 py-2">
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Crear nuevo servicio -->
      <div class="bg-white shadow-sm border rounded p-4 mb-6">
        <h3 class="font-medium mb-3">Nuevo servicio</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label class="text-sm text-gray-600">Nombre</label>
            <input [(ngModel)]="newName" class="border rounded w-full px-3 py-2" placeholder="Corte clásico" />
            <p *ngIf="!newName.trim()" class="text-xs text-red-600 mt-1">El nombre es obligatorio.</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Duración (min)</label>
            <input type="number" [(ngModel)]="newDuration" min="5" max="240" class="border rounded w-full px-3 py-2" />
            <p *ngIf="newDuration < 5 || newDuration > 240" class="text-xs text-red-600 mt-1">Duración entre 5 y 240 minutos.</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Precio (centavos)</label>
            <input type="number" [(ngModel)]="newPrice" min="100" max="20000" class="border rounded w-full px-3 py-2" />
            <p *ngIf="newPrice < 100 || newPrice > 20000" class="text-xs text-red-600 mt-1">Precio entre 100 y 20000 centavos.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <label class="text-sm">Activo</label>
            <input type="checkbox" [(ngModel)]="newActive" />
            <button (click)="create()" [disabled]="!canCreate()" class="w-full md:w-auto md:ml-auto bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50 text-center">Crear</button>
          </div>
        </div>
      </div>

      <!-- Lista de servicios -->
      <div class="bg-white shadow-sm border rounded divide-y overflow-x-auto">
        <div class="p-4 grid grid-cols-1 md:grid-cols-6 gap-2 font-medium text-gray-700">
          <div>Nombre</div>
          <div>Duración</div>
          <div>Precio</div>
          <div>Estado</div>
          <div class="md:col-span-2">Acciones</div>
        </div>
        <div *ngFor="let s of filteredServices()" class="p-4 grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
          <div class="font-medium">{{ s.name }}</div>
          <div>{{ s.durationMinutes }} min</div>
          <div>{{ formatPrice(s.priceCents) }}</div>
          <div>
            <span class="text-xs px-2 py-1 rounded" [ngClass]="s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
              {{ s.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="md:col-span-2 flex flex-wrap gap-3 items-center">
            <a class="text-indigo-600 hover:underline" [routerLink]="['/admin/servicios/editar', s.id]">Editar</a>
            <button class="text-red-600 hover:underline" (click)="remove(s)">Eliminar</button>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [ngModel]="s.active" (ngModelChange)="toggleActive(s, $event)" />
              Activo
            </label>
          </div>
        </div>
        <div *ngIf="!filteredServices().length" class="p-4 text-sm text-gray-500">No hay servicios registrados.</div>
      </div>
    </div>
  `
})
export class ServiceListComponent implements OnInit {
  services: ServiceItem[] = [];

  newName = '';
  newDuration = 30;
  newPrice = 1500;
  newActive = true;

  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(private admin: AdminService, private currency: CurrencyService, private notifications: NotificationsService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.currency.warmup();
    this.load();
  }

  load() {
    this.admin.listServices().subscribe({ next: (ss) => this.services = ss });
  }

  create() {
    const payload: Partial<ServiceItem> = {
      name: this.newName.trim(),
      durationMinutes: this.newDuration,
      priceCents: this.newPrice,
      active: this.newActive
    } as any;
    if (!this.canCreate()) {
      this.notifications.error('Revisa los campos: nombre, duración y precio');
      return;
    }
    this.admin.createService(payload).subscribe({
      next: (created) => {
        this.services = [created, ...this.services];
        this.newName = '';
        this.newDuration = 30;
        this.newPrice = 1500;
        this.newActive = true;
      },
      error: (err) => this.notifications.error(err?.error?.error || 'No se pudo crear')
    });
  }

  toggleActive(s: ServiceItem, value: boolean) {
    const payload: Partial<ServiceItem> = { active: value } as any;
    this.admin.updateService(s.id, { ...s, active: value }).subscribe({
      next: (updated) => {
        this.services = this.services.map(x => x.id === updated.id ? updated : x);
      },
      error: () => { this.notifications.error('No se pudo cambiar estado'); }
    });
  }

  async remove(s: ServiceItem) {
    if (!s.id) return;
    const ok = await this.confirm.confirm({ message: `¿Eliminar servicio "${s.name}"?`, confirmText: 'Sí, eliminar', cancelText: 'No' });
    if (!ok) return;
    this.admin.deleteService(s.id).subscribe({
      next: () => { this.services = this.services.filter(x => x.id !== s.id); },
      error: (err) => this.notifications.error(err?.error?.error || 'No se pudo eliminar')
    });
  }

  formatPrice(cents: number) { return this.currency.formatEurosCentsToCOP(cents); }

  filteredServices() {
    return this.services.filter(s => {
      const matchesSearch = this.searchTerm
        ? s.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      const matchesStatus = this.statusFilter === 'all'
        ? true
        : this.statusFilter === 'active'
          ? s.active
          : !s.active;
      return matchesSearch && matchesStatus;
    });
  }

  canCreate() {
    const nameOk = !!this.newName.trim();
    const durationOk = this.newDuration >= 5 && this.newDuration <= 240;
    const priceOk = this.newPrice >= 100 && this.newPrice <= 20000;
    return nameOk && durationOk && priceOk;
  }
}