import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'mailboxes',
        loadComponent: () => import('./features/mailboxes/mailboxes.component').then(m => m.MailboxesComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'dns',
        loadComponent: () => import('./features/dns/dns.component').then(m => m.DnsComponent),
      },
      {
        path: 'security',
        loadComponent: () => import('./features/security/security.component').then(m => m.SecurityComponent),
      },
      {
        path: 'certificates',
        loadComponent: () => import('./features/certificates/certificates.component').then(m => m.CertificatesComponent),
      },
      {
        path: 'logs',
        loadComponent: () => import('./features/logs/logs.component').then(m => m.LogsComponent),
      },
    ]
  },
  {
    path: 'callback',
    loadComponent: () => import('./features/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
  },
  { path: '**', redirectTo: '' }
];
