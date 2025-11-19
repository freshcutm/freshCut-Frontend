import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationHistoryService, RecommendationEntry } from '../../core/recommendation-history.service';

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
    </div>
  `
})
export class RecommendationHistoryComponent implements OnInit {
  entries: RecommendationEntry[] = [];
  constructor(private history: RecommendationHistoryService) {}
  ngOnInit(): void {
    this.entries = this.history.list();
  }
  formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch { return iso; }
  }
}