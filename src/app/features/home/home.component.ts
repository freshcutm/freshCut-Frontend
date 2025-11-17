import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService, Barber, ServiceItem } from '../../core/catalog.service';
import { CurrencyService } from '../../core/currency.service';
import { realDurationMinutes } from '../../core/duration-realism';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-white"></div>
      <div class="relative max-w-6xl mx-auto py-12 px-4 grid gap-10">
        <ng-container *ngIf="auth.role() !== 'BARBER'; else barberHome">
          <div class="text-center">
            <h1 class="barber-title text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">Barbería de nueva generación</h1>
            <p class="text-gray-600 mb-8">Reserva en segundos, descubre servicios de calidad y recibe recomendaciones personalizadas.</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a routerLink="/reservas" class="btn btn-primary w-full sm:w-auto">Reservar ahora</a>
              <a routerLink="/ia" class="btn btn-outline w-full sm:w-auto">Probar asistente IA</a>
              <a routerLink="/auth/register" class="btn btn-outline w-full sm:w-auto">Crear cuenta</a>
              <a routerLink="/auth/register/barbero" class="btn btn-outline w-full sm:w-auto">Soy barbero</a>
            </div>
          </div>
        </ng-container>

        <ng-template #barberHome>
          <div class="text-center">
            <h1 class="barber-title text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">Panel de barbero</h1>
            <p class="text-gray-600 mb-8">Gestiona tu perfil, horario y reservas. Este inicio está adaptado a tu rol.</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a routerLink="/barbero" class="btn btn-primary w-full sm:w-auto">Ir a mi panel</a>
              <a routerLink="/reservas" class="btn btn-outline w-full sm:w-auto">Ver mis reservas</a>
              <a routerLink="/perfil" class="btn btn-outline w-full sm:w-auto">Editar perfil</a>
            </div>
          </div>
        </ng-template>

        <div class="grid md:grid-cols-2 gap-8">
          <div class="md:col-span-2">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-semibold">Servicios populares</h2>
              <a routerLink="/servicios" class="text-indigo-600 hover:underline">Ver todos los servicios</a>
            </div>
            <div class="mt-3 bg-white shadow-sm border rounded divide-y" *ngIf="services.length; else noServices">
              <div class="p-4 flex items-center justify-between" *ngFor="let s of services | slice:0:3">
                <div>
                  <div class="font-medium">{{ s.name }}</div>
                  <div class="text-sm text-gray-500">Duración estimada: {{ realDuration(s) }} min • Precio: {{ formatPrice(s.priceCents) }}</div>
                </div>
                <a *ngIf="auth.role() !== 'BARBER'" routerLink="/reservas/nueva" class="text-indigo-600 hover:underline">Reservar</a>
              </div>
            </div>
            <ng-template #noServices>
              <div class="mt-3 p-4 border rounded text-sm text-gray-500">Aún no hay servicios disponibles.</div>
            </ng-template>
          </div>
        </div>
        <div *ngIf="auth.role() !== 'BARBER'" class="mt-2 bg-indigo-50 border border-indigo-100 rounded p-6 text-center">
          <h3 class="text-xl font-semibold mb-2">¿Eres barbero?</h3>
          <p class="text-gray-700 mb-4">Únete a FreshCut para gestionar tus reservas, crear tu perfil y atraer más clientes.</p>
          <a routerLink="/auth/register/barbero" class="inline-block bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700">Crear perfil de barbero</a>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  barbers: Barber[] = [];
  services: ServiceItem[] = [];

  constructor(private catalog: CatalogService, private currency: CurrencyService, public auth: AuthService) {}

  ngOnInit(): void {
    this.currency.warmup();
    this.catalog.listBarbers().subscribe({ next: bs => this.barbers = bs });
    this.catalog.listServices().subscribe({ next: ss => this.services = ss });
  }

  formatPrice(cents: number) {
    return this.currency.formatEurosCentsToCOP(cents);
  }

  realDuration(s: ServiceItem): number {
    return realDurationMinutes(s.name, s.durationMinutes);
  }
}