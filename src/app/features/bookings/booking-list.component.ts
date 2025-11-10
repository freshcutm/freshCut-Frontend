import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService, Booking } from '../../core/booking.service';
import { AuthService } from '../../core/auth.service';
import { NotificationsService } from '../../ui/notifications.service';
import { ConfirmService } from '../../ui/confirm.service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-0">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 class="text-2xl font-semibold">Reservas</h2>
        <a routerLink="/reservas/nueva" class="bg-indigo-600 text-white px-4 py-2 rounded w-full md:w-auto text-center">Nueva</a>
      </div>
      <div class="text-sm text-gray-600 mb-2" *ngIf="auth.role() !== 'ADMIN'">
        Mostrando solo tus reservas ({{ auth.email() }}).
      </div>
      <div class="bg-white shadow-sm border rounded divide-y overflow-x-auto">
        <div *ngFor="let b of bookings" class="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="break-words">
            <div class="font-medium">{{ b.clientName }} — {{ b.service }}</div>
            <div class="text-sm text-gray-500">{{ b.barber }} • {{ b.startTime | date:'short' }}</div>
          </div>
          <div class="flex flex-wrap gap-3 items-center justify-start sm:justify-end">
            <span class="text-xs px-2 py-1 rounded" [ngClass]="b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
              {{ b.status || 'CONFIRMED' }}
            </span>
            <a class="text-indigo-600 hover:underline" [routerLink]="['/reservas/editar', b.id]">Editar</a>
            <button class="text-yellow-700 hover:underline" (click)="cancel(b)" [disabled]="b.status === 'CANCELLED'">Cancelar</button>
            <button class="text-red-600 hover:underline" (click)="remove(b)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(private bookingService: BookingService, public auth: AuthService, private notifications: NotificationsService, private confirm: ConfirmService) {}

  ngOnInit(): void { this.load(); }

  load() {
    if (this.auth.role() === 'ADMIN') {
      this.bookingService.list().subscribe({
        next: (data) => this.bookings = data,
        error: (err) => {
          if (err?.status === 401) { this.auth.logout(); return; }
          this.notifications.error(err?.error?.error || 'No se pudo cargar las reservas');
        }
      });
    } else {
      this.bookingService.my().subscribe({
        next: (data) => this.bookings = data,
        error: (err) => {
          if (err?.status === 401) { this.auth.logout(); return; }
          this.notifications.error(err?.error?.error || 'No se pudo cargar tus reservas');
        }
      });
    }
  }

  async cancel(b: Booking) {
    if (!b.id) return;
    const ok = await this.confirm.confirm({ message: '¿Cancelar esta reserva?', confirmText: 'Sí, cancelar', cancelText: 'No' });
    if (!ok) return;
    this.bookingService.cancel(b.id).subscribe({
      next: (res) => { b.status = res.status || 'CANCELLED'; this.notifications.success('Reserva cancelada'); },
      error: (err) => this.notifications.error(err?.error?.error || 'No se pudo cancelar')
    });
  }

  async remove(b: Booking) {
    if (!b.id) return;
    const ok = await this.confirm.confirm({ message: '¿Eliminar esta reserva?', confirmText: 'Sí, eliminar', cancelText: 'No' });
    if (!ok) return;
    this.bookingService.delete(b.id).subscribe({
      next: () => { this.bookings = this.bookings.filter(x => x.id !== b.id); this.notifications.success('Reserva eliminada'); },
      error: (err) => this.notifications.error(err?.error?.error || 'No se pudo eliminar')
    });
  }
}