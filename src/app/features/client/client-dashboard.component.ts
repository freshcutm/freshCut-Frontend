import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-0">
      <h2 class="barber-title text-3xl font-bold mb-6">Mi panel</h2>
      <p class="text-sm text-gray-600 mb-4">Bienvenido, <span class="font-medium">{{ auth.email() }}</span></p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="border rounded p-4 bg-white">
          <h3 class="barber-subtitle font-semibold mb-2">Reservas</h3>
          <p class="text-sm text-gray-600 mb-4">Consulta y gestiona tus reservas.</p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/reservas" class="text-blue-600 hover:underline">Mis reservas</a>
            <a routerLink="/reservas/nueva" class="text-blue-600 hover:underline">Nueva reserva</a>
          </div>
        </div>
        <div class="border rounded p-4 bg-white">
          <h3 class="barber-subtitle font-semibold mb-2">Servicios</h3>
          <p class="text-sm text-gray-600 mb-4">Explora el catálogo y elige tu estilo.</p>
          <a routerLink="/servicios" class="text-blue-600 hover:underline">Abrir catálogo</a>
        </div>
        <div class="border rounded p-4 bg-white">
          <h3 class="barber-subtitle font-semibold mb-2">Asistente IA</h3>
          <p class="text-sm text-gray-600 mb-4">Recibe recomendaciones rápidas.</p>
          <a routerLink="/ia" class="text-blue-600 hover:underline">Abrir</a>
        </div>
      </div>

      <div class="border rounded p-4 bg-white">
        <h3 class="font-medium mb-2">Consejo</h3>
        <p class="text-sm text-gray-600">Desde aquí tienes acceso directo a todo lo que puedes usar como cliente: reservas, catálogo y asistente.</p>
      </div>
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
  constructor(public auth: AuthService) {}
  ngOnInit(): void {}
}