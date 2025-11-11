import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

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
  private baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  listBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.baseUrl}/barbers`);
  }

  listServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${this.baseUrl}/services`);
  }
}
