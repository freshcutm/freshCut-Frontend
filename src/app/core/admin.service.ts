import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Barber, ServiceItem } from './catalog.service';

export interface AdminUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'BARBER';
  name?: string;
  barberId?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = `${API_BASE_URL}/admin`;

  constructor(private http: HttpClient) {}

  createBarber(payload: Partial<Barber>): Observable<Barber> {
    return this.http.post<Barber>(`${this.baseUrl}/barbers`, payload);
  }

  listBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.baseUrl}/barbers`);
  }

  updateBarber(id: string, payload: Partial<Barber>): Observable<Barber> {
    return this.http.put<Barber>(`${this.baseUrl}/barbers/${id}`, payload);
  }

  deleteBarber(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/barbers/${id}`);
  }

  // Servicios (ADMIN)
  listServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this.baseUrl}/services`);
  }

  getService(id: string): Observable<ServiceItem> {
    return this.http.get<ServiceItem>(`${this.baseUrl}/services/${id}`);
  }

  createService(payload: Partial<ServiceItem>): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(`${this.baseUrl}/services`, payload);
  }

  updateService(id: string, payload: Partial<ServiceItem>): Observable<ServiceItem> {
    return this.http.put<ServiceItem>(`${this.baseUrl}/services/${id}`, payload);
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${id}`);
  }

  // Usuarios (ADMIN)
  listUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  getUserByEmail(email: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/users/by-email/${encodeURIComponent(email)}`);
  }

  deleteUserByEmail(email: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/by-email/${encodeURIComponent(email)}`);
  }
}