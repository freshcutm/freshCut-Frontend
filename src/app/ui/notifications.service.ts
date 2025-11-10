import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  timeoutMs?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private seq = 0;
  private _toasts$ = new Subject<ToastMessage[]>();
  private current: ToastMessage[] = [];

  toasts$ = this._toasts$.asObservable();

  success(message: string, timeoutMs = 3500) { this.push('success', message, timeoutMs); }
  error(message: string, timeoutMs = 5000) { this.push('error', message, timeoutMs); }
  info(message: string, timeoutMs = 3500) { this.push('info', message, timeoutMs); }
  warning(message: string, timeoutMs = 4000) { this.push('warning', message, timeoutMs); }

  dismiss(id: number) {
    this.current = this.current.filter(t => t.id !== id);
    this._toasts$.next(this.current);
  }

  clear() {
    this.current = [];
    this._toasts$.next(this.current);
  }

  private push(type: ToastType, message: string, timeoutMs: number) {
    const toast: ToastMessage = { id: ++this.seq, type, message, timeoutMs };
    this.current = [...this.current, toast];
    this._toasts$.next(this.current);
    if (timeoutMs && timeoutMs > 0) {
      setTimeout(() => this.dismiss(toast.id), timeoutMs);
    }
  }
}