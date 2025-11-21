import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService, ChatLog } from '../../core/ai.service';

@Component({
  selector: 'app-recommendation-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto p-6">
      <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2 bg-white shadow-sm border rounded p-5">
          <h2 class="text-2xl font-semibold mb-4">Historial de chats guardados</h2>
          <div *ngIf="savedChats.length === 0" class="text-gray-600">Aún no hay chats guardados.</div>
          <ul class="space-y-3" *ngIf="savedChats.length > 0">
            <li *ngFor="let c of savedChats" class="border rounded p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <div class="text-sm text-gray-500">{{ formatDate(c.createdAt) }}</div>
                <div class="text-sm text-gray-700" *ngIf="c.faceDescription">Rostro: {{ c.faceDescription }}</div>
                <div class="text-sm text-gray-700">Resumen: {{ summarizeMessages(c) }}</div>
                <div class="text-sm text-gray-900 font-medium mt-1">Respuesta: {{ c.reply }}</div>
              </div>
              <div class="flex items-center justify-center">
                <img *ngIf="imageMap[c.id]" [src]="imageMap[c.id]" class="w-28 h-28 object-cover rounded border" alt="Foto usada" />
                <div *ngIf="!imageMap[c.id]" class="text-xs text-gray-500">Sin foto</div>
              </div>
            </li>
          </ul>
        </div>
        <div class="bg-indigo-50 border border-indigo-100 rounded p-4">
          <h3 class="text-lg font-semibold mb-2">Consejos</h3>
          <ul class="text-sm list-disc pl-5 space-y-1 text-gray-700">
            <li>Guarda el chat después de generar las recomendaciones.</li>
            <li>Si tomaste foto, se mostrará aquí al lado del chat.</li>
            <li>Usa el asistente desde la página “Asistente IA”.</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class RecommendationHistoryComponent implements OnInit {
  savedChats: ChatLog[] = [];
  imageMap: Record<string, string> = {};
  constructor(private ai: AiService) {}
  ngOnInit(): void {
    this.ai.getSavedHistory().subscribe({
      next: (list) => { this.savedChats = list || []; this.hydrateImages(); },
      error: () => { this.savedChats = []; }
    });
  }
  private hydrateImages() {
    try {
      for (const c of this.savedChats) {
        const url = localStorage.getItem('chat_img_' + c.id) || '';
        if (url) this.imageMap[c.id] = url;
      }
    } catch {}
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