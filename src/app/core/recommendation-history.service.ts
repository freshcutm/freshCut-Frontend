import { Injectable } from '@angular/core';

export interface RecommendationEntry {
  id: string;
  timestamp: string;
  cutName: string;
  features: string;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class RecommendationHistoryService {
  private key = 'recommendation_history';

  list(): RecommendationEntry[] {
    try {
      const raw = localStorage.getItem(this.key);
      const arr = raw ? JSON.parse(raw) as RecommendationEntry[] : [];
      return Array.isArray(arr) ? arr.sort((a,b) => (a.timestamp > b.timestamp ? -1 : 1)) : [];
    } catch { return []; }
  }

  add(entry: Omit<RecommendationEntry, 'id' | 'timestamp'>) {
    const e: RecommendationEntry = {
      id: this.uuid(),
      timestamp: new Date().toISOString(),
      cutName: entry.cutName.trim(),
      features: entry.features.trim(),
      reason: entry.reason.trim(),
    };
    const arr = this.list();
    arr.unshift(e);
    try { localStorage.setItem(this.key, JSON.stringify(arr)); } catch {}
  }

  exists(cutName: string): boolean {
    const name = (cutName || '').trim().toLowerCase();
    return this.list().some(e => (e.cutName || '').trim().toLowerCase() === name);
  }

  private uuid(): string {
    const c: any = (window as any).crypto;
    return c && c.randomUUID ? c.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}