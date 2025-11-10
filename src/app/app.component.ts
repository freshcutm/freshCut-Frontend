import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';
import { ToastContainerComponent } from './ui/toast-container.component';
import { ConfirmDialogComponent } from './ui/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  constructor(public auth: AuthService) {}
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      // Sincroniza email/rol con el token al arrancar
      this.auth.me();
    }
  }
  logout() { this.auth.logout(); }
}
