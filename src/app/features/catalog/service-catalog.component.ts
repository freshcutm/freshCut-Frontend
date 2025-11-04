import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService, ServiceItem } from '../../core/catalog.service';
import { CurrencyService } from '../../core/currency.service';
import { serviceIconPath, serviceIconColor, serviceIconStrokeWidth } from '../../core/service-icons';
import { realDurationMinutes } from '../../core/duration-realism';

@Component({
  selector: 'app-service-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-white"></div>
      <div class="relative max-w-6xl mx-auto py-12 px-4">
        <h1 class="barber-title text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Servicios de barbería</h1>
        <p class="text-gray-600 mb-8">Explora nuestros servicios y reserva en segundos.</p>

        <div *ngIf="services.length; else empty" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <a class="group bg-white border rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition"
             routerLink="/reservas/nueva" *ngFor="let s of services">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 border" [ngClass]="iconColorFor(s.name)">
              <svg class="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <!-- Marco/emblema del color del servicio -->
                <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-opacity="0.25" stroke-width="1" fill="none"></circle>
                <!-- Icono del servicio, limpio y centrado -->
                <path [attr.d]="iconFor(s.name)" stroke="currentColor" [attr.stroke-width]="strokeFor(s.name)" fill="none"></path>
              </svg>
            </div>
            <div class="font-semibold text-gray-900">{{ s.name }}</div>
            <div class="text-sm text-gray-500 mt-1">Duración estimada {{ realDuration(s) }} min · {{ formatPrice(s.priceCents) }}</div>
          </a>
        </div>

        <ng-template #empty>
          <div class="bg-white border rounded p-6 text-center text-gray-600">Aún no hay servicios disponibles.</div>
        </ng-template>

        <div class="text-center text-xs text-gray-500 mt-8">FreshCut</div>
      </div>
    </section>
  `
})
export class ServiceCatalogComponent implements OnInit {
  services: ServiceItem[] = [];
  constructor(private catalog: CatalogService, private currency: CurrencyService) {}

  ngOnInit(): void {
    this.currency.warmup();
    this.catalog.listServices().subscribe({
      next: (data) => this.services = data.filter(s => s.active),
      error: () => {}
    });
  }

  formatPrice(cents: number): string {
    return this.currency.formatEurosCentsToCOP(cents);
  }

  realDuration(s: ServiceItem): number {
    return realDurationMinutes(s.name, s.durationMinutes);
  }

  iconFor(name: string): string { return serviceIconPath(name); }
  iconColorFor(name: string): string { return serviceIconColor(name); }
  strokeFor(name: string): number { return serviceIconStrokeWidth(name); }
}