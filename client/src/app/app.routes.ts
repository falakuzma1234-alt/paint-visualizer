import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';
import { adminGuard } from './core/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'studio', pathMatch: 'full' },
  {
    path: 'studio',
    loadComponent: () =>
      import('./pages/studio/studio.component').then(m => m.StudioComponent),
  },
  {
    path: 'studio/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/studio/studio.component').then(m => m.StudioComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./pages/help/help.component').then(m => m.HelpComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin.component').then(m => m.AdminComponent),
  },
  { path: '**', redirectTo: 'studio' },
];