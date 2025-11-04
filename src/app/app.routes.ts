import { Routes } from '@angular/router';
import { adminGuard, authGuard, barberGuard, userGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent) },
  { path: 'servicios', loadComponent: () => import('./features/catalog/service-catalog.component').then(c => c.ServiceCatalogComponent) },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login.component').then(c => c.LoginComponent) },
  { path: 'auth/forgot', loadComponent: () => import('./features/auth/forgot-password.component').then(c => c.ForgotPasswordComponent) },
  { path: 'auth/reset', loadComponent: () => import('./features/auth/reset-password.component').then(c => c.ResetPasswordComponent) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register.component').then(c => c.RegisterComponent) },
  { path: 'auth/register/admin', loadComponent: () => import('./features/auth/register-admin.component').then(c => c.RegisterAdminComponent) },
  { path: 'auth/register/barbero', loadComponent: () => import('./features/auth/register-barber.component').then(c => c.RegisterBarberComponent) },
  { path: 'cliente', canActivate: [userGuard], loadComponent: () => import('./features/client/client-dashboard.component').then(c => c.ClientDashboardComponent) },
  { path: 'reservas', canActivate: [authGuard], loadComponent: () => import('./features/bookings/booking-list.component').then(c => c.BookingListComponent) },
  { path: 'reservas/nueva', canActivate: [authGuard], loadComponent: () => import('./features/bookings/booking-form.component').then(c => c.BookingFormComponent) },
  { path: 'reservas/editar/:id', canActivate: [authGuard], loadComponent: () => import('./features/bookings/booking-edit.component').then(c => c.BookingEditComponent) },
  { path: 'ia', loadComponent: () => import('./features/ai/ai-page.component').then(c => c.AiPageComponent) },
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-dashboard.component').then(c => c.AdminDashboardComponent) },
  { path: 'admin/panel', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-control.component').then(c => c.AdminControlComponent) },
  { path: 'admin/servicios', canActivate: [adminGuard], loadComponent: () => import('./features/admin/service-list.component').then(c => c.ServiceListComponent) },
  { path: 'admin/servicios/editar/:id', canActivate: [adminGuard], loadComponent: () => import('./features/admin/service-edit.component').then(c => c.ServiceEditComponent) },
  { path: 'admin/barberos', canActivate: [adminGuard], loadComponent: () => import('./features/admin/barber-list.component').then(c => c.BarberListComponent) },
  { path: 'admin/barberos/nuevo', canActivate: [adminGuard], loadComponent: () => import('./features/admin/barber-form.component').then(c => c.BarberFormComponent) },
  { path: 'admin/barberos/editar/:id', canActivate: [adminGuard], loadComponent: () => import('./features/admin/barber-edit.component').then(c => c.BarberEditComponent) },
  { path: 'barbero', canActivate: [barberGuard], loadComponent: () => import('./features/barber/barber-dashboard.component').then(c => c.BarberDashboardComponent) },
  { path: 'perfil', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(c => c.ProfileComponent) },
  { path: '**', redirectTo: 'home' }
];
