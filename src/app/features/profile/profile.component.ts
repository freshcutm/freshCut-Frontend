import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Profile, ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 class="text-2xl font-semibold mb-4">Mi perfil</h2>

      <div class="flex flex-wrap items-center gap-4 mb-6">
        <img [src]="avatarSrc" (error)="onAvatarError()" alt="avatar" class="w-20 h-20 rounded-full object-cover border" />
        <div>
          <div class="text-sm text-gray-600">{{ profile?.email }}</div>
          <div class="text-xs text-gray-500">Rol: {{ profile?.role }}</div>
        </div>
      </div>

      <form (ngSubmit)="save()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Nombre</label>
          <input [(ngModel)]="name" name="name" class="w-full border rounded px-3 py-2" placeholder="Tu nombre" />
        </div>

        <div>
          <label class="block text-sm font-medium">Foto de perfil</label>
          <input type="file" (change)="onFileSelected($event)" accept="image/*" />
          <div *ngIf="avatarPreview" class="mt-2">
            <img [src]="avatarPreview" alt="preview" class="w-24 h-24 rounded object-cover border" />
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button type="submit" class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" [disabled]="loading">Guardar</button>
          <span *ngIf="loading" class="text-sm text-gray-600">Guardando...</span>
        </div>
      </form>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profile?: Profile;
  name: string = '';
  avatarSrc = '';
  // SVG inline como data URL para eliminar dependencia de assets y evitar 404
  private defaultAvatar =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80" role="img" aria-label="Avatar placeholder">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f0f4f8"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="80" height="80" rx="12" fill="url(#bg)"/>
        <circle cx="40" cy="32" r="14" fill="#94a3b8"/>
        <path d="M12 72c0-12 12-22 28-22s28 10 28 22" fill="#cbd5e1"/>
        <circle cx="40" cy="32" r="10" fill="#e2e8f0"/>
        <circle cx="40" cy="32" r="6" fill="#94a3b8"/>
        <title>Avatar placeholder</title>
      </svg>`
    );
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  loading = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.me().subscribe(p => {
      this.profile = p;
      this.name = p.name || '';
      this.avatarSrc = p.avatarUrl || this.defaultAvatar;
    });
  }

  onAvatarError() {
    this.avatarSrc = this.defaultAvatar;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => { this.avatarPreview = reader.result as string; };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  save() {
    this.loading = true;
    const actions: Promise<any>[] = [];
    if (this.name !== (this.profile?.name || '')) {
      actions.push(this.profileService.update({ name: this.name }).toPromise());
    }
    if (this.selectedFile) {
      actions.push(this.profileService.uploadAvatar(this.selectedFile).toPromise());
    }

    Promise.all(actions).then(() => {
      this.profileService.me().subscribe(p => {
        this.profile = p;
        this.avatarSrc = p.avatarUrl || '';
        this.avatarPreview = null;
        this.selectedFile = null;
        this.loading = false;
        alert('Perfil actualizado');
      });
    }).catch(() => {
      this.loading = false;
      alert('No se pudo actualizar el perfil');
    });
  }
}