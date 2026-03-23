import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly sidebarOpen = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',        route: '/dashboard' },
    { label: 'Mailboxes',  icon: 'mail',              route: '/mailboxes' },
    { label: 'Settings',   icon: 'settings',          route: '/settings' },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
