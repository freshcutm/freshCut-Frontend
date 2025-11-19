import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';
import { ToastContainerComponent } from './ui/toast-container.component';
import { ConfirmDialogComponent } from './ui/confirm-dialog.component';
import { NavigationControlService } from './core/navigation-control.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  isLoginRoute = false;
  isRegisterRoute = false;
  constructor(public auth: AuthService, private router: Router, private navCtrl: NavigationControlService) {}
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.me();
    }
    this.navCtrl.init();
    this.updateRouteFlags(this.router.url);
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) this.updateRouteFlags(e.urlAfterRedirects);
    });
  }
  logout() { this.auth.logout(); }
  private updateRouteFlags(url: string) {
    this.isLoginRoute = url.startsWith('/auth/login');
    this.isRegisterRoute = url.startsWith('/auth/register');
  }
}
