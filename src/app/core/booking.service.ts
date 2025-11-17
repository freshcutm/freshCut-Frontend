import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Booking {
  id?: string;
  clientName: string;
  barber: string;
  service: string;
  startTime: string; // ISO local datetime
  endTime: string;   // ISO local datetime
  priceCents?: number;
  status?: 'CONFIRMED' | 'CANCELLED';
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${API_BASE_URL}/bookings`;

  constructor(private http: HttpClient) {}

  list(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.baseUrl);
  }

  // Nuevo: obtener reservas del usuario autenticado
  my(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/my`);
  }

  create(payload: Booking): Observable<any> {
    // El backend puede responder 201 con Booking o 200 con { error: string }
    return this.http.post(this.baseUrl, payload);
  }

  get(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  update(id: string, payload: Booking): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${id}`, payload);
  }

  cancel(id: string): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/${id}/cancel`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
