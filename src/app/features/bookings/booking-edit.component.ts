import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BookingService, Booking } from '../../core/booking.service';
import { CatalogService, Barber, ServiceItem } from '../../core/catalog.service';
import { AuthService } from '../../core/auth.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-booking-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 class="barber-title text-3xl font-bold mb-4">Editar reserva</h2>
      <form (ngSubmit)="save()" class="grid gap-4" *ngIf="loaded">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium">Fecha</label>
            <input [(ngModel)]="date" name="date" type="date" class="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium">Hora</label>
            <input [(ngModel)]="time" name="time" type="time" class="w-full border rounded px-3 py-2" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium">Barbero</label>
            <select [(ngModel)]="barber" name="barber" class="w-full border rounded px-3 py-2" required>
              <option *ngFor="let b of barbers" [ngValue]="b">{{ b.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium">Servicio</label>
            <select [(ngModel)]="service" name="service" class="w-full border rounded px-3 py-2" required>
              <option *ngFor="let s of services" [ngValue]="s">{{ s.name }}</option>
            </select>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button class="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" type="submit">Guardar cambios</button>
          <button class="w-full sm:w-auto border px-4 py-2 rounded" type="button" (click)="back()">Cancelar</button>
        </div>
      </form>
      <div *ngIf="!loaded">Cargando reserva...</div>
    </div>
  `
})
export class BookingEditComponent implements OnInit {
  id = '';
  date = '';
  time = '';
  barber?: Barber;
  service?: ServiceItem;
  loaded = false;
  private originalClientName = '';

  barbers: Barber[] = [];
  services: ServiceItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private catalog: CatalogService,
    private auth: AuthService,
    private notifications: NotificationsService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    forkJoin({
      barbers: this.catalog.listBarbers(),
      services: this.catalog.listServices(),
      booking: this.bookingService.get(this.id)
    }).subscribe({
      next: ({ barbers, services, booking }) => {
        this.barbers = barbers;
        this.services = services;
        this.initFromBooking(booking);
        this.loaded = true;
      },
      error: (err) => {
        if (err?.status === 401) { this.auth.logout(); return; }
        this.notifications.error('No se pudo cargar la reserva');
        this.router.navigateByUrl('/reservas');
      }
    });
  }

  private initFromBooking(b: Booking) {
    this.originalClientName = b.clientName;
    const d = new Date(b.startTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.date = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    this.time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    this.barber = this.barbers.find(x => x.name === b.barber);
    this.service = this.services.find(x => x.name === b.service);
  }

  save() {
    const start = `${this.date}T${this.time}:00`;
    const duration = this.service?.durationMinutes ?? 30;
    const end = this.addMinutesToIso(start, duration);
    const payload: Booking = {
      clientName: this.originalClientName,
      barber: this.barber?.name || '',
      service: this.service?.name || '',
      startTime: start,
      endTime: end
    };
    this.bookingService.update(this.id, payload).subscribe({
      next: () => {
        this.notifications.success('Reserva actualizada');
        this.router.navigateByUrl('/reservas');
      },
      error: (err) => {
        if (err?.status === 401) { this.auth.logout(); return; }
        this.notifications.error(err?.error?.error || 'No se pudo actualizar la reserva');
      }
    });
  }

  back() { this.router.navigateByUrl('/reservas'); }

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
}