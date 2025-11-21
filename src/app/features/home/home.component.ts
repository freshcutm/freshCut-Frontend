import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService, Barber, ServiceItem } from '../../core/catalog.service';
import { BookingService } from '../../core/booking.service';
import { CurrencyService } from '../../core/currency.service';
import { realDurationMinutes } from '../../core/duration-realism';
import { AuthService } from '../../core/auth.service';
import { BarberService, Schedule } from '../../core/barber.service';
import { NotificationsService } from '../../ui/notifications.service';
import { ConfirmService } from '../../ui/confirm.service';
import { ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-white"></div>
      <div class="relative max-w-6xl mx-auto py-12 px-4 grid gap-10">
        <ng-container *ngIf="auth.role() === 'BARBER'; else nonBarber">
          <ng-container *ngTemplateOutlet="barberHome"></ng-container>
        </ng-container>

        <ng-template #nonBarber>
          <ng-container *ngIf="auth.role() === 'USER'; else publicHome">
            <ng-container *ngTemplateOutlet="clientHome"></ng-container>
          </ng-container>
        </ng-template>

        <ng-template #publicHome>
          <div class="text-center">
            <h1 class="barber-title text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">Barbería de nueva generación</h1>
            <p class="text-gray-600 mb-8">Reserva en segundos, descubre servicios de calidad y recibe recomendaciones personalizadas.</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a routerLink="/reservas" class="btn btn-primary w-full sm:w-auto">Reservar ahora</a>
              <a routerLink="/ia" class="btn btn-outline w-full sm:w-auto">Probar asistente IA</a>
              <a routerLink="/auth/register" class="btn btn-outline w-full sm:w-auto">Crear cuenta</a>
            </div>
          </div>
        </ng-template>

        <ng-template #barberHome>
          <div class="text-center">
            <h1 class="barber-title text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">Panel de barbero</h1>
            <p class="text-gray-600 mb-2">Bienvenido, <span class="font-medium">{{ barberName || 'barbero' }}</span></p>
            <p class="text-gray-600 mb-8">Gestiona tu perfil, horario y reservas. Este inicio está adaptado a tu rol.</p>
            <div class="flex flex-wrap justify-center gap-3 mb-8">
              <a routerLink="/barbero" class="btn btn-primary w-full sm:w-auto">Ir a editar perfil</a>
              <a routerLink="/reservas" class="btn btn-outline w-full sm:w-auto">Ver mis reservas</a>
            </div>

            <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 text-white p-4 mb-6 shadow">
              <div class="flex items-center gap-3">
                <div class="text-2xl">💼</div>
                <div class="font-semibold">Resumen de negocio</div>
                <span class="ml-auto text-sm">Semana actual</span>
              </div>
              <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div class="bg-white/10 rounded px-3 py-2">
                  <div class="text-white">Ocupación</div>
                  <div class="text-lg font-bold">{{ weeklyOccupancyPct }}%</div>
                </div>
                <div class="bg-white/10 rounded px-3 py-2">
                  <div class="text-white">Proyección</div>
                  <div class="text-lg font-bold">{{ formatCOPCents(projectedIncome) }}</div>
                </div>
                <div class="bg-white/10 rounded px-3 py-2">
                  <div class="text-white">Delta mensual</div>
                  <div class="text-lg font-bold">{{ currentVsPrevDelta }}%</div>
                </div>
                <div class="bg-white/10 rounded px-3 py-2">
                  <div class="text-white">Cancelaciones</div>
                  <div class="text-lg font-bold">{{ cancelRate }}%</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2 border rounded-xl p-4 bg-white">
                <h3 class="font-medium mb-2">Mis reservas</h3>
                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <span class="text-xs text-gray-600">Filtro:</span>
                  <select class="border rounded px-2 py-1 text-sm" [(ngModel)]="viewFilter">
                    <option [ngValue]="'UPCOMING'">Próximas</option>
                    <option [ngValue]="'HISTORY'">Historial</option>
                    <option [ngValue]="'ALL'">Todas</option>
                  </select>
                  <button class="text-xs underline" (click)="refreshBookings()">Actualizar</button>
                </div>
                <div *ngIf="bookings; else loadingBk" class="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border shadow-sm">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="text-left">
                        <th class="py-2 pr-4">Cliente</th>
                        <th class="py-2 pr-4">Servicio</th>
                        <th class="py-2 pr-4">Inicio</th>
                        <th class="py-2 pr-4">Fin</th>
                        <th class="py-2 pr-4">Estado</th>
                        <th class="py-2 pr-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y">
                      <tr *ngFor="let b of filteredBookings" class="odd:bg-white even:bg-gray-50">
                        <td class="py-2 pr-4">{{ b.clientName }}</td>
                        <td class="py-2 pr-4">{{ b.service }}</td>
                        <td class="py-2 pr-4">{{ formatDate(b.startTime) }}</td>
                        <td class="py-2 pr-4">{{ formatDate(b.endTime) }}</td>
                        <td class="py-2 pr-4">{{ b.status || 'CONFIRMED' }}</td>
                        <td class="py-2 pr-4">
                          <button *ngIf="canCancel(b)" (click)="cancelBooking(b)" class="text-red-600 underline" [disabled]="actionBookingId === b.id">
                            <span *ngIf="actionBookingId !== b.id">Cancelar</span>
                            <span *ngIf="actionBookingId === b.id">Cancelando…</span>
                          </button>
                          <button *ngIf="canComplete(b)" (click)="completeBooking(b)" class="ml-3 text-green-700 underline" [disabled]="actionBookingId === b.id">
                            <span *ngIf="actionBookingId !== b.id">Completar</span>
                            <span *ngIf="actionBookingId === b.id">Completando…</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ng-template #loadingBk>
                  <div class="text-sm text-gray-500">Cargando reservas…</div>
                </ng-template>
              </div>
              <div class="border rounded-xl p-4 bg-white">
                <h3 class="font-medium mb-2">Ocupación diaria</h3>
                <div class="space-y-2">
                  <div class="grid grid-cols-7 gap-2 mb-3">
                    <div *ngFor="let m of occupancyMetrics" class="flex flex-col items-center gap-1">
                      <div class="text-[11px] text-gray-600">{{ m.day }}</div>
                      <div class="relative w-16 h-16 rounded-full" [ngStyle]="ringStyle(m.pct, '#10b981')">
                        <div class="absolute inset-2 rounded-full bg-white"></div>
                        <div class="absolute inset-0 flex items-center justify-center text-xs font-semibold">{{ m.pct }}%</div>
                      </div>
                    </div>
                  </div>
                  <div *ngFor="let m of occupancyMetrics" class="flex items-center justify-between text-sm">
                    <div>{{ m.day }}</div>
                    <div class="font-medium">{{ m.pct }}%</div>
                  </div>
                  <div class="mt-2 text-xs text-gray-500">Picos: {{ peakHoursText }}</div>
                </div>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="border rounded p-4 bg-white">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="barber-subtitle font-semibold flex items-center gap-2"><span class="text-xl">🗓️</span> Calendario inteligente (semana)</h3>
                  <div class="text-xs text-gray-600">Ocupación semanal: {{ weeklyOccupancyPct }}%</div>
                </div>
                <div class="grid grid-cols-7 gap-2 mb-2">
                  <div *ngFor="let d of weekDays" class="text-xs text-gray-700 text-center font-medium bg-gray-50 rounded py-1">{{ d.label }}</div>
                </div>
                <div class="grid grid-cols-7 gap-2">
                  <div *ngFor="let d of weekDays" class="border rounded-lg p-2 h-40 overflow-hidden relative bg-white">
                    <div class="absolute inset-0" [ngStyle]="{ background: d.available > 0 ? 'linear-gradient(to top, rgba(16,185,129,0.15) ' + d.occupancyPct + '%, transparent ' + d.occupancyPct + '%)' : 'transparent' }"></div>
                    <div class="absolute inset-x-0 bottom-0 bg-emerald-300/30" [style.height]="d.occupancyPct + '%'" [style.transition]="'height 500ms ease'"></div>
                    <div class="relative z-10">
                      <div class="text-[10px] text-gray-500 mb-1">Ocupación: {{ d.occupancyPct }}%</div>
                      <div class="space-y-1">
                        <div *ngFor="let b of d.items" class="text-[11px] px-2 py-1 rounded bg-indigo-50 text-indigo-700 truncate">{{ timeShort(b.startTime) }} • {{ b.clientName }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-2 text-xs text-gray-600">Huecos disponibles marcados en verde suave.</div>
              </div>
              <div class="border rounded p-4 bg-white">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="barber-subtitle font-semibold flex items-center gap-2"><span class="text-xl">📆</span> Calendario mensual</h3>
                  <div class="flex items-center gap-2 text-xs text-gray-600">
                    <button class="underline" (click)="prevMonth()">Anterior</button>
                    <div>{{ monthName(monthCursor) }}</div>
                    <button class="underline" (click)="nextMonth()">Siguiente</button>
                  </div>
                </div>
                <div class="grid grid-cols-7 gap-2 text-xs text-gray-700 font-medium mb-2">
                  <div *ngFor="let w of ['L','M','X','J','V','S','D']" class="text-center">{{ w }}</div>
                </div>
                <div class="grid grid-cols-7 gap-2">
                  <div *ngFor="let d of monthDays" class="border rounded-lg p-2 h-24 relative cursor-pointer bg-white hover:bg-indigo-50/40 transition" (click)="openDay(d.date)">
                    <div class="flex items-center justify-between text-[11px] text-gray-600">
                      <span>{{ d.date.getDate() }}</span>
                      <span>{{ d.occupancyPct }}%</span>
                    </div>
                    <div class="mt-1 text-[11px]" [ngClass]="d.occupancyPct < 40 ? 'text-amber-700' : 'text-green-700'">{{ d.items.length }} cita(s)</div>
                    <div class="absolute inset-x-0 bottom-1 h-1 rounded" [ngClass]="d.occupancyPct < 40 ? 'bg-amber-300' : 'bg-emerald-300'" [style.width]="d.occupancyPct + '%'" [style.transition]="'width 400ms ease'"></div>
                  </div>
                </div>
                <div class="mt-2 text-xs text-gray-600">Pulsa un día para ver detalles en la tabla de reservas.
                  <button *ngIf="focusDate" class="ml-2 underline" (click)="clearFocus()">Quitar filtro</button>
                </div>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="border rounded-xl p-4 bg-white lg:col-span-2">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="barber-subtitle font-semibold flex items-center gap-2"><span class="text-xl">💰</span> Ingresos mensuales</h3>
                  <div class="text-xs text-gray-600">Actual vs anterior: {{ currentVsPrevDelta }}%</div>
                </div>
                <div class="h-36 flex items-end gap-1">
                  <div *ngFor="let m of earningsMonths; let i = index" class="flex-1 relative" [style.height]="earnBarHeight(earningsValues[i])" [style.transition]="'height 500ms ease'" [ngClass]="earnBarColor(earningsValues[i])">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-700">{{ formatCOPCents(earningsValues[i]) }}</div>
                    <div class="text-[10px] text-gray-600 text-center mt-1">{{ m }}</div>
                  </div>
                </div>
                <div class="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div class="border rounded p-2">
                    <div class="text-gray-600">Proyección</div>
                    <div class="font-bold">{{ formatCOPCents(projectedIncome) }}</div>
                  </div>
                  <div class="border rounded p-2">
                    <div class="text-gray-600">Servicio destacado</div>
                    <div class="font-bold">{{ topService?.name || '—' }}</div>
                  </div>
                  <div class="border rounded p-2">
                    <div class="text-gray-600">Cancelaciones</div>
                    <div class="font-bold">{{ cancelRate }}%</div>
                  </div>
                </div>
              </div>
              <div class="border rounded-xl p-4 bg-white">
                <div class="flex items-center gap-2 mb-2">
                  <div class="text-xl">🧠</div>
                  <h3 class="barber-subtitle font-semibold">Asistente</h3>
                </div>
                <ul class="text-sm list-disc pl-5 space-y-1">
                  <li *ngFor="let s of assistantTips">{{ s }}</li>
                </ul>
              </div>
            </div>

            <div class="border rounded-xl p-4 bg-white shadow mt-6">
              <h3 class="font-medium mb-2">Mi disponibilidad</h3>
              <div *ngIf="schedules as sc; else loadingSc" class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead>
                    <tr class="text-left text-gray-600">
                      <th class="px-2 py-2 w-48">Día</th>
                      <th class="px-2 py-2 w-32">Inicio</th>
                      <th class="px-2 py-2 w-32">Fin</th>
                      <th class="px-2 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr *ngFor="let s of sc">
                      <td class="px-2 py-2">
                        <select class="border rounded px-2 py-1 w-full" [(ngModel)]="s.dayOfWeek">
                          <option *ngFor="let d of days" [ngValue]="d">{{ d }}</option>
                        </select>
                      </td>
                      <td class="px-2 py-2">
                        <input type="time" class="border rounded px-2 py-1 w-full" [(ngModel)]="s.startTime" />
                      </td>
                      <td class="px-2 py-2">
                        <input type="time" class="border rounded px-2 py-1 w-full" [(ngModel)]="s.endTime" />
                      </td>
                      <td class="px-2 py-2">
                        <div class="flex items-center gap-2">
                          <button class="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 shadow-sm" (click)="updateSchedule(s)" [disabled]="updatingScheduleId === s.id">
                            <span *ngIf="updatingScheduleId !== s.id">Guardar</span>
                            <span *ngIf="updatingScheduleId === s.id">Guardando…</span>
                          </button>
                          <button class="inline-flex items-center gap-2 bg-rose-600 text-white px-3 py-1.5 rounded-md hover:bg-rose-700 shadow-sm" (click)="deleteSchedule(s)" [disabled]="deletingScheduleId === s.id">
                            <span *ngIf="deletingScheduleId !== s.id">Eliminar</span>
                            <span *ngIf="deletingScheduleId === s.id">Eliminando…</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="border-t mt-4 pt-4">
                  <h4 class="font-medium mb-2">Crear nuevo horario</h4>
                  <div class="grid grid-cols-4 gap-2">
                    <select class="border rounded px-2 py-1 w-full" [(ngModel)]="newDay">
                      <option *ngFor="let d of days" [ngValue]="d">{{ d }}</option>
                    </select>
                    <input type="time" class="border rounded px-2 py-1 w-full" [(ngModel)]="newStart" />
                    <input type="time" class="border rounded px-2 py-1 w-full" [(ngModel)]="newEnd" />
                    <button class="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 shadow-sm" (click)="createSchedule()" [disabled]="isCreatingSchedule">
                      <span *ngIf="!isCreatingSchedule">Añadir</span>
                      <span *ngIf="isCreatingSchedule">Creando…</span>
                    </button>
                  </div>
                </div>
              </div>
              <ng-template #loadingSc>
                <div class="text-sm text-gray-500">Cargando disponibilidad…</div>
              </ng-template>
            </div>
          </div>
        </ng-template>

        <ng-template #clientHome>
          <div class="max-w-6xl mx-auto px-4 sm:px-0">
            <div class="flex items-center mb-2">
              <h2 class="barber-title text-3xl font-bold">Mi panel</h2>
            </div>
            <p class="text-sm text-gray-600 mb-6">Bienvenido, <span class="font-medium">{{ userName || auth.email() }}</span></p>

            <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 text-white p-4 mb-6 shadow">
              <div class="flex items-center gap-3">
                <div class="text-2xl">✂️</div>
                <div class="font-semibold">Resumen rápido</div>
                <span class="ml-auto text-sm">Últimos {{ months.length }} meses</span>
              </div>
              <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div class="bg-white/10 rounded px-3 py-2">
                  <div class="text-indigo-200">Cortes</div>
                  <div class="text-lg font-bold">{{ totalCuts12m }}</div>
                </div>
                <div class="bg-white/10 rounded px-3 py-2">
                  <div class="text-indigo-200">Gasto total</div>
                  <div class="text-lg font-bold">{{ formatCOPCents(totalSpend12m) }}</div>
                </div>
                <div class="bg-white/10 rounded px-3 py-2">
                  <div class="text-indigo-200">Promedio mensual</div>
                  <div class="text-lg font-bold">{{ formatCOPCents(avgMonthlySpend) }}</div>
                </div>
                <div class="bg-white/10 rounded px-3 py-2">
                  <div class="text-indigo-200">Costo promedio</div>
                  <div class="text-lg font-bold">{{ formatCOPCents(avgCostPerCut) }}</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div class="border rounded-xl p-4 backdrop-blur shadow bg-white/90">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="barber-subtitle font-semibold flex items-center gap-2"><span class="text-xl">🟢</span> Cortes vs promedio</h3>
                  <div class="text-xs text-gray-600">{{ months[months.length-1] }}</div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="relative w-28 h-28 rounded-full" [ngStyle]="ringStyle(cutsPct(), '#22c55e')">
                    <div class="absolute inset-2 rounded-full bg-white"></div>
                    <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold">{{ cutsPct() }}%</div>
                  </div>
                  <div class="text-sm">
                    <div>Este mes: <span class="font-semibold">{{ monthlyCuts[months.length-1] || 0 }}</span></div>
                    <div>Promedio: <span class="font-semibold">{{ avgCuts() }}</span></div>
                  </div>
                </div>
              </div>
              <div class="border rounded-xl p-4 backdrop-blur shadow bg-white/90">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="barber-subtitle font-semibold flex items-center gap-2"><span class="text-xl">🟣</span> Gasto vs promedio</h3>
                  <div class="text-xs text-gray-600">{{ months[months.length-1] }}</div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="relative w-28 h-28 rounded-full" [ngStyle]="ringStyle(spendPct(), '#8b5cf6')">
                    <div class="absolute inset-2 rounded-full bg-white"></div>
                    <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold">{{ spendPct() }}%</div>
                  </div>
                  <div class="text-sm">
                    <div>Este mes: <span class="font-semibold">{{ formatCOPCents(monthlySpend[months.length-1] || 0) }}</span></div>
                    <div>Promedio: <span class="font-semibold">{{ formatCOPCents(avgMonthlySpend) }}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 mb-8">
              <div class="border rounded-xl p-4 backdrop-blur shadow bg-white/90">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="barber-subtitle font-semibold flex items-center gap-2"><span class="text-xl">📈</span> Frecuencia de cortes</h3>
                  <div class="flex items-center gap-3">
                    <label class="text-xs text-gray-600">Rango</label>
                    <select class="border rounded px-2 py-1 text-xs" [(ngModel)]="rangeMonths" (ngModelChange)="rebuild()">
                      <option [ngValue]="6">6</option>
                      <option [ngValue]="12">12</option>
                      <option [ngValue]="24">24</option>
                    </select>
                    <span class="text-xs text-gray-500">Total: {{ totalCuts12m }}</span>
                  </div>
                </div>
                <div class="h-40 flex items-end gap-1 rounded-lg p-2 bg-[length:100%_16px]" [ngStyle]="{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.06) 1px, transparent 1px)' }">
                  <div *ngFor="let m of months; let i = index"
                       class="flex-1 relative group"
                       [style.height]="barHeight(monthlyCuts[i])"
                       [style.transition]="'height 300ms ease'"
                       [ngClass]="barColor(monthlyCuts[i])">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-700">{{ monthlyCuts[i] }}</div>
                    <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/5"></div>
                    <div class="text-[10px] text-gray-600 text-center mt-1">{{ m }}</div>
                  </div>
                </div>
              </div>
              <div class="border rounded-xl p-4 backdrop-blur shadow bg-white/90" *ngIf="myBookings.length >= 5">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="barber-subtitle font-semibold flex items-center gap-2"><span class="text-xl">🎯</span> Ruleta de descuentos</h3>
                  <div class="text-xs text-gray-600">Gira para obtener 20%–50%</div>
                </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div class="flex items-center justify-center">
                    <div class="relative inline-block">
                      <div class="w-40 h-40 rounded-full" [style.transform]="'rotate(' + wheelAngle + 'deg)'" [style.transition]="spinning ? 'transform 4.8s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none'" [ngStyle]="{ background: 'conic-gradient(#16a34a 0 90deg, #22c55e 90deg 180deg, #84cc16 180deg 270deg, #f59e0b 270deg 360deg)' }">
                        <div class="absolute inset-0">
                          <div class="absolute left-1/2 top-1/2 text-[11px] font-semibold text-white drop-shadow" [style.transform]="'translate(-50%, -50%) rotate(45deg) translateY(-60px) rotate(-45deg)'">20%</div>
                          <div class="absolute left-1/2 top-1/2 text-[11px] font-semibold text-white drop-shadow" [style.transform]="'translate(-50%, -50%) rotate(135deg) translateY(-60px) rotate(-135deg)'">30%</div>
                          <div class="absolute left-1/2 top-1/2 text-[11px] font-semibold text-white drop-shadow" [style.transform]="'translate(-50%, -50%) rotate(225deg) translateY(-60px) rotate(-225deg)'">40%</div>
                          <div class="absolute left-1/2 top-1/2 text-[11px] font-semibold text-white drop-shadow" [style.transform]="'translate(-50%, -50%) rotate(315deg) translateY(-60px) rotate(-315deg)'">50%</div>
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-xs text-gray-800 bg-white/70 px-2 py-1 rounded">{{ wheelLabel }}</div>
                        </div>
                      </div>
                      <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-[14px] border-l-transparent border-r-transparent border-b-red-500"></div>
                    </div>
                  </div>
                  <div class="space-y-2 text-sm">
                    <div class="text-xs text-gray-600">¡Cada 5 reservas, tienes un descuento! Prueba tu suerte.</div>
                    <div *ngIf="availableCouponPct; else noCoupon">Cupón disponible: <span class="font-semibold">{{ availableCouponPct }}%</span> se aplicará en tu próxima reserva</div>
                    <ng-template #noCoupon>
                      <div>No tienes cupón activo. Gira la ruleta para intentar conseguir uno.</div>
                    </ng-template>
                    <button class="bg-indigo-600 text-white px-3 py-1 rounded" (click)="spinWheel()" [disabled]="!canSpin()">{{ spinning ? 'Girando...' : 'Girar ruleta' }}</button>
                    <div class="text-xs text-gray-500">Probabilidades: 20% (~50%), 30% (~30%), 40% (~15%), 50% (~5%)</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div class="border rounded-xl p-4 backdrop-blur shadow bg-white/90">
                <h3 class="barber-subtitle font-semibold mb-2">Gasto acumulado</h3>
                <div class="flex items-baseline gap-3">
                  <div class="text-2xl font-bold" [ngClass]="expenseStatusClass">{{ formatCOPCents(totalSpend12m) }}</div>
                  <div class="text-xs text-gray-500">Promedio por corte: {{ formatCOPCents(avgCostPerCut) }}</div>
                </div>
                <div class="mt-2 text-xs text-gray-600">Promedio mensual: {{ formatCOPCents(avgMonthlySpend) }}</div>
              </div>
              <div class="border rounded-xl p-4 backdrop-blur lg:col-span-2 shadow bg-white/90">
                <h3 class="barber-subtitle font-semibold mb-2">Gasto mensual (12 meses)</h3>
                <div class="h-40 flex items-end gap-1 rounded-lg p-2 bg-[length:100%_16px]" [ngStyle]="{ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.06) 1px, transparent 1px)' }">
                  <div *ngFor="let m of months; let i = index"
                       class="flex-1 relative group"
                       [style.height]="barHeightSpend(monthlySpend[i])"
                       [style.transition]="'height 300ms ease'"
                       [ngClass]="spendBarColor(monthlySpend[i])">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-700">{{ formatCOPCents(monthlySpend[i]) }}</div>
                    <div class="text-[10px] text-gray-600 text-center mt-1">{{ m }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div class="border rounded-xl p-4 backdrop-blur shadow lg:col-span-2 bg-white/90">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="barber-subtitle font-semibold">Historial de servicios</h3>
                  <a routerLink="/reservas" class="text-xs text-indigo-600 hover:underline">Ver todas</a>
                </div>
                <div class="divide-y">
                  <div *ngFor="let b of recentBookings" class="py-3 flex items-center justify-between">
                    <div>
                      <div class="font-medium">{{ b.service }}</div>
                      <div class="text-xs text-gray-500">{{ b.startTime | date:'mediumDate' }} • {{ b.barber }}</div>
                    </div>
                    <div class="text-sm font-semibold">{{ formatCOPCents(b.priceCents || 0) }}</div>
                  </div>
                  <div *ngIf="!recentBookings.length" class="py-3 text-sm text-gray-500">Aún no tienes servicios registrados.</div>
                </div>
              </div>
              <div class="border rounded-xl p-0 backdrop-blur shadow overflow-hidden bg-white/90">
                <div class="bg-gradient-to-r from-indigo-600 to-purple-500 text-white px-4 py-3 flex items-center gap-2">
                  <div class="text-xl">💡</div>
                  <h3 class="barber-subtitle font-semibold">Análisis inteligente</h3>
                </div>
                <div class="p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-[10px] uppercase tracking-wide text-gray-500">Estado</span>
                  </div>
                  <div class="text-sm mb-2" [ngClass]="alertClass">{{ alertMessage }}</div>
                  <ul class="text-sm list-disc pl-5 space-y-1">
                    <li *ngFor="let r of recommendations">{{ r }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ng-template>

        <div class="mt-8">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-2xl font-semibold">Barberos destacados</h2>
            <div class="flex items-center gap-2">
              <button class="border rounded px-3 py-1" (click)="carouselPrev()">‹</button>
              <button class="border rounded px-3 py-1" (click)="carouselNext()">›</button>
            </div>
          </div>
          <div class="relative overflow-hidden border rounded-xl bg-white" (mouseenter)="carouselPause()" (mouseleave)="carouselResume()">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 items-stretch">
              <div class="border rounded-lg p-4 bg-gray-50">
                <div class="text-sm text-gray-500 mb-1">Anterior</div>
                <div class="font-medium">{{ carouselPrevNode?.barber?.name || '—' }}</div>
                <div class="text-xs text-gray-600">{{ (carouselPrevNode?.barber?.specialties || []).join(', ') }}</div>
              </div>
              <div class="border rounded-lg p-4 bg-indigo-50">
                <div class="text-sm text-indigo-700 mb-1">Actual</div>
                <div class="font-semibold">{{ carouselCurrentNode?.barber?.name || '—' }}</div>
                <div class="text-xs text-indigo-700">{{ (carouselCurrentNode?.barber?.specialties || []).join(', ') }}</div>
              </div>
              <div class="border rounded-lg p-4 bg-gray-50">
                <div class="text-sm text-gray-500 mb-1">Siguiente</div>
                <div class="font-medium">{{ carouselNextNode?.barber?.name || '—' }}</div>
                <div class="text-xs text-gray-600">{{ (carouselNextNode?.barber?.specialties || []).join(', ') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mt-8">
          <div class="md:col-span-2">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-semibold">Servicios populares</h2>
              <a routerLink="/servicios" class="text-indigo-600 hover:underline">Ver todos los servicios</a>
            </div>
            <div class="mt-3 bg-white shadow-sm border rounded divide-y" *ngIf="displayServices.length; else noServices">
              <div class="p-4 flex items-center justify-between" *ngFor="let s of displayServices | slice:0:3">
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
        
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  barbers: Barber[] = [];
  services: ServiceItem[] = [];
  displayServices: ServiceItem[] = [];

  bookings?: import('../../core/barber.service').Booking[];
  bookingsUpcoming?: import('../../core/barber.service').Booking[];
  bookingsHistory?: import('../../core/barber.service').Booking[];
  viewFilter: 'UPCOMING' | 'HISTORY' | 'ALL' = 'UPCOMING';
  actionBookingId?: string | number;

  schedules?: Schedule[];
  updatingScheduleId?: string | number;
  deletingScheduleId?: string | number;
  isCreatingSchedule = false;
  days: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  newDay: string = 'MONDAY';
  newStart: string = '09:00';
  newEnd: string = '17:00';
  monthCursor: Date = new Date();
  focusDate?: Date;
  weeklyOccupancyPct = 0;
  occupancyMetrics: { day: string; pct: number }[] = [];
  peakHoursText = '';
  earningsMonths: string[] = [];
  earningsValues: number[] = [];
  projectedIncome = 0;
  topService?: { name: string; revenue: number };
  cancelRate = 0;
  currentVsPrevDelta = 0;
  topClients: { name: string; revenue: number; count: number }[] = [];
  assistantTips: string[] = [];
  private assistantHeadlineLast?: string;
  userName: string = '';
  barberName: string = '';
  featuredBarbers: Barber[] = [];
  carouselTimer: any;
  carouselPrevNode?: { barber: Barber; prev: any; next: any } | null;
  carouselCurrentNode?: { barber: Barber; prev: any; next: any } | null;
  carouselNextNode?: { barber: Barber; prev: any; next: any } | null;

  constructor(private catalog: CatalogService, private currency: CurrencyService, public auth: AuthService, private barber: BarberService, private notifications: NotificationsService, private confirm: ConfirmService, private bookingSvc: BookingService, private profile: ProfileService) {}

  ngOnInit(): void {
    this.currency.warmup();
    this.catalog.listBarbers().subscribe({ next: bs => { this.barbers = bs; this.featuredBarbers = (bs || []).slice(0, 8); this.buildCarousel(); this.carouselResume(); } });
    this.catalog.listServices().subscribe({
      next: ss => {
        this.services = ss;
        this.currency.ensureRate().then(rate => {
          const toCop = (cents: number) => (cents || 0) / 100 * rate;
          const filtered = ss.filter(s => {
            const cop = toCop(s.priceCents);
            return cop >= 20000 && cop <= 40000;
          });
          this.displayServices = filtered.length ? filtered : ss;
        }).catch(() => {
          this.displayServices = ss;
        });
      }
    });
    if (this.auth.role() === 'BARBER') {
      this.barber.schedules().subscribe({ next: (ss) => { this.schedules = ss; this.computeDerivedFromData(); } });
      this.barber.bookings().subscribe({ next: (bs) => { this.bookings = bs; this.computeViews(); this.computeDerivedFromData(); } });
      this.barber.me().subscribe({ next: (me) => { this.barberName = me?.name || ''; } });
    }
    if (this.auth.role() === 'USER') {
      this.bookingSvc.my().subscribe({
        next: (data: import('../../core/booking.service').Booking[]) => { this.myBookings = data || []; this.computeAnalytics(); },
        error: () => { this.myBookings = []; this.computeAnalytics(); }
      });
      this.profile.me().subscribe({ next: (p) => { this.userName = p?.name || ''; } });
    }
  }

  private buildCarousel() {
    const arr = this.featuredBarbers || [];
    if (!arr.length) { this.carouselPrevNode = null; this.carouselCurrentNode = null; this.carouselNextNode = null; return; }
    const nodes = arr.map(b => ({ barber: b, prev: null as any, next: null as any }));
    for (let i = 0; i < nodes.length; i++) {
      const prev = (i - 1 + nodes.length) % nodes.length;
      const next = (i + 1) % nodes.length;
      nodes[i].prev = nodes[prev];
      nodes[i].next = nodes[next];
    }
    this.carouselCurrentNode = nodes[0];
    this.carouselPrevNode = this.carouselCurrentNode.prev;
    this.carouselNextNode = this.carouselCurrentNode.next;
  }
  carouselNext() {
    if (!this.carouselCurrentNode || !this.carouselCurrentNode.next || !this.carouselCurrentNode.prev) return;
    const cur = this.carouselCurrentNode.next;
    this.carouselCurrentNode = cur;
    this.carouselPrevNode = cur.prev || null;
    this.carouselNextNode = cur.next || null;
  }
  carouselPrev() {
    if (!this.carouselCurrentNode || !this.carouselCurrentNode.next || !this.carouselCurrentNode.prev) return;
    const cur = this.carouselCurrentNode.prev;
    this.carouselCurrentNode = cur;
    this.carouselPrevNode = cur.prev || null;
    this.carouselNextNode = cur.next || null;
  }
  carouselPause() { if (this.carouselTimer) { clearInterval(this.carouselTimer); this.carouselTimer = null; } }
  carouselResume() { if (!this.carouselTimer) { this.carouselTimer = setInterval(() => this.carouselNext(), 4000); } }

  formatPrice(cents: number) {
    return this.currency.formatEurosCentsToCOP(cents);
  }

  realDuration(s: ServiceItem): number {
    return realDurationMinutes(s.name, s.durationMinutes);
  }

  get filteredBookings() {
    const base = (() => {
      switch (this.viewFilter) {
        case 'UPCOMING': return this.bookingsUpcoming || [];
        case 'HISTORY': return this.bookingsHistory || [];
        default: return this.bookings || [];
      }
    })();
    if (!this.focusDate) return base;
    return base.filter(b => {
      const d = new Date(b.startTime);
      return this.sameDay(d, this.focusDate as Date);
    });
  }

  formatCOPCents(cents: number) {
    return this.currency.formatEurosCentsToCOP(cents || 0);
  }

  formatDate(dt: string) {
    try {
      const d = new Date(dt);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch { return dt; }
  }

  private computeViews() {
    const now = new Date();
    const all = this.bookings || [];
    this.bookingsUpcoming = all.filter(b => {
      const end = new Date(b.endTime);
      const status = (b.status || 'CONFIRMED');
      return status !== 'CANCELLED' && status !== 'COMPLETED' && end >= now;
    });
    this.bookingsHistory = all.filter(b => {
      const end = new Date(b.endTime);
      const status = (b.status || 'CONFIRMED');
      return (status === 'CANCELLED' || status === 'COMPLETED') || end < now;
    });
  }

  refreshBookings() {
    this.barber.bookings().subscribe({ next: (bs) => { this.bookings = bs; this.computeViews(); this.computeDerivedFromData(); } });
  }

  canCancel(b: import('../../core/barber.service').Booking): boolean {
    const start = new Date(b.startTime);
    const status = (b.status || 'CONFIRMED');
    return status !== 'CANCELLED' && start > new Date();
  }

  async cancelBooking(b: import('../../core/barber.service').Booking) {
    if (!b.id) return;
    const ok = await this.confirm.confirm({ message: '¿Cancelar esta reserva?', confirmText: 'Sí, cancelar', cancelText: 'No' });
    if (!ok) return;
    this.actionBookingId = b.id;
    this.barber.cancelBooking(b.id).subscribe({
      next: () => { this.refreshBookings(); this.notifications.success('Reserva cancelada'); this.actionBookingId = undefined; },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo cancelar la reserva'); this.actionBookingId = undefined; }
    });
  }

  canComplete(b: import('../../core/barber.service').Booking): boolean {
    const start = new Date(b.startTime);
    const status = (b.status || 'CONFIRMED');
    return status !== 'CANCELLED' && status !== 'COMPLETED' && start <= new Date();
  }

  async completeBooking(b: import('../../core/barber.service').Booking) {
    if (!b.id) return;
    const ok = await this.confirm.confirm({ message: '¿Marcar esta reserva como completada?', confirmText: 'Sí, completar', cancelText: 'No' });
    if (!ok) return;
    this.actionBookingId = b.id;
    this.barber.completeBooking(b.id).subscribe({
      next: () => { this.refreshBookings(); this.notifications.success('Reserva marcada como completada'); this.actionBookingId = undefined; },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo completar la reserva'); this.actionBookingId = undefined; }
    });
  }

  createSchedule() {
    if (!this.newDay || !this.newStart || !this.newEnd) return;
    this.isCreatingSchedule = true;
    this.barber.createSchedule({ dayOfWeek: this.newDay, startTime: this.newStart, endTime: this.newEnd }).subscribe({
      next: (created) => {
        this.schedules = [...(this.schedules || []), created];
        this.notifications.success('Horario creado');
        this.isCreatingSchedule = false;
        this.computeDerivedFromData();
      },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo crear el horario'); this.isCreatingSchedule = false; }
    });
  }

  updateSchedule(s: Schedule) {
    if (!s.id) return;
    this.updatingScheduleId = s.id;
    this.barber.updateSchedule(s.id, { dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }).subscribe({
      next: (updated) => {
        this.schedules = (this.schedules || []).map(x => x.id === updated.id ? updated : x);
        this.notifications.success('Horario actualizado');
        this.updatingScheduleId = undefined;
        this.computeDerivedFromData();
      },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo actualizar el horario'); this.updatingScheduleId = undefined; }
    });
  }

  async deleteSchedule(s: Schedule) {
    if (!s.id) return;
    const ok = await this.confirm.confirm({ message: '¿Eliminar este horario?', confirmText: 'Sí, eliminar', cancelText: 'No' });
    if (!ok) return;
    this.deletingScheduleId = s.id;
    this.barber.deleteSchedule(s.id).subscribe({
      next: () => {
        this.schedules = (this.schedules || []).filter(x => x.id !== s.id);
        this.notifications.success('Horario eliminado');
        this.deletingScheduleId = undefined;
        this.computeDerivedFromData();
      },
      error: (err) => { this.notifications.error(err?.error?.error || 'No se pudo eliminar el horario'); this.deletingScheduleId = undefined; }
    });
  }

  private computeDerivedFromData() {
    void this.weekDays;
  }

  ringStyle(pct: number, color: string) { const p = Math.max(0, Math.min(100, Math.round(pct))); return { background: `conic-gradient(${color} ${p}%, rgba(0,0,0,0.08) 0)` }; }

  get weekDays() {
    const start = this.startOfWeek(new Date());
    const items: { label: string; date: Date; items: import('../../core/barber.service').Booking[]; available: number; booked: number; occupancyPct: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const label = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(day);
      const bks = (this.bookings || []).filter(b => this.sameDay(new Date(b.startTime), day));
      const avail = this.availableMinutes(day);
      const booked = bks.reduce((acc, b) => acc + this.durationMinutes(b), 0);
      const pct = avail > 0 ? Math.min(100, Math.round((booked / avail) * 100)) : 0;
      items.push({ label, date: day, items: bks, available: avail, booked, occupancyPct: pct });
    }
    this.weeklyOccupancyPct = this.safeAvg(items.map(x => x.occupancyPct));
    this.occupancyMetrics = items.map(x => ({ day: x.label, pct: x.occupancyPct }));
    this.peakHoursText = this.computePeakHoursText(items);
    this.computeFinancials();
    return items;
  }

  private computePeakHoursText(items: { items: import('../../core/barber.service').Booking[] }[]): string {
    const counts: Record<string, number> = {};
    items.forEach(day => {
      day.items.forEach(b => {
        const d = new Date(b.startTime);
        const h = d.getHours();
        const key = `${String(h).padStart(2, '0')}:00`;
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2);
    if (!top.length) return '';
    const ranges = top.map(([hh]) => {
      const h = parseInt(hh.slice(0,2), 10);
      const end = (h + 1) % 24;
      return `${hh}–${String(end).padStart(2,'0')}:00`;
    });
    return ranges.join(', ');
  }

  private computeFinancials() {
    const now = new Date();
    const months: string[] = [];
    const vals: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = d.getMonth();
      const yy = d.getFullYear();
      months.push(new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d));
      const v = (this.bookings || [])
        .filter(b => {
          const dt = new Date(b.startTime);
          return dt.getMonth() === mm && dt.getFullYear() === yy && (b.status !== 'CANCELLED');
        })
        .reduce((acc, b) => acc + (b.priceCents || 0), 0);
      vals.push(v);
    }
    this.earningsMonths = months;
    this.earningsValues = vals;
    const cur = vals[vals.length - 1] || 0;
    const prev = vals[vals.length - 2] || 1;
    this.currentVsPrevDelta = Math.round(((cur - prev) / prev) * 100);
    this.projectedIncome = (this.bookingsUpcoming || [])
      .filter(b => (b.status !== 'CANCELLED'))
      .reduce((acc, b) => acc + (b.priceCents || 0), 0);
    const byService: Record<string, number> = {};
    (this.bookings || []).forEach(b => {
      if (b.status === 'CANCELLED') return;
      const k = b.service || 'Otro';
      byService[k] = (byService[k] || 0) + (b.priceCents || 0);
    });
    const top = Object.entries(byService).sort((a, b) => b[1] - a[1])[0];
    this.topService = top ? { name: top[0], revenue: top[1] } : undefined;
    const total = (this.bookings || []).length || 1;
    const cancelled = (this.bookings || []).filter(b => b.status === 'CANCELLED').length;
    this.cancelRate = Math.round((cancelled / total) * 100);
    const byClient: Record<string, { revenue: number; count: number }> = {};
    (this.bookings || []).forEach(b => {
      const k = b.clientName || '—';
      const rev = b.status === 'CANCELLED' ? 0 : (b.priceCents || 0);
      const prevC = byClient[k]?.count || 0;
      const prevR = byClient[k]?.revenue || 0;
      byClient[k] = { revenue: prevR + rev, count: prevC + 1 };
    });
    this.topClients = Object.entries(byClient)
      .map(([name, v]) => ({ name, revenue: v.revenue, count: v.count }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    this.computeAssistantTips();
  }

  private computeAssistantTips() {
    const tips: string[] = [];
    tips.push(`Tu agenda está al ${this.weeklyOccupancyPct}% esta semana`);
    const lowSlots = this.lowOccupancySlots();
    if (lowSlots) tips.push(`Detectamos baja ocupación ${lowSlots}. Considera promociones en esos horarios`);
    if (this.topService) tips.push(`Tus servicios de mayor margen: ${this.topService.name}. Promuévelos más`);
    const delta = this.currentVsPrevDelta;
    if (delta < 0) tips.push(`Podrías aumentar ingresos ajustando precios de servicios premium`);
    tips.push('Quienes toman corte A a menudo requieren barba. Ofrece combos');
    tips.push(`Tu tasa de cancelación es ${this.cancelRate}%. Activa recordatorios o depósitos`);
    tips.push('Identifica períodos de baja demanda y lanza campañas puntuales');
    tips.push('Extiende horario en días de alta demanda y prueba nuevos servicios');
    this.assistantTips = tips;
    const headline = lowSlots ? 'Baja ocupación detectada. Revisa promociones sugeridas.' : 'Agenda saludable esta semana.';
    if (headline !== this.assistantHeadlineLast) {
      this.assistantHeadlineLast = headline;
    }
  }

  private lowOccupancySlots(): string {
    const metrics = this.occupancyMetrics || [];
    const lows = metrics.filter(x => x.pct < 40).map(x => x.day);
    return lows.length ? `en ${lows.join(', ')}` : '';
  }

  private startOfWeek(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  }
  private startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private endOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth()+1, 0); }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private availableMinutes(day: Date): number {
    const dow = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][day.getDay()];
    const slots = (this.schedules || []).filter(s => s.dayOfWeek === dow);
    return slots.reduce((acc, s) => acc + this.hhmmToMinutes(s.startTime, s.endTime), 0);
  }

  private durationMinutes(b: import('../../core/barber.service').Booking): number {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  }

  private hhmmToMinutes(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(n => parseInt(n, 10));
    const [eh, em] = end.split(':').map(n => parseInt(n, 10));
    return ((eh * 60 + em) - (sh * 60 + sm));
  }

  private safeAvg(nums: number[]): number { const s = nums.reduce((a, b) => a + b, 0); const n = nums.length || 1; return Math.round(s / n); }

  timeShort(iso: string): string { return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); }

  prevMonth() { this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() - 1, 1); }
  nextMonth() { this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() + 1, 1); }
  monthName(d: Date): string { return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d); }
  earnBarHeight(cents: number): string {
    const max = Math.max(...this.earningsValues, 1);
    const h = Math.round(((cents || 0) / max) * 140) + 20;
    return h + 'px';
  }
  earnBarColor(cents: number): string {
    const avg = this.safeAvg(this.earningsValues) || 1;
    if ((cents || 0) > avg * 1.2) return 'bg-indigo-400 rounded';
    if ((cents || 0) > avg * 1.05) return 'bg-indigo-300 rounded';
    return 'bg-indigo-200 rounded';
  }

  // CLIENT: estado y analítica
  myBookings: import('../../core/booking.service').Booking[] = [];
  months: string[] = [];
  monthlyCuts: number[] = [];
  monthlySpend: number[] = [];
  rangeMonths = 12;
  totalCuts12m = 0;
  totalSpend12m = 0;
  avgMonthlySpend = 0;
  avgCostPerCut = 0;
  recentBookings: import('../../core/booking.service').Booking[] = [];
  alertMessage = '';
  recommendations: string[] = [];
  expenseStatusClass = '';
  alertClass = '';
  darkMode = false;
  availableCouponPct: number = 0;
  wheelAngle = 0;
  spinning = false;
  wheelLabel = '';
  wheelUsed = false;
  spunAtCount = 0;
  cutsPct(): number { const idx = this.months.length - 1; const cur = this.monthlyCuts[idx] || 0; const avg = Math.max(1, Math.round(this.totalCuts12m / 12)); return Math.min(100, Math.round((cur / avg) * 100)); }
  spendPct(): number { const idx = this.months.length - 1; const cur = this.monthlySpend[idx] || 0; const avg = Math.max(1, this.avgMonthlySpend || 1); return Math.min(100, Math.round((cur / avg) * 100)); }
  avgCuts(): number { return Math.round(this.totalCuts12m / 12); }
  rebuild() { this.computeAnalytics(); }
  private computeAnalytics() {
    const now = new Date();
    const monthsLabels: string[] = [];
    const cuts: number[] = [];
    const spend: number[] = [];
    const total = this.rangeMonths;
    for (let i = total - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsLabels.push(this.monthShort(d));
      const mm = d.getMonth();
      const yy = d.getFullYear();
      const bucket = (this.myBookings || []).filter(b => { const dt = new Date(b.startTime); return dt.getMonth() === mm && dt.getFullYear() === yy && (b.status !== 'CANCELLED'); });
      cuts.push(bucket.length);
      const s = bucket.reduce((acc, b) => acc + (b.priceCents || 0), 0);
      spend.push(s);
    }
    this.months = monthsLabels;
    this.monthlyCuts = cuts;
    this.monthlySpend = spend;
    this.totalCuts12m = cuts.reduce((a, b) => a + b, 0);
    const totalCents = spend.reduce((a, b) => a + b, 0);
    this.totalSpend12m = totalCents;
    this.avgMonthlySpend = Math.round(totalCents / 12);
    this.avgCostPerCut = this.totalCuts12m > 0 ? Math.round(totalCents / this.totalCuts12m) : 0;
    this.recentBookings = [...(this.myBookings || [])]
      .filter(b => b.status !== 'CANCELLED')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 8);
    this.computeAi();
  }
  private computeAi() {
    const currentMonthIndex = this.months.length - 1;
    const cutsThisMonth = this.monthlyCuts[currentMonthIndex] || 0;
    const spendThisMonth = this.monthlySpend[currentMonthIndex] || 0;
    const avgCuts = Math.round(this.totalCuts12m / 12);
    const avgSpend = this.avgMonthlySpend;
    const highCuts = cutsThisMonth >= 4;
    const highSpend = spendThisMonth > Math.round(avgSpend * 1.2);
    const moderateSpend = spendThisMonth > Math.round(avgSpend * 1.05);
    if (highCuts || highSpend) { this.alertMessage = `Hey, detectamos un gasto de ${this.formatCOPCents(spendThisMonth)} este mes y ${cutsThisMonth} corte(s). Tenemos recomendaciones para optimizar.`; this.alertClass = 'text-red-700 bg-red-50 border border-red-100 rounded p-2'; this.notifications.warning('Agenda y gasto altos este mes. Revisa recomendaciones.'); }
    else if (moderateSpend) { this.alertMessage = `Tu gasto este mes es ${this.formatCOPCents(spendThisMonth)}. Aquí van algunas sugerencias para equilibrarlo.`; this.alertClass = 'text-yellow-700 bg-yellow-50 border border-yellow-100 rounded p-2'; this.notifications.info('Ligero aumento de gasto. Te dejamos sugerencias.'); }
    else { this.alertMessage = `Buen control: ${this.formatCOPCents(spendThisMonth)} este mes y ${cutsThisMonth} corte(s).`; this.alertClass = 'text-green-700 bg-green-50 border border-green-100 rounded p-2'; this.notifications.success('Buen control de gasto este mes.'); }
    const recs: string[] = [];
    if (cutsThisMonth >= 3) recs.push('Considera paquetes o membresías si realizas varios cortes al mes');
    if (this.avgCostPerCut > Math.round(avgSpend / Math.max(avgCuts, 1))) recs.push('Explora servicios más económicos sin perder calidad');
    recs.push('Espacia los cortes: cabello liso 4–6 semanas, ondulado 3–5, rizado 2–4');
    recs.push('Activa descuentos por referidos o acumula puntos de lealtad');
    this.recommendations = recs;
    this.expenseStatusClass = highSpend ? 'text-red-700' : moderateSpend ? 'text-yellow-700' : 'text-green-700';
    this.restoreCoupon();
    this.restoreWheelState();
  }
  private restoreCoupon() {
    const key = 'coupon_' + (this.auth.email() || '');
    try { const raw = localStorage.getItem(key); if (raw) { const obj = JSON.parse(raw || '{}'); const pct = parseInt(String(obj?.pct || '0'), 10); if (!isNaN(pct) && pct > 0) this.availableCouponPct = pct; } } catch {}
  }
  private restoreWheelState() {
    const ek = (this.auth.email() || '');
    try {
      const rawU = localStorage.getItem('wheel_used_' + ek);
      const rawC = localStorage.getItem('wheel_count_' + ek);
      if (rawU) { const o = JSON.parse(rawU || '{}'); this.wheelUsed = !!o?.used; }
      if (rawC) { const o = JSON.parse(rawC || '{}'); const c = parseInt(String(o?.count || '0'), 10); this.spunAtCount = isNaN(c) ? 0 : c; }
    } catch {}
  }
  private persistWheelState(used: boolean) {
    const ek = (this.auth.email() || '');
    try {
      localStorage.setItem('wheel_used_' + ek, JSON.stringify({ used }));
      localStorage.setItem('wheel_count_' + ek, JSON.stringify({ count: this.spunAtCount }));
    } catch {}
  }
  canSpin(): boolean {
    const threshold = (this.spunAtCount > 0) ? (this.spunAtCount + 5) : 5;
    return (this.myBookings.length >= threshold) && !this.spinning && !this.availableCouponPct && !this.wheelUsed;
  }
  private persistCoupon(pct: number) {
    const key = 'coupon_' + (this.auth.email() || '');
    try { localStorage.setItem(key, JSON.stringify({ pct, ts: Date.now() })); } catch {}
  }
  private clearCoupon() {
    const key = 'coupon_' + (this.auth.email() || '');
    try { localStorage.removeItem(key); } catch {}
    this.availableCouponPct = 0;
  }
  spinWheel() {
    if (!this.canSpin()) return;
    const weights: { pct: number; w: number; angle: number; label: string }[] = [
      { pct: 20, w: 0.5, angle: 45, label: '20%' },
      { pct: 30, w: 0.3, angle: 135, label: '30%' },
      { pct: 40, w: 0.15, angle: 225, label: '40%' },
      { pct: 50, w: 0.05, angle: 315, label: '50%' }
    ];
    const r = Math.random();
    let acc = 0;
    let chosen = weights[0];
    for (const opt of weights) { acc += opt.w; if (r <= acc) { chosen = opt; break; } }
    this.spinning = true;
    const turns = 1440;
    this.wheelLabel = '';
    this.wheelAngle = turns + chosen.angle;
    setTimeout(() => { this.spinning = false; this.wheelLabel = chosen.label; this.availableCouponPct = chosen.pct; this.persistCoupon(chosen.pct); this.spunAtCount = this.myBookings.length; this.wheelUsed = true; this.persistWheelState(true); }, 4800);
  }
  private monthShort(d: Date): string { return new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d); }
  barHeight(n: number): string { const max = Math.max(...this.monthlyCuts, 1); const h = Math.round((n / max) * 140) + 20; return h + 'px'; }
  barColor(n: number): string { if (n >= 4) return 'bg-red-300 hover:bg-red-400 transition-all rounded'; if (n >= 3) return 'bg-yellow-300 hover:bg-yellow-400 transition-all rounded'; return 'bg-green-300 hover:bg-green-400 transition-all rounded'; }
  barHeightSpend(cents: number): string { const max = Math.max(...this.monthlySpend, 1); const h = Math.round(((cents || 0) / max) * 140) + 20; return h + 'px'; }
  spendBarColor(cents: number): string { const avg = this.avgMonthlySpend || 1; if ((cents || 0) > avg * 1.2) return 'bg-red-300 hover:bg-red-400 transition-all rounded'; if ((cents || 0) > avg * 1.05) return 'bg-yellow-300 hover:bg-yellow-400 transition-all rounded'; return 'bg-green-300 hover:bg-green-400 transition-all rounded'; }
  get monthDays() {
    const start = this.startOfMonth(this.monthCursor);
    const end = this.endOfMonth(this.monthCursor);
    const days: { date: Date; items: import('../../core/barber.service').Booking[]; occupancyPct: number }[] = [];
    for (let i = 1; i <= end.getDate(); i++) {
      const day = new Date(start.getFullYear(), start.getMonth(), i);
      const items = (this.bookings || []).filter(b => this.sameDay(new Date(b.startTime), day));
      const avail = this.availableMinutes(day);
      const booked = items.reduce((acc, b) => acc + this.durationMinutes(b), 0);
      const pct = avail > 0 ? Math.min(100, Math.round((booked / avail) * 100)) : 0;
      days.push({ date: day, items, occupancyPct: pct });
    }
    return days;
  }
  openDay(d: Date) { this.focusDate = d; this.viewFilter = 'ALL'; }
  clearFocus() { this.focusDate = undefined; }
}