import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { BookingService, Booking } from '../../core/booking.service';
import { CurrencyService } from '../../core/currency.service';
import { NotificationsService } from '../../ui/notifications.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-0">
      <h2 class="barber-title text-3xl font-bold mb-2">Mi panel</h2>
      <p class="text-sm text-gray-600 mb-6">Bienvenido, <span class="font-medium">{{ auth.email() }}</span></p>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div class="border rounded p-4 bg-white lg:col-span-1">
          <h3 class="barber-subtitle font-semibold mb-2">Accesos rápidos</h3>
          <div class="flex flex-col gap-2 text-sm">
            <a routerLink="/reservas" class="text-indigo-600 hover:underline">Mis reservas</a>
            <a routerLink="/reservas/nueva" class="text-indigo-600 hover:underline">Nueva reserva</a>
            <a routerLink="/servicios" class="text-indigo-600 hover:underline">Explorar servicios</a>
            <a routerLink="/ia" class="text-indigo-600 hover:underline">Asistente IA</a>
          </div>
        </div>
        <div class="border rounded p-4 bg-white lg:col-span-3">
          <div class="flex items-center justify-between mb-2">
            <h3 class="barber-subtitle font-semibold">Frecuencia de cortes (12 meses)</h3>
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
          <div class="h-36 flex items-end gap-1">
            <div *ngFor="let m of months; let i = index"
                 class="flex-1 relative group"
                 [style.height]="barHeight(monthlyCuts[i])"
                 [ngClass]="barColor(monthlyCuts[i])">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-700">{{ monthlyCuts[i] }}</div>
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/5"></div>
              <div class="text-[10px] text-gray-600 text-center mt-1">{{ m }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="border rounded p-4 bg-white">
          <h3 class="barber-subtitle font-semibold mb-2">Gasto acumulado</h3>
          <div class="flex items-baseline gap-3">
            <div class="text-2xl font-bold" [ngClass]="expenseStatusClass">{{ formatCOP(totalSpend12m) }}</div>
            <div class="text-xs text-gray-500">Promedio por corte: {{ formatCOP(avgCostPerCut) }}</div>
          </div>
          <div class="mt-2 text-xs text-gray-600">Promedio mensual: {{ formatCOP(avgMonthlySpend) }}</div>
        </div>
        <div class="border rounded p-4 bg-white lg:col-span-2">
          <h3 class="barber-subtitle font-semibold mb-2">Gasto mensual (12 meses)</h3>
          <div class="h-36 flex items-end gap-1">
            <div *ngFor="let m of months; let i = index"
                 class="flex-1 relative group"
                 [style.height]="barHeightSpend(monthlySpend[i])"
                 [ngClass]="spendBarColor(monthlySpend[i])">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-700">{{ formatCOP(monthlySpend[i]) }}</div>
              <div class="text-[10px] text-gray-600 text-center mt-1">{{ m }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="border rounded p-4 bg-white lg:col-span-2">
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
              <div class="text-sm font-semibold">{{ formatCOP(b.priceCents || 0) }}</div>
            </div>
            <div *ngIf="!recentBookings.length" class="py-3 text-sm text-gray-500">Aún no tienes servicios registrados.</div>
          </div>
        </div>
        <div class="border rounded p-4 bg-white">
          <div class="flex items-center gap-2 mb-2">
            <div class="text-xl">💡</div>
            <h3 class="barber-subtitle font-semibold">Análisis inteligente</h3>
          </div>
          <div class="text-sm mb-2" [ngClass]="alertClass">{{ alertMessage }}</div>
          <ul class="text-sm list-disc pl-5 space-y-1">
            <li *ngFor="let r of recommendations">{{ r }}</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
  constructor(public auth: AuthService, private bookings: BookingService, private currency: CurrencyService, private notifications: NotificationsService) {}

  dataLoaded = false;
  myBookings: Booking[] = [];
  months: string[] = [];
  monthlyCuts: number[] = [];
  monthlySpend: number[] = [];
  rangeMonths = 12;
  totalCuts12m = 0;
  totalSpend12m = 0;
  avgMonthlySpend = 0;
  avgCostPerCut = 0;
  recentBookings: Booking[] = [];
  alertMessage = '';
  recommendations: string[] = [];
  expenseStatusClass = '';
  alertClass = '';

  ngOnInit(): void {
    this.currency.warmup();
    this.bookings.my().subscribe({
      next: (data) => {
        this.myBookings = data || [];
        this.computeAnalytics();
        this.dataLoaded = true;
      },
      error: () => {
        this.myBookings = [];
        this.computeAnalytics();
        this.dataLoaded = true;
      }
    });
  }

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
      const bucket = this.myBookings.filter(b => {
        const dt = new Date(b.startTime);
        return dt.getMonth() === mm && dt.getFullYear() === yy && (b.status !== 'CANCELLED');
      });
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
    this.recentBookings = [...this.myBookings]
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
    if (highCuts || highSpend) {
      this.alertMessage = `Hey, detectamos un gasto de ${this.formatCOP(spendThisMonth)} este mes y ${cutsThisMonth} corte(s). Tenemos recomendaciones para optimizar.`;
      this.alertClass = 'text-red-700 bg-red-50 border border-red-100 rounded p-2';
      this.notifications.warning('Agenda y gasto altos este mes. Revisa recomendaciones.');
    } else if (moderateSpend) {
      this.alertMessage = `Tu gasto este mes es ${this.formatCOP(spendThisMonth)}. Aquí van algunas sugerencias para equilibrarlo.`;
      this.alertClass = 'text-yellow-700 bg-yellow-50 border border-yellow-100 rounded p-2';
      this.notifications.info('Ligero aumento de gasto. Te dejamos sugerencias.');
    } else {
      this.alertMessage = `Buen control: ${this.formatCOP(spendThisMonth)} este mes y ${cutsThisMonth} corte(s).`;
      this.alertClass = 'text-green-700 bg-green-50 border border-green-100 rounded p-2';
      this.notifications.success('Buen control de gasto este mes.');
    }
    const recs: string[] = [];
    if (cutsThisMonth >= 3) recs.push('Considera paquetes o membresías si realizas varios cortes al mes');
    if (this.avgCostPerCut > Math.round(avgSpend / Math.max(avgCuts, 1))) recs.push('Explora servicios más económicos sin perder calidad');
    recs.push('Espacia los cortes: cabello liso 4–6 semanas, ondulado 3–5, rizado 2–4');
    recs.push('Activa descuentos por referidos o acumula puntos de lealtad');
    this.recommendations = recs;
    this.expenseStatusClass = highSpend ? 'text-red-700' : moderateSpend ? 'text-yellow-700' : 'text-green-700';
  }

  private monthShort(d: Date): string {
    return new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(d);
  }

  barHeight(n: number): string {
    const max = Math.max(...this.monthlyCuts, 1);
    const h = Math.round((n / max) * 140) + 20;
    return h + 'px';
  }

  barColor(n: number): string {
    if (n >= 4) return 'bg-red-300 hover:bg-red-400 transition-all rounded';
    if (n >= 3) return 'bg-yellow-300 hover:bg-yellow-400 transition-all rounded';
    return 'bg-green-300 hover:bg-green-400 transition-all rounded';
  }

  barHeightSpend(cents: number): string {
    const max = Math.max(...this.monthlySpend, 1);
    const h = Math.round((cents / max) * 140) + 20;
    return h + 'px';
  }

  spendBarColor(cents: number): string {
    const avg = this.avgMonthlySpend || 1;
    if (cents > avg * 1.2) return 'bg-red-300 hover:bg-red-400 transition-all rounded';
    if (cents > avg * 1.05) return 'bg-yellow-300 hover:bg-yellow-400 transition-all rounded';
    return 'bg-green-300 hover:bg-green-400 transition-all rounded';
  }

  formatCOP(cents: number): string {
    return this.currency.formatEurosCentsToCOP(cents);
  }
}