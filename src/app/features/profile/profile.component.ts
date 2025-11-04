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
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  loading = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.me().subscribe(p => {
      this.profile = p;
      this.name = p.name || '';
      this.avatarSrc = p.avatarUrl || '';
    });
  }

  onAvatarError() {
    this.avatarSrc = 'https://via.placeholder.com/80x80?text=👤';
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