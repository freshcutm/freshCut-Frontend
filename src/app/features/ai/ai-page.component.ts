import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/ai.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ai-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-gray-100 border border-neutral-700 shadow-xl grid gap-6">
      <h2 class="barber-title text-3xl sm:text-4xl font-bold tracking-tight text-indigo-400">Asistente IA</h2>
      <p class="barber-subtitle text-sm text-gray-300">Sube una foto de tu rostro (cámara o galería). La IA analizará tu foto y te dará recomendaciones de cortes que más te favorecerían y cuidados a seguir, en texto claro y breve.</p>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-300">Foto del rostro</label>
          <div class="flex items-center gap-2 mt-1">
            <label class="text-xs text-gray-400">Cámara:</label>
            <select [(ngModel)]="selectedFacing" name="facing" (change)="onFacingChange()" class="bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-sm text-gray-100">
              <option value="user">Frontal (selfie)</option>
              <option value="environment">Trasera (entorno)</option>
            </select>
          </div>
          <input type="file" accept="image/*" [attr.capture]="selectedFacing" (change)="onImageSelected($event)" class="mt-2 w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div class="mt-2">
            <button type="button" (click)="startCamera()" [disabled]="cameraOn" class="mt-2 border border-neutral-600 px-3 py-2 rounded hover:bg-neutral-800 disabled:opacity-50">Usar cámara</button>
          </div>
          <div class="mt-3" *ngIf="cameraOn">
            <div class="relative">
              <video #video autoplay playsinline class="w-full max-h-64 rounded-lg border border-neutral-700" [style.transform]="selectedFacing==='user' ? 'scaleX(-1)' : 'none'"></video>
              <div *ngIf="countingDown" class="absolute inset-0 flex items-center justify-center bg-black/40">
                <div class="text-white text-4xl font-bold">{{ countdown }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3 mt-2 flex-wrap">
              <button type="button" (click)="takeSnapshot()" class="btn btn-primary">Tomar foto</button>
              <button type="button" (click)="takeSnapshotWithCountdown()" class="border border-neutral-600 px-3 py-2 rounded hover:bg-neutral-800">Foto en 3s</button>
              <button type="button" (click)="stopCamera()" class="border border-neutral-600 px-3 py-2 rounded hover:bg-neutral-800">Cerrar cámara</button>
              <button type="button" (click)="switchFacing()" class="border border-neutral-600 px-3 py-2 rounded hover:bg-neutral-800">Cambiar a {{ selectedFacing === 'user' ? 'trasera' : 'frontal' }}</button>
              <button *ngIf="torchAvailable" type="button" (click)="toggleTorch()" class="border border-neutral-600 px-3 py-2 rounded hover:bg-neutral-800">{{ torchOn ? 'Apagar linterna' : 'Encender linterna' }}</button>
              <div *ngIf="devices.length > 0" class="flex items-center gap-2">
                <label class="text-xs text-gray-400">Dispositivo:</label>
                <select [ngModel]="selectedDeviceId ?? ''" (change)="onDeviceChange($event)" class="bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-sm text-gray-100">
                  <option value="">Auto</option>
                  <option *ngFor="let d of devices" [value]="d.deviceId">{{ d.label || ('Cámara ' + (d.deviceId | slice:0:6)) }}</option>
                </select>
                <button type="button" (click)="refreshDevices()" class="text-xs underline">Refrescar</button>
              </div>
              <div class="text-xs text-gray-400">Luz: <span class="font-medium text-indigo-300">{{ lightHint }}</span> ({{ lightLevel }}%)</div>
            </div>
          </div>
          <canvas #snapshotCanvas class="hidden"></canvas>
          <div class="mt-3" *ngIf="imgPreview">
            <div class="text-xs text-gray-400 mb-1">Previsualización</div>
            <div class="bg-neutral-800 border border-neutral-700 rounded p-3">
              <img [src]="imgPreview" alt="Previsualización" class="max-h-64 rounded" />
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-300">Notas (opcional)</label>
          <textarea [(ngModel)]="notes" name="notes" rows="6" class="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: frente amplia, pómulos marcados, evitar peinados muy altos"></textarea>
          <div class="mt-2 flex items-center gap-2">
            <input id="autoMode" type="checkbox" [(ngModel)]="autoMode" name="autoMode" class="accent-indigo-500" />
            <label for="autoMode" class="text-sm text-gray-300">Generar recomendaciones automáticamente</label>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <button (click)="generateRecommendations()" [disabled]="textLoading || !imgFile" class="btn btn-primary w-full sm:w-auto">
              {{ textLoading ? 'Generando...' : 'Generar recomendaciones con IA' }}
            </button>
            <button (click)="clearImage()" class="btn btn-muted w-full sm:w-auto">Limpiar</button>
          </div>
        </div>
      </div>


      <div class="mt-4" *ngIf="recommendations">
        <h3 class="barber-title text-xl font-semibold mb-2">Recomendaciones IA</h3>
        <div class="grid gap-3">
          <div class="bg-neutral-900 border border-neutral-700 border-l-4 border-l-indigo-500 rounded p-4 shadow-sm">
            <div class="text-sm text-indigo-400 font-semibold mb-1 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              Opciones recomendadas
            </div>
            <ul class="pl-1 text-sm text-gray-100">
              <li *ngFor="let opt of optionsList" class="flex items-start gap-2 py-0.5">
                <svg class="w-5 h-5 mt-0.5 text-indigo-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12l5 5L19 7"></path>
                </svg>
                <span>{{ opt }}</span>
              </li>
            </ul>
          </div>
          <div class="bg-neutral-900 border border-neutral-700 border-l-4 border-l-indigo-500 rounded p-4 shadow-sm" *ngIf="maintenanceText">
            <div class="text-sm text-indigo-400 font-semibold mb-1 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="6" y="4" width="12" height="16" rx="2"></rect>
                <path d="M9 4h6v2H9z"></path>
              </svg>
              Mantenimiento
            </div>
            <p class="text-sm text-gray-100">{{ maintenanceText }}</p>
          </div>
          <div class="bg-neutral-900 border border-red-500/30 border-l-4 border-l-red-500 rounded p-4 shadow-sm" *ngIf="avoidText">
            <div class="text-sm text-red-500 font-semibold mb-1 flex items-center gap-2">
              <svg class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3l9 16H3l9-16z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
              No recomendado
            </div>
            <p class="text-sm text-gray-100">{{ avoidText }}</p>
          </div>
        </div>
      </div>

      <div class="mt-4" *ngIf="errorMsg">
         <div class="text-red-400 text-sm">{{ errorMsg }}</div>
       </div>
      <div class="mt-2" *ngIf="textErrorMsg">
         <div class="text-red-400 text-sm">{{ textErrorMsg }}</div>
       </div>
    </div>
  `
})
export class AiPageComponent implements OnInit, OnDestroy {
  notes = '';
  imgFile: File | null = null;
  imgPreview: string | null = null;
  resultImgUrl: string | null = null;
  loading = false;
  errorMsg = '';
  recommendations: string | null = null;
  optionsList: string[] = [];
  maintenanceText: string = '';
  avoidText: string = '';
  textLoading = false;
  textErrorMsg = '';
  cameraOn = false;
  // Nuevo: preferencias de estilo y fuerza del cambio
  styleChoice: string | null = ''; // Auto por defecto
  strength: number = 90; // Cambios más notorios por defecto
  autoMode = true; // Generación automática activada
  comparisonImgUrl: string | null = null;
  private mediaStream: MediaStream | null = null;
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('snapshotCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private ai: AiService) {}

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imgFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => { this.imgPreview = reader.result as string; };
      reader.readAsDataURL(this.imgFile);
      this.errorMsg = '';
      this.resultImgUrl = null;
      if (this.autoMode) {
        // Genera automáticamente recomendaciones basadas en la foto
        this.generateRecommendations();
      }
    }
  }

  selectedFacing: 'user' | 'environment' = 'user';
  selectedDeviceId: string | null = null
  devices: MediaDeviceInfo[] = []
  torchAvailable = false
  torchOn = false
  lightLevel = 0
  lightHint = 'baja'
  lightAdvice = ''
  private meterInterval: any
  countdown = 0
  countingDown = false

  private loadSavedPreferences() {
    const facing = localStorage.getItem('ai_selectedFacing')
    if (facing === 'user' || facing === 'environment') {
      this.selectedFacing = facing
    }
    const deviceId = localStorage.getItem('ai_selectedDeviceId')
    if (deviceId) this.selectedDeviceId = deviceId
  }

  onFacingChange() {
    localStorage.setItem('ai_selectedFacing', this.selectedFacing)
    if (this.cameraOn) { this.stopCamera(); this.startCamera(); }
  }

  async refreshDevices() {
    try {
      const list = await navigator.mediaDevices.enumerateDevices()
      this.devices = list.filter(d => d.kind === 'videoinput')
      if (this.selectedDeviceId && !this.devices.some(d => d.deviceId === this.selectedDeviceId)) {
        this.selectedDeviceId = null
        localStorage.removeItem('ai_selectedDeviceId')
      }
    } catch {}
  }

  onDeviceChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value || null
    this.selectedDeviceId = id
    if (id) localStorage.setItem('ai_selectedDeviceId', id)
    else localStorage.removeItem('ai_selectedDeviceId')
    if (this.cameraOn) { this.stopCamera(); this.startCamera(); }
  }

  async startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.errorMsg = 'Tu dispositivo/navegador no permite usar la cámara.'
        return
      }
      const base = this.selectedDeviceId
        ? { deviceId: { exact: this.selectedDeviceId } }
        : { facingMode: this.selectedFacing }
      const constraints: MediaStreamConstraints = { video: { ...base, width: { ideal: 1280 }, height: { ideal: 720 } } }
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (e) {
        if (this.selectedDeviceId) {
          const fallback: MediaStreamConstraints = { video: { facingMode: this.selectedFacing } }
          this.mediaStream = await navigator.mediaDevices.getUserMedia(fallback)
        } else {
          throw e
        }
      }
      this.cameraOn = true
      await this.waitForVideoElementAttach()
      const track = this.mediaStream.getVideoTracks()[0]
      const caps: any = track.getCapabilities ? track.getCapabilities() : null
      this.torchAvailable = !!(caps && 'torch' in caps && caps.torch)
      this.torchOn = false
      await this.refreshDevices()
    } catch (err) {
      this.errorMsg = 'No se pudo iniciar la cámara.'
      this.cameraOn = false
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
    }
    this.mediaStream = null;
    this.cameraOn = false;
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.srcObject = null;
    }

  }

  switchFacing() {
    this.selectedFacing = this.selectedFacing === 'user' ? 'environment' : 'user'
    this.onFacingChange()
  }

  private startLightMeter() {
    this.stopLightMeter()
    this.meterInterval = setInterval(() => {
      try {
        const video = this.videoRef?.nativeElement
        const canvas = this.canvasRef?.nativeElement
        if (!video || !canvas || !video.videoWidth || !video.videoHeight) return
        const w = 160
        const h = Math.max(90, Math.floor((video.videoHeight / video.videoWidth) * w))
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(video, 0, 0, w, h)
        const data = ctx.getImageData(0, 0, w, h).data
        let sum = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2]
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
          sum += lum
        }
        const avg = sum / (data.length / 4)
        const pct = Math.max(0, Math.min(100, Math.round((avg / 255) * 100)))
        this.lightLevel = pct
        this.lightHint = pct < 35 ? 'baja' : pct < 70 ? 'media' : 'alta'
        this.lightAdvice = pct < 35
          ? 'Acércate a una luz suave; evita sombras duras.'
          : pct < 70
            ? 'Iluminación correcta; mantén la cámara estable.'
            : 'Evita contraluz directo; si hay brillos, cambia el ángulo.'
      } catch {}
    }, 300)
  }

  private stopLightMeter() {
    if (this.meterInterval) {
      clearInterval(this.meterInterval);
      this.meterInterval = null;
    }
    this.lightLevel = 0;
    this.lightHint = 'baja';
  }

  async takeSnapshot() {
    try {
      const video = this.videoRef?.nativeElement;
      const canvas = this.canvasRef?.nativeElement;
      if (!video || !canvas) {
        this.errorMsg = 'No se pudo capturar la foto.';
        return;
      }
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { this.errorMsg = 'No se pudo preparar el lienzo.'; return; }
      ctx.drawImage(video, 0, 0, w, h);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Captura fallida')), 'image/png', 0.95);
      });
      const file = new File([blob], 'captura.png', { type: 'image/png' });
      this.imgFile = file;
      this.imgPreview = URL.createObjectURL(blob);
      this.errorMsg = '';
    } catch (e) {
      this.errorMsg = 'No se pudo tomar la foto.';
    } finally {
      this.stopCamera();
      if (this.autoMode && this.imgFile) {
        this.generateRecommendations();
      }
    }
  }

  async generateImage() {
    if (!this.imgFile) { this.errorMsg = 'Selecciona una foto primero.'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.resultImgUrl = null;
    try {
      const blob: Blob = await firstValueFrom(this.ai.editHair(
        this.imgFile,
        this.notes || undefined,
        this.styleChoice || undefined,
        this.strength
      ));
      const url = URL.createObjectURL(blob);
      this.resultImgUrl = url;
    } catch (e: any) {
      let msg = 'No se pudo generar la imagen. Intenta nuevamente.';
      try {
        if (e?.status === 0) {
          msg = 'No se pudo conectar con el servidor (¿backend detenido o puerto incorrecto?).';
        } else if (e?.error) {
          if (e.error instanceof Blob) {
            const text = await e.error.text();
            if (text && text.trim()) msg = text.trim();
          } else if (typeof e.error === 'string') {
            msg = e.error;
          } else if (typeof e.error?.message === 'string') {
            msg = e.error.message;
          }
        } else if (typeof e?.message === 'string') {
          msg = e.message;
        }
      } catch {}
      this.errorMsg = msg;
    } finally {
      this.loading = false;
    }
  }

  async compareWithBald() {
    if (!this.imgFile) { this.errorMsg = 'Selecciona una foto primero.'; return; }
    this.loading = true;
    this.errorMsg = '';
    this.resultImgUrl = null;
    this.comparisonImgUrl = null;
    try {
      const baldBlob: Blob = await firstValueFrom(this.ai.editHair(
        this.imgFile,
        this.notes || undefined,
        'Calvo (afeitado total)',
        90
      ));
      const styledBlob: Blob = await firstValueFrom(this.ai.editHair(
        this.imgFile,
        this.notes || undefined,
        this.styleChoice || undefined,
        this.strength
      ));
      this.comparisonImgUrl = URL.createObjectURL(baldBlob);
      this.resultImgUrl = URL.createObjectURL(styledBlob);
    } catch (e: any) {
      let msg = 'No se pudo generar la comparación.';
      try {
        if (e?.status === 0) {
          msg = 'No se pudo conectar con el servidor (¿backend detenido o puerto incorrecto?).';
        }
      } catch {}
      this.errorMsg = msg;
    } finally {
      this.loading = false;
    }
  }

  generateRecommendations() {
    if (!this.imgFile) { this.textErrorMsg = 'Selecciona una foto primero.'; return; }
    this.textLoading = true;
    this.recommendations = null;
    this.textErrorMsg = '';
    firstValueFrom(this.ai.recommendFromPhoto(this.imgFile, this.notes || undefined)).then(res => {
      this.recommendations = res.reply || '';
      this.parseRecommendations(this.recommendations);
    }).catch(async (e: any) => {
      let msg = 'No se pudo generar recomendaciones.';
      try {
        if (e?.status === 0) {
          msg = 'No se pudo conectar con el servidor (¿backend detenido o puerto incorrecto?).';
        } else if (e?.error) {
          if (e.error instanceof Blob) {
            const text = await e.error.text();
            if (text && text.trim()) msg = text.trim();
          } else if (typeof e.error === 'string') {
            msg = e.error;
          } else if (typeof e.error?.message === 'string') {
            msg = e.error.message;
          }
        } else if (typeof e?.message === 'string') {
          msg = e.message;
        }
      } catch {}
      this.textErrorMsg = msg;
    }).finally(() => {
      this.textLoading = false;
    });
  }

  clearImage() {
    this.imgFile = null;
    this.imgPreview = null;
    this.resultImgUrl = null;
    this.errorMsg = '';
    this.notes = '';
  }

  ngOnInit(): void {
    this.loadSavedPreferences();
    this.refreshDevices();
  }

  ngOnDestroy(): void {
     this.stopCamera();
   }

  private async waitForVideoElementAttach() {
    for (let i = 0; i < 20; i++) {
      const videoEl = this.videoRef?.nativeElement
      if (videoEl && this.mediaStream) {
        try {
          // Adjuntar stream y reproducir
          ;(videoEl as any).srcObject = this.mediaStream
          await videoEl.play().catch(() => {})
          return
        } catch {}
      }
      await new Promise(r => setTimeout(r, 50))
    }
  }

  private parseRecommendations(reply: string) {
    this.optionsList = [];
    this.maintenanceText = '';
    this.avoidText = '';
    const lines = (reply || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith('opciones:')) {
        continue;
      }
      if (/^\d+\)\s*/.test(line)) {
        // "1) texto" -> extrae después de "n)"
        const opt = line.replace(/^\d+\)\s*/, '');
        if (opt) this.optionsList.push(opt);
        continue;
      }
      if (lower.startsWith('mantenimiento:')) {
        this.maintenanceText = line.substring('Mantenimiento:'.length).trim();
        continue;
      }
      if (lower.startsWith('evita:')) {
        this.avoidText = line.substring('Evita:'.length).trim();
        continue;
      }
    }
    // Si no se detectaron opciones, usa todo el texto como una única opción
    if (this.optionsList.length === 0 && reply) {
      this.optionsList = [reply];
    }
  }

  toggleTorch() {
    try {
      const track = this.mediaStream?.getVideoTracks()[0]
      const caps: any = track && (track as any).getCapabilities ? (track as any).getCapabilities() : null
      if (!track || !caps || !('torch' in caps)) {
        this.errorMsg = 'Tu dispositivo no soporta linterna.'
        return
      }
      const target = !this.torchOn
      ;(track as any).applyConstraints({ advanced: [{ torch: target }] }).then(() => {
        this.torchOn = target
        this.errorMsg = ''
      }).catch(() => {
        this.errorMsg = 'No se pudo alternar la linterna.'
      })
    } catch {
      this.errorMsg = 'Error al alternar la linterna.'
    }
  }

  async takeSnapshotWithCountdown() {
    this.countingDown = true
    for (let i = 3; i > 0; i--) {
      this.countdown = i
      await new Promise(r => setTimeout(r, 1000))
    }
    this.countingDown = false
    this.countdown = 0
    await this.takeSnapshot()
  }
}