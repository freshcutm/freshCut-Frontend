import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmState extends ConfirmOptions {
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private _state$ = new BehaviorSubject<ConfirmState | null>(null);
  private resolver?: (value: boolean) => void;

  state$ = this._state$.asObservable();

  confirm(opts: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      this._state$.next({ visible: true, ...opts });
    });
  }

  accept() {
    this.resolver?.(true);
    this.clear();
  }

  cancel() {
    this.resolver?.(false);
    this.clear();
  }

  private clear() {
    this._state$.next(null);
    this.resolver = undefined;
  }
}