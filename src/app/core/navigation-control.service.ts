import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationControlService {
  private token: string | null = null;
  private active = false;
  private popHandler = (e: PopStateEvent) => {
    if (!this.active) return;
    const t = this.token;
    const s = (e.state && e.state.__sessionToken) || null;
    if (!t || s !== t) {
      this.redirectToDashboard();
      this.pushLockState();
      return;
    }
    this.redirectToDashboard();
    this.pushLockState();
  };
  private keyHandler = (e: KeyboardEvent) => {
    if (!this.active) return;
    const isAltLeft = e.altKey && e.key === 'ArrowLeft';
    const isMetaBracket = (e.metaKey || e.ctrlKey) && (e.key === '[' || e.key === 'BrowserBack');
    if (isAltLeft || isMetaBracket) {
      e.preventDefault();
      this.redirectToDashboard();
      this.pushLockState();
    }
  };

  constructor(private router: Router) {
    this.router.events.subscribe(ev => {
      if (!this.active) return;
      if (ev instanceof NavigationStart) {
        const url = ev.url || '';
        if (this.isUnauthorizedDuringSession(url)) {
          this.redirectToDashboard();
        } else {
          this.pushLockState();
        }
      }
    });
  }

  init() {
    const t = sessionStorage.getItem('session_lock_token');
    if (this.isLoggedIn()) {
      if (t) {
        this.token = t;
        this.activate();
        this.pushInitialBarrier();
      }
    } else {
      this.deactivate();
    }
  }

  activateSessionLock() {
    const t = this.generateToken();
    this.token = t;
    sessionStorage.setItem('session_lock_token', t);
    this.activate();
    this.pushInitialBarrier();
  }

  deactivateSessionLockAndCleanup() {
    this.deactivate();
    sessionStorage.removeItem('session_lock_token');
    this.clearTemporalData();
  }

  private activate() {
    if (this.active) return;
    this.active = true;
    window.addEventListener('popstate', this.popHandler);
    window.addEventListener('keydown', this.keyHandler, { capture: true });
  }

  private deactivate() {
    if (!this.active) return;
    this.active = false;
    window.removeEventListener('popstate', this.popHandler);
    window.removeEventListener('keydown', this.keyHandler, { capture: true } as any);
  }

  private pushInitialBarrier() {
    this.pushLockState();
    this.pushLockState();
  }

  private pushLockState() {
    const t = this.token;
    if (!t) return;
    try {
      history.pushState({ __sessionToken: t }, document.title, location.pathname + location.search + location.hash);
    } catch {}
  }

  private redirectToDashboard() {
    const r = this.currentRole();
    if (r === 'ADMIN') {
      this.router.navigateByUrl('/admin', { replaceUrl: true });
      return;
    }
    if (r === 'BARBER') {
      this.router.navigateByUrl('/home', { replaceUrl: true });
      return;
    }
    if (r === 'USER') {
      this.router.navigateByUrl('/home', { replaceUrl: true });
      return;
    }
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  private isUnauthorizedDuringSession(url: string) {
    if (!this.isLoggedIn()) return false;
    if (url.startsWith('/auth')) return true;
    return false;
  }

  private generateToken(): string {
    const c: any = (window as any).crypto;
    if (c && c.randomUUID) return c.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  private async clearTemporalData() {
    try { sessionStorage.clear(); } catch {}
    try {
      const cs: any = (window as any).caches;
      if (cs && cs.keys) {
        const keys = await cs.keys();
        for (const k of keys) await cs.delete(k);
      }
    } catch {}
  }

  private isLoggedIn(): boolean {
    try { return !!localStorage.getItem('auth_token'); } catch { return false; }
  }

  private currentRole(): 'ADMIN' | 'BARBER' | 'USER' | null {
    try { return (localStorage.getItem('auth_role') as any) || null; } catch { return null; }
  }
}