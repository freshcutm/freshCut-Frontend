import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
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
