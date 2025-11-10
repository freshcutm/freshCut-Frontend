import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService, ToastMessage } from './notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-3 right-3 z-[1000] space-y-2 w-[92vw] sm:w-[360px]">
      <div *ngFor="let t of toasts" [ngClass]="toastClass(t)" class="rounded shadow flex items-start gap-3 p-3 border">
        <div class="mt-0.5">
          <span [ngClass]="iconClass(t)" class="inline-block w-2 h-2 rounded-full"></span>
        </div>
        <div class="text-sm flex-1">{{ t.message }}</div>
        <button (click)="dismiss(t.id)" class="text-xs text-gray-300 hover:text-white">✕</button>
      </div>
    </div>
  `
})
export class ToastContainerComponent implements OnDestroy {
  toasts: ToastMessage[] = [];
  private sub: Subscription;

  constructor(private notifications: NotificationsService) {
    this.sub = this.notifications.toasts$.subscribe(list => this.toasts = list);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismiss(id: number) { this.notifications.dismiss(id); }

  toastClass(t: ToastMessage) {
    switch (t.type) {
      case 'success': return 'bg-green-700/90 text-white border-green-500/40';
      case 'error': return 'bg-red-700/90 text-white border-red-500/40';
      case 'info': return 'bg-indigo-700/90 text-white border-indigo-500/40';
      case 'warning': return 'bg-amber-700/90 text-white border-amber-500/40';
      default: return 'bg-gray-800 text-white border-gray-600';
    }
  }

  iconClass(t: ToastMessage) {
    switch (t.type) {
      case 'success': return 'bg-green-300';
      case 'error': return 'bg-red-300';
      case 'info': return 'bg-indigo-300';
      case 'warning': return 'bg-amber-300';
      default: return 'bg-gray-300';
    }
  }
}