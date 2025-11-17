import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberService, Booking, Schedule } from '../../core/barber.service';
import { NotificationsService } from '../../ui/notifications.service';
import { ConfirmService } from '../../ui/confirm.service';
import { Barber } from '../../core/catalog.service';

@Component({
  selector: 'app-barber-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-0">
      <h2 class="barber-title text-3xl font-bold mb-6">Panel de barbero</h2>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 border rounded p-4 bg-white">
          <h3 class="barber-subtitle font-semibold mb-2">Mi perfil</h3>
          <ng-container *ngIf="me; else loadingMe">
            <div class="space-y-2">
              <div><span class="text-gray-600">Nombre:</span> <span class="font-medium">{{ me.name }}</span></div>
              <div><span class="text-gray-600">Especialidades:</span> <span class="font-medium">{{ (me.specialties ?? []).join(', ') || '—' }}</span></div>
              <div><span class="text-gray-600">Tipos de cortes:</span> <span class="font-medium">{{ (me.cutTypes ?? []).join(', ') || '—' }}</span></div>
              <div><span class="text-gray-600">Experiencia:</span> <span class="font-medium">{{ me.experienceYears || 0 }} años</span></div>
              <div><span class="text-gray-600">Acerca de mí:</span> <span class="font-medium">{{ me.bio || '—' }}</span></div>
              <div>
                <span class="text-gray-600 mr-2">Estado:</span>
                <span class="text-xs px-2 py-1 rounded" [ngClass]="me.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
                  {{ me.active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="mt-3 flex items-center gap-2">
                <label class="text-sm">Cambiar estado:</label>
                <select class="border rounded px-2 py-1" [(ngModel)]="meActiveDraft">
                  <option [ngValue]="true">Activo</option>
                  <option [ngValue]="false">Inactivo</option>
                </select>
                <button (click)="saveActive()" class="bg-indigo-600 text-white px-3 py-1 rounded" [disabled]="isSavingActive">
                  <span *ngIf="!isSavingActive">Guardar</span>
                  <span *ngIf="isSavingActive">Guardando…</span>
                </button>
              </div>
              <!-- NUEVO: edición básica de perfil -->
              <div class="mt-4 space-y-2">
                <div class="flex items-center gap-2">
                  <label class="text-sm w-28">Editar nombre:</label>
                  <input class="border rounded px-2 py-1 flex-1" [(ngModel)]="meNameDraft" placeholder="Tu nombre" />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-sm w-28">Especialidades:</label>
                  <input class="border rounded px-2 py-1 flex-1" [(ngModel)]="meSpecialtiesDraft" placeholder="Ej: Fade, Barba, Tijera" />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-sm w-28">Tipos de cortes:</label>
                  <input class="border rounded px-2 py-1 flex-1" [(ngModel)]="meCutTypesDraft" placeholder="Ej: Buzz, Pompadour, Crew" />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-sm w-28">Experiencia (años):</label>
                  <input type="number" min="0" class="border rounded px-2 py-1 w-28" [(ngModel)]="meExperienceDraft" />
                </div>
                <div class="flex items-start gap-2">
                  <label class="text-sm w-28">Acerca de mí:</label>
                  <textarea class="border rounded px-2 py-1 flex-1" [(ngModel)]="meBioDraft" rows="3" placeholder="Describe tu estilo y experiencia"></textarea>
                </div>
                <button (click)="saveBasics()" class="bg-indigo-600 text-white px-3 py-1 rounded" [disabled]="isSavingBasics">
                  <span *ngIf="!isSavingBasics">Guardar cambios</span>
                  <span *ngIf="isSavingBasics">Guardando…</span>
                </button>
              </div>
            </div>
          </ng-container>
          <ng-template #loadingMe>
            <div class="text-sm text-gray-500">Cargando perfil…</div>
          </ng-template>
        </div>

        <div class="lg:col-span-2 border rounded p-4 bg-white">
          <h3 class="font-medium mb-2">Mis reservas</h3>
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="text-xs text-gray-600">Filtro:</span>
            <select class="border rounded px-2 py-1 text-sm" [(ngModel)]="viewFilter">
              <option [ngValue]="'UPCOMING'">Próximas</option>
              <option [ngValue]="'HISTORY'">Historial</option>
              <option [ngValue]="'ALL'">Todas</option>
            </select>
            <button class="text-xs underline" (click)="refreshBookings()">Actualizar</button>
          </div>
          <div *ngIf="bookings; else loadingBk" class="overflow-x-auto -mx-4 sm:mx-0">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-left">
                  <th class="py-2 pr-4">Cliente</th>
                  <th class="py-2 pr-4">Servicio</th>
                  <th class="py-2 pr-4">Inicio</th>
                  <th class="py-2 pr-4">Fin</th>
                  <th class="py-2 pr-4">Estado</th>
                  <th class="py-2 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of filteredBookings" class="border-t">
                  <td class="py-2 pr-4">{{ b.clientName }}</td>
                  <td class="py-2 pr-4">{{ b.service }}</td>
                  <td class="py-2 pr-4">{{ formatDate(b.startTime) }}</td>
                  <td class="py-2 pr-4">{{ formatDate(b.endTime) }}</td>
                  <td class="py-2 pr-4">{{ b.status || 'CONFIRMED' }}</td>
                  <td class="py-2 pr-4">
                    <button *ngIf="canCancel(b)" (click)="cancelBooking(b)" class="text-red-600 underline" [disabled]="actionBookingId === b.id">
                      <span *ngIf="actionBookingId !== b.id">Cancelar</span>
                      <span *ngIf="actionBookingId === b.id">Cancelando…</span>
                    </button>
                    <button *ngIf="canComplete(b)" (click)="completeBooking(b)" class="ml-3 text-green-700 underline" [disabled]="actionBookingId === b.id">
                      <span *ngIf="actionBookingId !== b.id">Completar</span>
                      <span *ngIf="actionBookingId === b.id">Completando…</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #loadingBk>
            <div class="text-sm text-gray-500">Cargando reservas…</div>
          </ng-template>
        </div>
      </div>

      <div class="mt-6 border rounded p-4 bg-white">
        <h3 class="font-medium mb-2">Mi disponibilidad</h3>
        <div *ngIf="schedules; else loadingSc" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div *ngFor="let s of schedules" class="border rounded p-3">
              <div class="flex items-center gap-2">
                <select class="border rounded px-2 py-1" [(ngModel)]="s.dayOfWeek">
                  <option *ngFor="let d of days" [ngValue]="d">{{ d }}</option>
                </select>
                <input type="time" class="border rounded px-2 py-1" [(ngModel)]="s.startTime" />
                <input type="time" class="border rounded px-2 py-1" [(ngModel)]="s.endTime" />
                <button class="bg-indigo-600 text-white px-3 py-1 rounded" (click)="updateSchedule(s)" [disabled]="updatingScheduleId === s.id">
                  <span *ngIf="updatingScheduleId !== s.id">Guardar</span>
                  <span *ngIf="updatingScheduleId === s.id">Guardando…</span>
                </button>
                <button class="text-red-600 underline px-2" (click)="deleteSchedule(s)" [disabled]="deletingScheduleId === s.id">
                  <span *ngIf="deletingScheduleId !== s.id">Eliminar</span>
                  <span *ngIf="deletingScheduleId === s.id">Eliminando…</span>
                </button>
              </div>
            </div>
          </div>

          <div class="border-t pt-4">
            <h4 class="font-medium mb-2">Crear nuevo horario</h4>
            <div class="flex flex-wrap items-center gap-2">
              <select class="border rounded px-2 py-1" [(ngModel)]="newDay">
                <option *ngFor="let d of days" [ngValue]="d">{{ d }}</option>
              </select>
              <input type="time" class="border rounded px-2 py-1" [(ngModel)]="newStart" />
              <input type="time" class="border rounded px-2 py-1" [(ngModel)]="newEnd" />
              <button class="bg-green-600 text-white px-3 py-1 rounded" (click)="createSchedule()" [disabled]="isCreatingSchedule">
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
  `
})
export class BarberDashboardComponent implements OnInit {
  me?: Barber;
  meActiveDraft = true;
  // NUEVO: edición básica y filtro de próximas reservas
  meNameDraft = '';
  meSpecialtiesDraft = '';
  meCutTypesDraft = '';
  meExperienceDraft: number = 0;
  meBioDraft = '';
  bookings?: Booking[];
  bookingsUpcoming?: Booking[];
  bookingsHistory?: Booking[];
  viewFilter: 'UPCOMING' | 'HISTORY' | 'ALL' = 'UPCOMING';
  schedules?: Schedule[];

  // Estados de guardado/acción
  isSavingActive = false;
  isSavingBasics = false;
  actionBookingId?: string | number;
  updatingScheduleId?: string | number;
  deletingScheduleId?: string | number;
  isCreatingSchedule = false;

  days: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  newDay: string = 'MONDAY';
  newStart: string = '09:00';
  newEnd: string = '17:00';

  constructor(private barber: BarberService, private notifications: NotificationsService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.barber.me().subscribe({
      next: (me) => { this.me = me; this.meActiveDraft = !!me.active; this.meNameDraft = me.name || ''; this.meSpecialtiesDraft = (me.specialties || []).join(', '); this.meCutTypesDraft = (me.cutTypes || []).join(', '); this.meExperienceDraft = me.experienceYears || 0; this.meBioDraft = me.bio || ''; },
      error: () => { /* si no está vinculado, mostrar vacío */ }
    });
    this.barber.bookings().subscribe({ next: (bs) => { this.bookings = bs; this.computeViews(); } });
     this.barber.schedules().subscribe({ next: (ss) => this.schedules = ss });
   }

  saveActive() {
    if (!this.me) return;
    this.isSavingActive = true;
    this.barber.updateMe({ active: this.meActiveDraft }).subscribe({
      next: (updated) => { this.me = updated; this.notifications.success('Estado actualizado'); this.isSavingActive = false; },
      error: () => { this.notifications.error('No se pudo actualizar el estado'); this.isSavingActive = false; }
    });
  }

  // NUEVO: guardar cambios básicos de perfil
  saveBasics() {
    const specialties = this.meSpecialtiesDraft
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s);
    const cutTypes = this.meCutTypesDraft
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s);
    this.isSavingBasics = true;
    this.barber.updateMe({ name: this.meNameDraft, specialties, cutTypes, experienceYears: this.meExperienceDraft, bio: this.meBioDraft }).subscribe({
      next: (updated) => { this.me = updated; this.notifications.success('Perfil actualizado'); this.isSavingBasics = false; },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo actualizar el perfil'); this.isSavingBasics = false; }
    });
  }

  // NUEVO: calcular vistas de próximas e historial
  private computeViews() {
  const now = new Date();
  const all = this.bookings || [];
  this.bookingsUpcoming = all.filter(b => {
  const end = new Date(b.endTime);
  const status = (b.status || 'CONFIRMED');
  return status !== 'CANCELLED' && status !== 'COMPLETED' && end >= now;
  });
  this.bookingsHistory = all.filter(b => {
  const end = new Date(b.endTime);
  const status = (b.status || 'CONFIRMED');
  return (status === 'CANCELLED' || status === 'COMPLETED') || end < now;
  });
  }

  // NUEVO: refrescar reservas desde servidor
  refreshBookings() {
  this.barber.bookings().subscribe({ next: (bs) => { this.bookings = bs; this.computeViews(); } });
  }

  // NUEVO: lógica para cancelar si está en futuro y no cancelada
  canCancel(b: Booking): boolean {
    const start = new Date(b.startTime);
    const status = (b.status || 'CONFIRMED');
    return status !== 'CANCELLED' && start > new Date();
  }

  // NUEVO: cancelar reserva
  async cancelBooking(b: Booking) {
    if (!b.id) return;
    const ok = await this.confirm.confirm({ message: '¿Cancelar esta reserva?', confirmText: 'Sí, cancelar', cancelText: 'No' });
    if (!ok) return;
    this.actionBookingId = b.id;
    this.barber.cancelBooking(b.id).subscribe({
      next: () => { this.refreshBookings(); this.notifications.success('Reserva cancelada'); this.actionBookingId = undefined; },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo cancelar la reserva'); this.actionBookingId = undefined; }
    });
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

  formatDate(dt: string) {
    try {
      const d = new Date(dt);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch { return dt; }
  }

  // NUEVO: lógica para completar si ya inició y no cancelada/completada
  canComplete(b: Booking): boolean {
    const start = new Date(b.startTime);
    const status = (b.status || 'CONFIRMED');
    return status !== 'CANCELLED' && status !== 'COMPLETED' && start <= new Date();
  }

  // NUEVO: completar reserva
  async completeBooking(b: Booking) {
    if (!b.id) return;
    const ok = await this.confirm.confirm({ message: '¿Marcar esta reserva como completada?', confirmText: 'Sí, completar', cancelText: 'No' });
    if (!ok) return;
    this.actionBookingId = b.id;
    this.barber.completeBooking(b.id).subscribe({
      next: () => { this.refreshBookings(); this.notifications.success('Reserva marcada como completada'); this.actionBookingId = undefined; },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo completar la reserva'); this.actionBookingId = undefined; }
    });
  }
  // NUEVO: lista filtrada según el filtro actual
  get filteredBookings(): Booking[] {
    switch (this.viewFilter) {
      case 'UPCOMING': return this.bookingsUpcoming || [];
      case 'HISTORY': return this.bookingsHistory || [];
      default: return this.bookings || [];
    }
  }
}
