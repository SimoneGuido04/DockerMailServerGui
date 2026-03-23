import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommandPaletteComponent } from '../../features/command-palette/command-palette.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommandPaletteComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly sidebarOpen = signal(false);
  protected readonly paletteOpen = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Mailboxes', icon: 'mail', route: '/mailboxes' },
    { label: 'DNS', icon: 'dns', route: '/dns' },
    { label: 'Security', icon: 'security', route: '/security' },
    { label: 'Certificates', icon: 'workspace_premium', route: '/certificates' },
    { label: 'Logs', icon: 'receipt_long', route: '/logs' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.paletteOpen.update(v => !v);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
