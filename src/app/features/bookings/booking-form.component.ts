import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { BookingService } from '../../core/booking.service';
import { AuthService } from '../../core/auth.service';
import { CatalogService, Barber, ServiceItem } from '../../core/catalog.service';
import { serviceIconPath, serviceIconColor, serviceIconStrokeWidth } from '../../core/service-icons';
import { CurrencyService } from '../../core/currency.service';
import { realDurationMinutes } from '../../core/duration-realism';
import { NotificationsService } from '../../ui/notifications.service';
// Chat de IA movido a página independiente

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-2xl mx-auto p-8 bg-white shadow-sm border rounded-lg">
      <h2 class="text-2xl font-semibold mb-6">Nueva reserva</h2>
      <form (ngSubmit)="submit()" class="grid gap-5">
        <!-- Catálogo de servicios como tarjetas -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium">Elige un servicio</label>
            <span class="text-xs text-gray-500">Selecciona una tarjeta o usa el desplegable</span>
          </div>
          <div *ngIf="services.length; else noServices" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button"
                    *ngFor="let s of services"
                    (click)="service = s; updatePreview()"
                    class="bg-white border rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition"
                    [ngClass]="service?.id === s.id ? 'ring-2 ring-indigo-500 border-indigo-500' : ''">
              <div class="flex items-center gap-3 mb-1">
                <div class="w-14 h-14 rounded-full flex items-center justify-center border" [ngClass]="iconColorFor(s.name)">
                  <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <!-- Marco/emblema del color del servicio -->
                    <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-opacity="0.25" stroke-width="1" fill="none"></circle>
                    <!-- Icono del servicio, limpio y centrado -->
                    <path [attr.d]="iconFor(s.name)" stroke="currentColor" [attr.stroke-width]="strokeFor(s.name)" fill="none"></path>
                  </svg>
                </div>
                <div class="font-semibold text-gray-900">{{ s.name }}</div>
              </div>
              <div class="text-sm text-gray-500">Duración estimada {{ realDuration(s) }} min · {{ formatPrice(s.priceCents) }}</div>
            </button>
          </div>
          <ng-template #noServices>
            <div class="border rounded p-3 text-sm text-gray-600">Aún no hay servicios disponibles.</div>
          </ng-template>
        </div>

        <div class="bg-indigo-50 border border-indigo-100 rounded p-4" *ngIf="couponPct && service">
          <div class="text-sm">Cupón activo: <span class="font-semibold">{{ couponPct }}%</span> de descuento en este servicio</div>
          <div class="text-xs text-gray-600">Precio estimado: <span class="font-semibold">{{ priceWithCoupon(service.priceCents || 0) }}</span> (antes {{ formatPrice(service.priceCents || 0) }})</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Fecha</label>
            <input [(ngModel)]="date" name="date" type="date" [min]="minDate" (change)="onDateChange()" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Hora</label>
            <input [(ngModel)]="time" name="time" type="time" [attr.min]="minTime" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Barbero</label>
            <select [(ngModel)]="barber" name="barber" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
              <option *ngFor="let b of barbers" [ngValue]="b">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <!-- Se eliminó el chat; usar la página "/ia" para recomendaciones -->

        <div class="flex flex-wrap gap-3 mt-2">
          <button [disabled]="isSubmitting" class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed" type="submit">
            <span *ngIf="isSubmitting" class="inline-flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Procesando...
            </span>
            <span *ngIf="!isSubmitting">Reservar</span>
          </button>
          <a routerLink="/reservas" href="/reservas" class="btn btn-outline w-full sm:w-auto text-center">Ver mis reservas</a>
        </div>
      </form>
    </div>
  `
})
export class BookingFormComponent implements OnInit {
  date = '';
  time = '';
  barber?: Barber;
  service?: ServiceItem;
  // chat eliminado
  
  barbers: Barber[] = [];
  services: ServiceItem[] = [];
  minDate = '';
  minTime: string | null = null;
  isSubmitting = false;
  couponPct = 0;
  finalPricePreview?: number;

  constructor(
    private bookingService: BookingService,
    private auth: AuthService,
    private catalog: CatalogService,
    private router: Router,
    private currency: CurrencyService,
    private notifications: NotificationsService
  ) {}

  ngOnInit(): void {
    this.currency.warmup();
    this.minDate = this.formatDate(new Date());
    this.catalog.listBarbers().subscribe({
      next: (data) => this.barbers = data,
      error: (err) => {
        if (err?.status === 401) { this.auth.logout(); return; }
        this.notifications.error(err?.error?.error || 'No se pudo cargar barberos');
      }
    });
    this.catalog.listServices().subscribe({
      next: (data) => { this.services = data; this.updatePreview(); },
      error: (err) => {
        if (err?.status === 401) { this.auth.logout(); return; }
        this.notifications.error(err?.error?.error || 'No se pudo cargar servicios');
      }
    });
    this.restoreCoupon();
  }

  iconFor(name: string): string { return serviceIconPath(name); }
  iconColorFor(name: string): string { return serviceIconColor(name); }
  strokeFor(name: string): number { return serviceIconStrokeWidth(name); }

  submit() {
    if (!this.auth.isLoggedIn() || this.auth.role() !== 'USER') {
      this.notifications.error('Debes iniciar sesión como usuario para reservar');
      return;
    }
    if (!this.service) {
      this.notifications.warning('Debes seleccionar un servicio antes de reservar');
      return;
    }
    this.isSubmitting = true;
    const start = `${this.date}T${this.time}:00`;
    const duration = this.service.durationMinutes ?? 30;
    const end = this.addMinutesToIso(start, duration);
    const client = this.auth.email() || 'Invitado';
    const barberName = this.barber ? this.barber.name : '';
    const serviceName = this.service.name;
    if (new Date(start).getTime() < new Date().getTime()) {
      this.notifications.error('Selecciona una fecha y hora futuras');
      this.isSubmitting = false;
      return;
    }
    this.bookingService.create({ clientName: client, barber: barberName, service: serviceName, startTime: start, endTime: end }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res && res.id) {
          this.clearCoupon();
          this.notifications.success('Reserva creada');
          this.router.navigateByUrl('/reservas');
        } else {
          const msg = res?.error || 'No se pudo crear la reserva';
          this.notifications.error(msg);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err?.status === 401) { this.auth.logout(); return; }
        const msg = err?.error?.error || 'No se pudo crear la reserva';
        this.notifications.error(msg);
      }
    });
  }

  private addMinutesToIso(iso: string, minutes: number): string {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() + minutes);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  }

  formatPrice(cents: number): string {
    return this.currency.formatEurosCentsToCOP(cents);
  }
  priceWithCoupon(cents: number): string {
    const pct = this.couponPct || 0;
    const discounted = Math.round((cents || 0) * (100 - pct) / 100);
    return this.currency.formatEurosCentsToCOP(discounted);
  }

  realDuration(s: ServiceItem): number {
    return realDurationMinutes(s.name, s.durationMinutes);
  }
  restoreCoupon() {
    const key = 'coupon_' + (this.auth.email() || '');
    try { const raw = localStorage.getItem(key); if (raw) { const obj = JSON.parse(raw || '{}'); const pct = parseInt(String(obj?.pct || '0'), 10); if (!isNaN(pct) && pct > 0) this.couponPct = pct; } } catch {}
  }
  clearCoupon() {
    const key = 'coupon_' + (this.auth.email() || '');
    try { localStorage.removeItem(key); } catch {}
    this.couponPct = 0;
    const ek = (this.auth.email() || '');
    try { localStorage.setItem('wheel_used_' + ek, JSON.stringify({ used: false })); } catch {}
  }
  updatePreview() {
    if (!this.service) { this.finalPricePreview = undefined; return; }
    const base = this.service.priceCents || 0;
    const pct = this.couponPct || 0;
    this.finalPricePreview = Math.round(base * (100 - pct) / 100);
  }

  private formatDate(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    return `${yyyy}-${mm}-${dd}`;
  }

  onDateChange() {
    const today = this.formatDate(new Date());
    if (this.date === today) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      this.minTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      if (this.time && this.minTime && this.time < this.minTime) this.time = this.minTime;
    } else {
      this.minTime = null;
    }
  }
}