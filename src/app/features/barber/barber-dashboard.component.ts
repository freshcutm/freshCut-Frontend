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
      <div class="flex items-center mb-6">
        <h2 class="barber-title text-3xl font-bold">Editar perfil</h2>
      </div>

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
  monthCursor: Date = new Date();
  focusDate?: Date;

  constructor(private barber: BarberService, private notifications: NotificationsService, private confirm: ConfirmService) {}

  ngOnInit(): void {
    this.barber.me().subscribe({
      next: (me) => { this.me = me; this.meActiveDraft = !!me.active; this.meNameDraft = me.name || ''; this.meSpecialtiesDraft = (me.specialties || []).join(', '); this.meCutTypesDraft = (me.cutTypes || []).join(', '); this.meExperienceDraft = me.experienceYears || 0; this.meBioDraft = me.bio || ''; },
      error: () => { /* si no está vinculado, mostrar vacío */ }
    });
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
    const base = (() => {
      switch (this.viewFilter) {
        case 'UPCOMING': return this.bookingsUpcoming || [];
        case 'HISTORY': return this.bookingsHistory || [];
        default: return this.bookings || [];
      }
    })();
    if (!this.focusDate) return base;
    return base.filter(b => this.sameDay(new Date(b.startTime), this.focusDate as Date));
  }

  weeklyOccupancyPct = 0;
  occupancyMetrics: { day: string; pct: number }[] = [];
  peakHoursText = '';
  earningsMonths: string[] = [];
  earningsValues: number[] = [];
  projectedIncome = 0;
  topService?: { name: string; revenue: number };
  cancelRate = 0;
  currentVsPrevDelta = 0;
  topClients: { name: string; revenue: number; count: number }[] = [];
  assistantTips: string[] = [];
  private assistantHeadlineLast?: string;
  darkMode = false;
  ringStyle(pct: number, color: string) { const p = Math.max(0, Math.min(100, Math.round(pct))); return { background: `conic-gradient(${color} ${p}%, rgba(0,0,0,0.08) 0)` }; }

  get weekDays() {
    const start = this.startOfWeek(new Date());
    const items: { label: string; date: Date; items: Booking[]; available: number; booked: number; occupancyPct: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(day);
      const bks = (this.bookings || []).filter(b => this.sameDay(new Date(b.startTime), day));
      const avail = this.availableMinutes(day);
      const booked = bks.reduce((acc, b) => acc + this.durationMinutes(b), 0);
      const pct = avail > 0 ? Math.min(100, Math.round((booked / avail) * 100)) : 0;
      items.push({ label, date: day, items: bks, available: avail, booked, occupancyPct: pct });
    }
    this.weeklyOccupancyPct = this.safeAvg(items.map(x => x.occupancyPct));
    this.occupancyMetrics = items.map(x => ({ day: x.label, pct: x.occupancyPct }));
    this.peakHoursText = this.computePeakHoursText(items);
    this.computeFinancials();
    return items;
  }

  private computeFinancials() {
    const now = new Date();
    const months: string[] = [];
    const vals: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = d.getMonth();
      const yy = d.getFullYear();
      months.push(new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d));
      const v = (this.bookings || [])
        .filter(b => {
          const dt = new Date(b.startTime);
          return dt.getMonth() === mm && dt.getFullYear() === yy && (b.status !== 'CANCELLED');
        })
        .reduce((acc, b) => acc + (b.priceCents || 0), 0);
      vals.push(v);
    }
    this.earningsMonths = months;
    this.earningsValues = vals;
    const cur = vals[vals.length - 1] || 0;
    const prev = vals[vals.length - 2] || 1;
    this.currentVsPrevDelta = Math.round(((cur - prev) / prev) * 100);
    this.projectedIncome = (this.bookingsUpcoming || [])
      .filter(b => (b.status !== 'CANCELLED'))
      .reduce((acc, b) => acc + (b.priceCents || 0), 0);
    const byService: Record<string, number> = {};
    (this.bookings || []).forEach(b => {
      if (b.status === 'CANCELLED') return;
      const k = b.service || 'Otro';
      byService[k] = (byService[k] || 0) + (b.priceCents || 0);
    });
    const top = Object.entries(byService).sort((a, b) => b[1] - a[1])[0];
    this.topService = top ? { name: top[0], revenue: top[1] } : undefined;
    const total = (this.bookings || []).length || 1;
    const cancelled = (this.bookings || []).filter(b => b.status === 'CANCELLED').length;
    this.cancelRate = Math.round((cancelled / total) * 100);
    const byClient: Record<string, { revenue: number; count: number }> = {};
    (this.bookings || []).forEach(b => {
      const k = b.clientName || '—';
      const rev = b.status === 'CANCELLED' ? 0 : (b.priceCents || 0);
      const prevC = byClient[k]?.count || 0;
      const prevR = byClient[k]?.revenue || 0;
      byClient[k] = { revenue: prevR + rev, count: prevC + 1 };
    });
    this.topClients = Object.entries(byClient)
      .map(([name, v]) => ({ name, revenue: v.revenue, count: v.count }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    this.computeAssistantTips();
  }

  private computePeakHoursText(items: { items: Booking[] }[]): string {
    const counts: Record<string, number> = {};
    items.forEach(day => {
      day.items.forEach(b => {
        const d = new Date(b.startTime);
        const h = d.getHours();
        const key = `${String(h).padStart(2, '0')}:00`;
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2);
    if (!top.length) return '';
    const ranges = top.map(([hh]) => {
      const h = parseInt(hh.slice(0,2), 10);
      const end = (h + 1) % 24;
      return `${hh}–${String(end).padStart(2,'0')}:00`;
    });
    return ranges.join(', ');
  }

  private computeAssistantTips() {
    const tips: string[] = [];
    tips.push(`Tu agenda está al ${this.weeklyOccupancyPct}% esta semana`);
    const lowSlots = this.lowOccupancySlots();
    if (lowSlots) tips.push(`Detectamos baja ocupación ${lowSlots}. Considera promociones en esos horarios`);
    if (this.topService) tips.push(`Tus servicios de mayor margen: ${this.topService.name}. Promuévelos más`);
    const delta = this.currentVsPrevDelta;
    if (delta < 0) tips.push(`Podrías aumentar ingresos ajustando precios de servicios premium`);
    tips.push('Quienes toman corte A a menudo requieren barba. Ofrece combos');
    tips.push(`Tu tasa de cancelación es ${this.cancelRate}%. Activa recordatorios o depósitos`);
    tips.push('Identifica períodos de baja demanda y lanza campañas puntuales');
    tips.push('Extiende horario en días de alta demanda y prueba nuevos servicios');
    this.assistantTips = tips;
    const headline = lowSlots ? 'Baja ocupación detectada. Revisa promociones sugeridas.' : 'Agenda saludable esta semana.';
    if (headline !== this.assistantHeadlineLast) {
      if (lowSlots) this.notifications.info(headline); else this.notifications.success(headline);
      this.assistantHeadlineLast = headline;
    }
  }

  private lowOccupancySlots(): string {
    const metrics = this.occupancyMetrics || [];
    const lows = metrics.filter(x => x.pct < 40).map(x => x.day);
    return lows.length ? `en ${lows.join(', ')}` : '';
  }

  private startOfWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  }
  private startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private endOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth()+1, 0); }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private availableMinutes(day: Date): number {
    const dow = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][day.getDay()];
    const slots = (this.schedules || []).filter(s => s.dayOfWeek === dow);
    return slots.reduce((acc, s) => acc + this.hhmmToMinutes(s.startTime, s.endTime), 0);
  }

  private durationMinutes(b: Booking): number {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  }

  private hhmmToMinutes(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(n => parseInt(n, 10));
    const [eh, em] = end.split(':').map(n => parseInt(n, 10));
    return ((eh * 60 + em) - (sh * 60 + sm));
  }

  private safeAvg(nums: number[]): number { const s = nums.reduce((a, b) => a + b, 0); const n = nums.length || 1; return Math.round(s / n); }

  timeShort(iso: string): string { return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); }

  earnBarHeight(cents: number): string {
    const max = Math.max(...this.earningsValues, 1);
    const h = Math.round((cents / max) * 140) + 20;
    return h + 'px';
  }

  earnBarColor(cents: number): string {
    const avg = this.safeAvg(this.earningsValues) || 1;
    if (cents > avg * 1.2) return 'bg-indigo-400 rounded';
    if (cents > avg * 1.05) return 'bg-indigo-300 rounded';
    return 'bg-indigo-200 rounded';
  }

  formatCOP(cents: number): string {
    const euros = (cents || 0) / 100;
    const cop = euros * 4300;
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cop);
    } catch { return `${Math.round(cop)} COP`; }
  }
  prevMonth() { this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() - 1, 1); }
  nextMonth() { this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() + 1, 1); }
  monthName(d: Date): string { return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d); }
  get monthDays() {
    const start = this.startOfMonth(this.monthCursor);
    const end = this.endOfMonth(this.monthCursor);
    const days: { date: Date; items: Booking[]; occupancyPct: number }[] = [];
    for (let i = 1; i <= end.getDate(); i++) {
      const day = new Date(start.getFullYear(), start.getMonth(), i);
      const items = (this.bookings || []).filter(b => this.sameDay(new Date(b.startTime), day));
      const avail = this.availableMinutes(day);
      const booked = items.reduce((acc, b) => acc + this.durationMinutes(b), 0);
      const pct = avail > 0 ? Math.min(100, Math.round((booked / avail) * 100)) : 0;
      days.push({ date: day, items, occupancyPct: pct });
    }
    return days;
  }
  openDay(d: Date) { this.focusDate = d; this.viewFilter = 'ALL'; }
  clearFocus() { this.focusDate = undefined; }
}
