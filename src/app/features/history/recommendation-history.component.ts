import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService, ChatLog } from '../../core/ai.service';

@Component({
  selector: 'app-recommendation-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto p-6 bg-white shadow-sm border rounded">
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
  savedChats: ChatLog[] = [];
  constructor(private ai: AiService) {}
  ngOnInit(): void {
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