import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Barber {
  id: string;
  name: string;
  specialties?: string[];
  // Nuevo: perfil extendido
  bio?: string;
  experienceYears?: number;
  cutTypes?: string[];
  active: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.baseUrl}/barbers`);
  }

  listServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this.baseUrl}/services`);
  }
}
