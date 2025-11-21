import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService, Barber, ServiceItem } from '../../core/catalog.service';
import { CurrencyService } from '../../core/currency.service';
import { realDurationMinutes } from '../../core/duration-realism';
import { AuthService } from '../../core/auth.service';
import { BarberService, Schedule } from '../../core/barber.service';
import { NotificationsService } from '../../ui/notifications.service';
import { ConfirmService } from '../../ui/confirm.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-white"></div>
      <div class="relative max-w-6xl mx-auto py-12 px-4 grid gap-10">
        <ng-container *ngIf="auth.role() !== 'BARBER'; else barberHome">
          <div class="text-center">
            <h1 class="barber-title text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">Barbería de nueva generación</h1>
            <p class="text-gray-600 mb-8">Reserva en segundos, descubre servicios de calidad y recibe recomendaciones personalizadas.</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a routerLink="/reservas" class="btn btn-primary w-full sm:w-auto">Reservar ahora</a>
              <a routerLink="/ia" class="btn btn-outline w-full sm:w-auto">Probar asistente IA</a>
              <a routerLink="/auth/register" class="btn btn-outline w-full sm:w-auto">Crear cuenta</a>
              <a routerLink="/auth/register/barbero" class="btn btn-outline w-full sm:w-auto">Soy barbero</a>
            </div>
          </div>
        </ng-container>

        <ng-template #barberHome>
          <div class="text-center">
            <h1 class="barber-title text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">Panel de barbero</h1>
            <p class="text-gray-600 mb-8">Gestiona tu perfil, horario y reservas. Este inicio está adaptado a tu rol.</p>
            <div class="flex flex-wrap justify-center gap-3 mb-8">
              <a routerLink="/barbero" class="btn btn-primary w-full sm:w-auto">Ir a mi panel</a>
              <a routerLink="/reservas" class="btn btn-outline w-full sm:w-auto">Ver mis reservas</a>
              <a routerLink="/perfil" class="btn btn-outline w-full sm:w-auto">Editar perfil</a>
            </div>

            <div class="border rounded-xl p-4 bg-white shadow">
              <h3 class="font-medium mb-2">Mi disponibilidad</h3>
              <div *ngIf="schedules as sc; else loadingSc" class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead>
                    <tr class="text-left text-gray-600">
                      <th class="px-2 py-2 w-48">Día</th>
                      <th class="px-2 py-2 w-32">Inicio</th>
                      <th class="px-2 py-2 w-32">Fin</th>
                      <th class="px-2 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr *ngFor="let s of sc">
                      <td class="px-2 py-2">
                        <select class="border rounded px-2 py-1 w-full" [(ngModel)]="s.dayOfWeek">
                          <option *ngFor="let d of days" [ngValue]="d">{{ d }}</option>
                        </select>
                      </td>
                      <td class="px-2 py-2">
                        <input type="time" class="border rounded px-2 py-1 w-full" [(ngModel)]="s.startTime" />
                      </td>
                      <td class="px-2 py-2">
                        <input type="time" class="border rounded px-2 py-1 w-full" [(ngModel)]="s.endTime" />
                      </td>
                      <td class="px-2 py-2">
                        <div class="flex items-center gap-2">
                          <button class="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 shadow-sm" (click)="updateSchedule(s)" [disabled]="updatingScheduleId === s.id">
                            <span *ngIf="updatingScheduleId !== s.id">Guardar</span>
                            <span *ngIf="updatingScheduleId === s.id">Guardando…</span>
                          </button>
                          <button class="inline-flex items-center gap-2 bg-rose-600 text-white px-3 py-1.5 rounded-md hover:bg-rose-700 shadow-sm" (click)="deleteSchedule(s)" [disabled]="deletingScheduleId === s.id">
                            <span *ngIf="deletingScheduleId !== s.id">Eliminar</span>
                            <span *ngIf="deletingScheduleId === s.id">Eliminando…</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="border-t mt-4 pt-4">
                  <h4 class="font-medium mb-2">Crear nuevo horario</h4>
                  <div class="grid grid-cols-4 gap-2">
                    <select class="border rounded px-2 py-1 w-full" [(ngModel)]="newDay">
                      <option *ngFor="let d of days" [ngValue]="d">{{ d }}</option>
                    </select>
                    <input type="time" class="border rounded px-2 py-1 w-full" [(ngModel)]="newStart" />
                    <input type="time" class="border rounded px-2 py-1 w-full" [(ngModel)]="newEnd" />
                    <button class="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 shadow-sm" (click)="createSchedule()" [disabled]="isCreatingSchedule">
                      <span *ngIf="!isCreatingSchedule">Añadir</span>
                      <span *ngIf="isCreatingSchedule">Creando…</span>
                    </button>
                  </div>
                </div>
              </div>
              <ng-template #loadingSc>
                <div class="text-sm text-gray-500">Cargando disponibilidad…</div>
              </ng-template>
            </div>
          </div>
        </ng-template>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="md:col-span-2">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-semibold">Servicios populares</h2>
              <a routerLink="/servicios" class="text-indigo-600 hover:underline">Ver todos los servicios</a>
            </div>
            <div class="mt-3 bg-white shadow-sm border rounded divide-y" *ngIf="services.length; else noServices">
              <div class="p-4 flex items-center justify-between" *ngFor="let s of services | slice:0:3">
                <div>
                  <div class="font-medium">{{ s.name }}</div>
                  <div class="text-sm text-gray-500">Duración estimada: {{ realDuration(s) }} min • Precio: {{ formatPrice(s.priceCents) }}</div>
                </div>
                <a *ngIf="auth.role() !== 'BARBER'" routerLink="/reservas/nueva" class="text-indigo-600 hover:underline">Reservar</a>
              </div>
            </div>
            <ng-template #noServices>
              <div class="mt-3 p-4 border rounded text-sm text-gray-500">Aún no hay servicios disponibles.</div>
            </ng-template>
          </div>
        </div>
        <div *ngIf="auth.role() !== 'BARBER'" class="mt-2 bg-indigo-50 border border-indigo-100 rounded p-6 text-center">
          <h3 class="text-xl font-semibold mb-2">¿Eres barbero?</h3>
          <p class="text-gray-700 mb-4">Únete a FreshCut para gestionar tus reservas, crear tu perfil y atraer más clientes.</p>
          <a routerLink="/auth/register/barbero" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700">Crear perfil de barbero</a>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  barbers: Barber[] = [];
  services: ServiceItem[] = [];

  schedules?: Schedule[];
  updatingScheduleId?: string | number;
  deletingScheduleId?: string | number;
  isCreatingSchedule = false;
  days: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  newDay: string = 'MONDAY';
  newStart: string = '09:00';
  newEnd: string = '17:00';

  constructor(private catalog: CatalogService, private currency: CurrencyService, public auth: AuthService, private barber: BarberService, private notifications: NotificationsService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.currency.warmup();
    this.catalog.listBarbers().subscribe({ next: bs => this.barbers = bs });
    this.catalog.listServices().subscribe({ next: ss => this.services = ss });
    if (this.auth.role() === 'BARBER') {
      this.barber.schedules().subscribe({ next: (ss) => this.schedules = ss });
    }
  }

  formatPrice(cents: number) {
    return this.currency.formatEurosCentsToCOP(cents);
  }

  realDuration(s: ServiceItem): number {
    return realDurationMinutes(s.name, s.durationMinutes);
  }

  createSchedule() {
    if (!this.newDay || !this.newStart || !this.newEnd) return;
    this.isCreatingSchedule = true;
    this.barber.createSchedule({ dayOfWeek: this.newDay, startTime: this.newStart, endTime: this.newEnd }).subscribe({
      next: (created) => {
        this.schedules = [...(this.schedules || []), created];
        this.notifications.success('Horario creado');
        this.isCreatingSchedule = false;
      },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo crear el horario'); this.isCreatingSchedule = false; }
    });
  }

  updateSchedule(s: Schedule) {
    if (!s.id) return;
    this.updatingScheduleId = s.id;
    this.barber.updateSchedule(s.id, { dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }).subscribe({
      next: (updated) => {
        this.schedules = (this.schedules || []).map(x => x.id === updated.id ? updated : x);
        this.notifications.success('Horario actualizado');
        this.updatingScheduleId = undefined;
      },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo actualizar el horario'); this.updatingScheduleId = undefined; }
    });
  }

  async deleteSchedule(s: Schedule) {
    if (!s.id) return;
    const ok = await this.confirm.confirm({ message: '¿Eliminar este horario?', confirmText: 'Sí, eliminar', cancelText: 'No' });
    if (!ok) return;
    this.deletingScheduleId = s.id;
    this.barber.deleteSchedule(s.id).subscribe({
      next: () => {
        this.schedules = (this.schedules || []).filter(x => x.id !== s.id);
        this.notifications.success('Horario eliminado');
        this.deletingScheduleId = undefined;
      },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo eliminar el horario'); this.deletingScheduleId = undefined; }
    });
  }
}