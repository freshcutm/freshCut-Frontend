import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/admin.service';
import { Barber, ServiceItem } from '../../core/catalog.service';
import { CurrencyService } from '../../core/currency.service';
import { ConfirmService } from '../../ui/confirm.service';

@Component({
  selector: 'app-admin-control',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <h1 class="text-2xl font-semibold mb-6">Panel de Control de Administrador</h1>

      <!-- Quick actions -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <section class="border rounded-lg p-4 bg-white shadow-sm">
          <h2 class="text-lg font-medium mb-4">Crear Barbero Rápido</h2>
          <form (ngSubmit)="createBarber()" class="space-y-3">
            <div>
              <label class="block text-sm">Nombre</label>
              <input [(ngModel)]="newBarberName" name="barberName" type="text" class="w-full border rounded p-2" required />
            </div>
            <div>
              <label class="block text-sm">Especialidades (coma)</label>
              <input [(ngModel)]="newBarberSpecialties" name="barberSpecs" type="text" class="w-full border rounded p-2" />
            </div>
            <div>
              <label class="block text-sm">Tipos de cortes (coma)</label>
              <input [(ngModel)]="newBarberCutTypes" name="barberCuts" type="text" class="w-full border rounded p-2" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm">Experiencia (años)</label>
                <input [(ngModel)]="newBarberExperience" name="barberExperience" type="number" min="0" class="w-full border rounded p-2" />
              </div>
            </div>
            <div>
              <label class="block text-sm">Acerca de mí</label>
              <textarea [(ngModel)]="newBarberBio" name="barberBio" rows="3" class="w-full border rounded p-2"></textarea>
            </div>
            <div class="flex items-center gap-2">
              <input [(ngModel)]="newBarberActive" name="barberActive" type="checkbox" />
              <span>Activo</span>
            </div>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Crear</button>
            <div *ngIf="barberError" class="text-red-600 text-sm">{{ barberError }}</div>
          </form>
        </section>

        <section class="border rounded-lg p-4 bg-white shadow-sm">
          <h2 class="text-lg font-medium mb-4">Crear Servicio Rápido</h2>
          <form (ngSubmit)="createService()" class="space-y-3">
            <div>
              <label class="block text-sm">Nombre</label>
              <input [(ngModel)]="newServiceName" name="serviceName" type="text" class="w-full border rounded p-2" required />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm">Duración (min)</label>
                <input [(ngModel)]="newServiceDuration" name="serviceDuration" type="number" min="0" class="w-full border rounded p-2" />
              </div>
              <div>
                <label class="block text-sm">Precio</label>
                <input [(ngModel)]="newServicePrice" name="servicePrice" type="number" min="0" step="0.01" class="w-full border rounded p-2" />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input [(ngModel)]="newServiceActive" name="serviceActive" type="checkbox" />
              <span>Activo</span>
            </div>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded">Crear</button>
            <div *ngIf="serviceError" class="text-red-600 text-sm">{{ serviceError }}</div>
          </form>
        </section>
      </div>

      <!-- Barbers list -->
      <section class="mb-10">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium mb-4">Barberos</h2>
          <a routerLink="/admin/barberos" class="text-blue-700 hover:underline">Gestionar en página completa</a>
        </div>
        <div class="overflow-x-auto bg-white border rounded-lg shadow-sm">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left p-3">Nombre</th>
                <th class="text-left p-3">Especialidades</th>
                <th class="text-left p-3">Estado</th>
                <th class="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of barbers" class="border-t">
                <td class="p-3">{{ b.name }}</td>
                <td class="p-3">{{ (b.specialties || []).join(', ') }}</td>
                <td class="p-3">
                  <span class="px-2 py-1 text-xs rounded" [class.bg-green-100]="b.active" [class.bg-gray-200]="!b.active">{{ b.active ? 'Activo' : 'Inactivo' }}</span>
                </td>
                <td class="p-3 space-x-2">
                  <a [routerLink]="['/admin/barberos/editar', b.id]" class="px-2 py-1 bg-indigo-600 text-white rounded">Editar</a>
                  <button (click)="removeBarber(b)" class="px-2 py-1 bg-red-600 text-white rounded">Retirar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Services list -->
      <section>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium mb-4">Servicios</h2>
          <a routerLink="/admin/servicios" class="text-blue-700 hover:underline">Gestionar en página completa</a>
        </div>
        <div class="overflow-x-auto bg-white border rounded-lg shadow-sm">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left p-3">Nombre</th>
                <th class="text-left p-3">Duración</th>
                <th class="text-left p-3">Precio</th>
                <th class="text-left p-3">Estado</th>
                <th class="text-left p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of services" class="border-t">
                <td class="p-3">{{ s.name }}</td>
                <td class="p-3">{{ s.durationMinutes }} min</td>
                <td class="p-3">{{ formatPrice(s.priceCents) }}</td>
                <td class="p-3">
                  <span class="px-2 py-1 text-xs rounded" [class.bg-green-100]="s.active" [class.bg-gray-200]="!s.active">{{ s.active ? 'Activo' : 'Inactivo' }}</span>
                </td>
                <td class="p-3 space-x-2">
                  <a [routerLink]="['/admin/servicios/editar', s.id]" class="px-2 py-1 bg-indigo-600 text-white rounded">Editar</a>
                  <button (click)="toggleServiceActive(s)" class="px-2 py-1 bg-yellow-600 text-white rounded">{{ s.active ? 'Desactivar' : 'Activar' }}</button>
                  <button (click)="removeService(s)" class="px-2 py-1 bg-red-600 text-white rounded">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
     </div>
   `
 
 })
export class AdminControlComponent implements OnInit {
  // Barbers
  barbers: Barber[] = [];
  newBarberName = '';
  newBarberSpecialties = '';
  newBarberCutTypes = '';
  newBarberExperience: number | null = null;
  newBarberBio = '';
  newBarberActive = true;
  barberError = '';

  // Services
  services: ServiceItem[] = [];
  newServiceName = '';
  newServiceDuration: number | null = null;
  newServicePrice: number | null = null;
  newServiceActive = true;
  serviceError = '';

  constructor(private adminService: AdminService, private currency: CurrencyService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.currency.warmup();
    this.loadBarbers();
    this.loadServices();
  }

  // Barbers
  loadBarbers(): void {
    this.adminService.listBarbers().subscribe({
      next: (bs: Barber[]) => (this.barbers = bs || []),
      error: (err: any) => (this.barberError = err?.error?.error || 'No se pudo cargar barberos'),
    });
  }

  createBarber(): void {
    this.barberError = '';
    const payload: Partial<Barber> = {
      name: this.newBarberName.trim(),
      specialties: (this.newBarberSpecialties || '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      cutTypes: (this.newBarberCutTypes || '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      experienceYears: this.newBarberExperience ?? undefined,
      bio: this.newBarberBio || undefined,
      active: this.newBarberActive,
    };

    if (!payload.name) {
      this.barberError = 'El nombre es obligatorio';
      return;
    }

    this.adminService.createBarber(payload as Barber).subscribe({
      next: () => {
        this.newBarberName = '';
        this.newBarberSpecialties = '';
        this.newBarberCutTypes = '';
        this.newBarberExperience = null;
        this.newBarberBio = '';
        this.newBarberActive = true;
        this.loadBarbers();
      },
      error: (err: any) => (this.barberError = err?.error?.error || 'No se pudo crear barbero'),
    });
  }

  async removeBarber(b: Barber): Promise<void> {
     if (!b?.id) return;
     const ok = await this.confirm.confirm({ message: `¿Seguro que deseas retirar a "${b.name}"?`, confirmText: 'Sí, retirar', cancelText: 'No' });
     if (!ok) return;
     this.adminService.deleteBarber(b.id).subscribe({
       next: () => this.loadBarbers(),
       error: (err: any) => (this.barberError = err?.error?.error || 'No se pudo retirar barbero'),
     });
   }

  // Services
  loadServices(): void {
    this.adminService.listServices().subscribe({
      next: (ss: ServiceItem[]) => (this.services = ss || []),
      error: (err: any) => (this.serviceError = err?.error?.error || 'No se pudo cargar servicios'),
    });
  }

  createService(): void {
    this.serviceError = '';
    const payload: Partial<ServiceItem> = {
      name: (this.newServiceName || '').trim(),
      durationMinutes: this.newServiceDuration ?? 0,
      priceCents: this.newServicePrice ?? 0,
      active: this.newServiceActive,
    };

    if (!payload.name) {
      this.serviceError = 'El nombre es obligatorio';
      return;
    }

    this.adminService.createService(payload as ServiceItem).subscribe({
      next: () => {
        this.newServiceName = '';
        this.newServiceDuration = null;
        this.newServicePrice = null;
        this.newServiceActive = true;
        this.loadServices();
      },
      error: (err: any) => (this.serviceError = err?.error?.error || 'No se pudo crear servicio'),
    });
  }

  toggleServiceActive(s: ServiceItem): void {
    if (!s?.id) return;
    this.adminService.updateService(s.id, { ...s, active: !s.active }).subscribe({
      next: () => this.loadServices(),
      error: (err: any) => (this.serviceError = err?.error?.error || 'No se pudo actualizar servicio'),
    });
  }

  async removeService(s: ServiceItem): Promise<void> {
    if (!s?.id) return;
    const ok = await this.confirm.confirm({ message: `¿Eliminar servicio "${s.name}"?`, confirmText: 'Sí, eliminar', cancelText: 'No' });

    if (!ok) return;
    this.adminService.deleteService(s.id).subscribe({
      next: () => this.loadServices(),
      error: (err: any) => (this.serviceError = err?.error?.error || 'No se pudo eliminar servicio'),
    });
  }

  formatPrice(cents: number | null | undefined): string {
    return this.currency.formatEurosCentsToCOP(cents ?? 0);
  }
}