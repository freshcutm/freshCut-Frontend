import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private rateEURtoCOP: number | null = null;
  private lastFetchTs: number = 0;
  private readonly cacheKey = 'fx_EUR_COP_rate';
  private readonly cacheTsKey = 'fx_EUR_COP_ts';

  constructor(private http: HttpClient) {
    // Load cached
    const cached = localStorage.getItem(this.cacheKey);
    const ts = localStorage.getItem(this.cacheTsKey);
    if (cached) {
      const num = parseFloat(cached);
      if (!isNaN(num) && num > 0) this.rateEURtoCOP = num;
    }
    if (ts) {
      const t = parseInt(ts, 10);
      if (!isNaN(t)) this.lastFetchTs = t;
    }
  }

  /** Fetch EUR->COP rate, cached for 24h, with safe fallback. */
  async ensureRate(): Promise<number> {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (this.rateEURtoCOP && (now - this.lastFetchTs) < twentyFourHours) {
      return this.rateEURtoCOP;
    }
    try {
      // Public API without auth, CORS-enabled
      const url = 'https://api.exchangerate.host/latest?base=EUR&symbols=COP';
      const resp = await firstValueFrom(this.http.get<any>(url));
      const rate = resp?.rates?.COP;
      if (typeof rate === 'number' && rate > 0) {
        this.rateEURtoCOP = rate;
        this.lastFetchTs = now;
        localStorage.setItem(this.cacheKey, String(rate));
        localStorage.setItem(this.cacheTsKey, String(now));
        return rate;
      }
      // Fallback if API returns unexpected
      return this.fallbackRate();
    } catch {
      return this.fallbackRate();
    }
  }

  /** Convert cents in EUR to COP amount */
  async eurosCentsToCOPAmount(euroCents: number | null | undefined): Promise<number> {
    const rate = await this.ensureRate();
    const euros = (euroCents ?? 0) / 100;
    return euros * rate;
  }

  /** Synchronous formatter using last known rate; may trigger async refresh in background */
  formatEurosCentsToCOP(euroCents: number | null | undefined): string {
    const euros = (euroCents ?? 0) / 100;
    const rate = this.rateEURtoCOP || this.fallbackRate();
    const cop = euros * rate;
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cop);
    } catch {
      return `${Math.round(cop)} COP`;
    }
  }

  /** Kick off a background refresh, safe to call on init */
  warmup(): void {
    this.ensureRate().catch(() => {});
  }

  private fallbackRate(): number {
    // Conservative fallback rate; updated periodically if API fails
    const DEFAULT = 4300; // COP per EUR (approx; will be replaced by real-time on success)
    if (!this.rateEURtoCOP) this.rateEURtoCOP = DEFAULT;
    return this.rateEURtoCOP;
  }
}