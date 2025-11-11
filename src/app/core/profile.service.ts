import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface Profile {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'BARBER';
  name?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private baseUrl = `${API_BASE_URL}/profile`;
  constructor(private http: HttpClient) {}

  me(): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/me`);
  }

  update(payload: { name?: string }): Observable<Profile> {
    return this.http.put<Profile>(`${this.baseUrl}/me`, payload);
  }

  uploadAvatar(file: File): Observable<Profile> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Profile>(`${this.baseUrl}/avatar`, form);
  }
}