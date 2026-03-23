import { Component, inject, signal, computed, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaletteAction } from '../../core/models';

@Component({
  selector: 'app-command-palette',
  imports: [FormsModule],
  templateUrl: './command-palette.component.html',
})
export class CommandPaletteComponent implements OnInit {
  private readonly router = inject(Router);

  @Output() closed = new EventEmitter<void>();

  readonly query = signal('');
  readonly selectedIndex = signal(0);

  private readonly allActions: PaletteAction[] = [
    { id: 'dashboard', label: 'Go to Dashboard', description: 'Main server overview', icon: 'dashboard', route: '/dashboard' },
    { id: 'mailboxes', label: 'Go to Mailboxes', description: 'Manage email accounts', icon: 'mail', route: '/mailboxes' },
    { id: 'dns', label: 'Go to DNS & Deliverability', description: 'SPF, DKIM, DMARC records', icon: 'dns', route: '/dns' },
    { id: 'security', label: 'Go to Fortress Security', description: 'Rspamd, ClamAV, Fail2Ban', icon: 'security', route: '/security' },
    { id: 'certificates', label: 'Go to SSL/TLS Certificates', description: 'Certificate lifecycle', icon: 'workspace_premium', route: '/certificates' },
    { id: 'logs', label: 'Go to System Logs', description: 'Live log streaming', icon: 'receipt_long', route: '/logs' },
    { id: 'settings', label: 'Go to Settings', description: 'Server configuration', icon: 'settings', route: '/settings' },
    { id: 'new-mailbox', label: 'Create New Mailbox', description: 'Add a new email account', icon: 'person_add', iconColor: 'text-secondary', route: '/mailboxes' },
    { id: 'request-cert', label: 'Request Certificate', description: 'Request a new Let\'s Encrypt certificate', icon: 'add_card', iconColor: 'text-primary', route: '/certificates' },
    { id: 'view-logs', label: 'View Live Logs', description: 'Open live log stream', icon: 'stream', iconColor: 'text-tertiary', route: '/logs' },
  ];

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.allActions;
    return this.allActions.filter(a =>
      a.label.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.selectedIndex.set(0);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex.update(i => Math.min(i + 1, this.filtered().length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      const action = this.filtered()[this.selectedIndex()];
      if (action) this.execute(action);
    }
  }

  onQueryChange(): void {
    this.selectedIndex.set(0);
  }

  execute(action: PaletteAction): void {
    if (action.route) {
      this.router.navigate([action.route]);
    }
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
