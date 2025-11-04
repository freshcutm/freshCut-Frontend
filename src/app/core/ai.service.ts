import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: AiMessage[];
  faceDescription?: string;
}

export interface ChatResponse { reply: string; }

@Injectable({ providedIn: 'root' })
export class AiService {
  private baseUrl = 'http://localhost:8080/api/ai';
  constructor(private http: HttpClient) {}

  chat(req: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, req);
  }

  editHair(
    file: File,
    faceDescription?: string,
    style?: string,
    strength?: number
  ): Observable<Blob> {
    const form = new FormData();
    form.append('file', file);
    if (faceDescription) form.append('faceDescription', faceDescription);
    if (style) form.append('style', style);
    if (typeof strength === 'number') form.append('strength', String(strength));
    return this.http.post(`${this.baseUrl}/edit-hair`, form, { responseType: 'blob' });
  }

  recommendFromPhoto(
    file: File,
    faceDescription?: string
  ): Observable<ChatResponse> {
    const form = new FormData();
    form.append('file', file);
    if (faceDescription) form.append('faceDescription', faceDescription);
    return this.http.post<ChatResponse>(`${this.baseUrl}/recommend-from-photo`, form);
  }
}