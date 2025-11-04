import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Barber } from './catalog.service';

// Tipos usados por el panel del barbero
export interface Schedule {
  id: string | number;
  barberId?: string | number;
  dayOfWeek: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface Booking {
  id: string | number;
  clientName: string;
  barber?: string;
  service: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  priceCents?: number;
  status?: string; // CONFIRMED | CANCELLED | COMPLETED
}

@Injectable({ providedIn: 'root' })
export class BarberService {
  private baseUrl = 'http://localhost:8080/api/barber';
  private bookingsUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  me(): Observable<Barber> {
    return this.http.get<Barber>(`${this.baseUrl}/me`);
  }

  updateMe(update: Partial<Barber>): Observable<Barber> {
    return this.http.put<Barber>(`${this.baseUrl}/me`, update);
  }

  bookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings`);
  }

  cancelBooking(id: string | number): Observable<Booking> {
    return this.http.post<Booking>(`${this.bookingsUrl}/${id}/cancel`, {});
  }

  // NUEVO: completar una reserva por id
  completeBooking(id: string | number): Observable<Booking> {
    return this.http.post<Booking>(`${this.bookingsUrl}/${id}/complete`, {});
  }

  schedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.baseUrl}/schedules`);
  }

  createSchedule(s: Partial<Schedule>): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.baseUrl}/schedules`, s);
  }

  updateSchedule(id: string | number, s: Partial<Schedule>): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.baseUrl}/schedules/${id}`, s);
  }

  deleteSchedule(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/schedules/${id}`);
  }
}