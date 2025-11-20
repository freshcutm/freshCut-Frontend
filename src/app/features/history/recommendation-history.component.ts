import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationHistoryService, RecommendationEntry } from '../../core/recommendation-history.service';
import { AiService, ChatLog } from '../../core/ai.service';

@Component({
  selector: 'app-recommendation-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto p-6 bg-white shadow-sm border rounded">
      <h2 class="text-2xl font-semibold mb-4">Historial de cortes recomendados</h2>
      <div *ngIf="entries.length === 0" class="text-gray-600">Aún no hay recomendaciones registradas.</div>
      <ul class="space-y-3" *ngIf="entries.length > 0">
        <li *ngFor="let e of entries" class="border rounded p-3">
          <div class="text-sm text-gray-500">{{ formatDate(e.timestamp) }}</div>
          <div class="font-medium">{{ e.cutName }}</div>
          <div class="text-sm text-gray-700">Características: {{ e.features }}</div>
          <div class="text-sm text-gray-700">Razón: {{ e.reason }}</div>
        </li>
      </ul>

      <h2 class="text-2xl font-semibold mt-8 mb-4">Historial de chats guardados</h2>
      <div *ngIf="savedChats.length === 0" class="text-gray-600">Aún no hay chats guardados.</div>
      <ul class="space-y-3" *ngIf="savedChats.length > 0">
        <li *ngFor="let c of savedChats" class="border rounded p-3">
          <div class="text-sm text-gray-500">{{ formatDate(c.createdAt) }}</div>
          <div class="text-sm text-gray-700" *ngIf="c.faceDescription">Rostro: {{ c.faceDescription }}</div>
          <div class="text-sm text-gray-700">Resumen: {{ summarizeMessages(c) }}</div>
          <div class="text-sm text-gray-900 font-medium mt-1">Respuesta: {{ c.reply }}</div>
        </li>
      </ul>
    </div>
  `
})
export class RecommendationHistoryComponent implements OnInit {
  entries: RecommendationEntry[] = [];
  savedChats: ChatLog[] = [];
  constructor(private history: RecommendationHistoryService, private ai: AiService) {}
  ngOnInit(): void {
    this.entries = this.history.list();
    this.ai.getSavedHistory().subscribe({
      next: (list) => { this.savedChats = list || []; },
      error: () => { this.savedChats = []; }
    });
  }
  formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch { return iso; }
  }
  summarizeMessages(c: ChatLog): string {
    try {
      const msgs = (c.messages || []).map(m => (m?.content || '').trim()).filter(Boolean);
      const joined = msgs.join(' | ');
      return joined.length > 120 ? (joined.slice(0, 117) + '...') : joined;
    } catch { return ''; }
  }
}