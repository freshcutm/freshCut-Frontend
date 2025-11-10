import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmState } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="state as s" class="fixed inset-0 z-[1100]">
      <div class="absolute inset-0 bg-black/40" (click)="onCancel()"></div>
      <div class="relative max-w-md mx-auto mt-28">
        <div class="rounded-lg shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-500 text-white px-4 py-3">
            <h3 class="text-lg font-semibold">Confirmar acción</h3>
          </div>
          <div class="bg-white p-4">
            <p class="text-sm text-gray-700">{{ s.message }}</p>
            <div class="mt-4 flex justify-end gap-3">
              <button class="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200" (click)="onCancel()">{{ s.cancelText || 'Cancelar' }}</button>
              <button class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" (click)="onAccept()">{{ s.confirmText || 'Aceptar' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  state: ConfirmState | null = null;

  constructor(private confirm: ConfirmService) {
    this.confirm.state$.subscribe(s => this.state = s);
  }

  @HostListener('document:keydown.escape') onEsc() { this.onCancel(); }

  onAccept() { this.confirm.accept(); }
  onCancel() { this.confirm.cancel(); }
}