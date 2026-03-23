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
