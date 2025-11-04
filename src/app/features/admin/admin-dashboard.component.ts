import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-0">
      <h2 class="barber-title text-3xl font-bold mb-6">Panel administrativo</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Bloque de usuarios eliminado según solicitud -->
        <div class="border rounded p-4 bg-white">
          <h3 class="barber-subtitle font-semibold mb-2">Barberos</h3>
          <p class="text-sm text-gray-600 mb-4">Gestiona personal de la barbería.</p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/admin/barberos" class="inline-block w-full sm:w-auto text-blue-600 hover:underline text-center">Gestionar barberos</a>
            <a routerLink="/admin/barberos/nuevo" class="inline-block w-full sm:w-auto text-blue-600 hover:underline text-center">Crear barbero</a>
          </div>
        </div>
        <div class="border rounded p-4 bg-white">
          <h3 class="barber-subtitle font-semibold mb-2">Servicios</h3>
          <p class="text-sm text-gray-600 mb-4">Gestiona los tipos de corte.</p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/admin/servicios" class="inline-block w-full sm:w-auto text-blue-600 hover:underline text-center">Gestionar servicios</a>
          </div>
        </div>
        <div class="border rounded p-4 bg-white">
          <h3 class="barber-subtitle font-semibold mb-2">Horarios</h3>
          <p class="text-sm text-gray-600 mb-4">Configura disponibilidad.</p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/admin" class="inline-block w-full sm:w-auto text-blue-600 hover:underline text-center">Abrir</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {}