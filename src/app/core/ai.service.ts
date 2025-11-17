import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_AI_URL } from './api.config';
import { LRUCache } from './datastructures/lru-cache';
import { RequestQueue } from './datastructures/request-queue';
import { firstValueFrom } from 'rxjs';

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
  // URL del módulo de IA, configurable por runtime
  private baseUrl = API_AI_URL;
  // Caché LRU para respuestas de IA (estructura de datos aplicada)
  private cache = new LRUCache<string, ChatResponse>(50);
  // Cola FIFO para serializar peticiones a IA (evita ráfagas)
  private queue = new RequestQueue();
  constructor(private http: HttpClient) {}

  chat(req: ChatRequest): Observable<ChatResponse> {
    const key = this.cacheKeyForChat(req);
    const cached = this.cache.get(key);
    if (cached) return of(cached);
    const obs = this.http.post<ChatResponse>(`${this.baseUrl}/chat`, req);
    return from(this.queue.enqueue(() => firstValueFrom(obs))).pipe(
      tap(res => this.cache.set(key, res))
    );
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
    const key = this.cacheKeyForPhoto(file, faceDescription);
    const cached = this.cache.get(key);
    if (cached) return of(cached);
    const obs = this.http.post<ChatResponse>(`${this.baseUrl}/recommend-from-photo`, form);
    return from(this.queue.enqueue(() => firstValueFrom(obs))).pipe(
      tap(res => this.cache.set(key, res))
    );
  }

  private cacheKeyForChat(req: ChatRequest): string {
    const face = (req.faceDescription || '').trim().toLowerCase();
    const msgs = (req.messages || []).map(m => `${m.role}:${(m.content || '').trim().toLowerCase()}`).join('|');
    return `chat:${face}:${msgs}`;
  }

  private cacheKeyForPhoto(file: File, faceDescription?: string): string {
    const meta = `${file.name}|${file.size}|${file.lastModified}`;
    const face = (faceDescription || '').trim().toLowerCase();
    return `photo:${meta}:${face}`;
  }
}