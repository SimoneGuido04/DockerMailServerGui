import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ServerStats, QueueMessage } from '../../core/models';

interface ServiceStatus {
  name: string;
  subtitle: string;
  icon: string;
  status: 'running' | 'stopped' | 'active' | 'inactive';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly stats = signal<ServerStats | null>(null);
  readonly queue = signal<QueueMessage[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly services: ServiceStatus[] = [
    { name: 'Postfix',  subtitle: 'MTA Engine',      icon: 'send',       status: 'running' },
    { name: 'Dovecot',  subtitle: 'IMAP/POP3',        icon: 'inbox',      status: 'running' },
    { name: 'Rspamd',   subtitle: 'Spam Filter',      icon: 'security',   status: 'running' },
    { name: 'ClamAV',   subtitle: 'Antivirus',        icon: 'coronavirus',status: 'running' },
    { name: 'Fail2ban', subtitle: 'IP Ban Manager',   icon: 'block',      status: 'active'  },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getServerStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load server stats');
        this.loading.set(false);
      }
    });

    this.api.getQueue().subscribe({
      next: (q) => this.queue.set(q),
    });
  }

  statusColor(status: ServiceStatus['status']): string {
    return status === 'running' || status === 'active' ? 'secondary' : 'tertiary';
  }

  statusLabel(status: ServiceStatus['status']): string {
    const labels: Record<ServiceStatus['status'], string> = {
      running: 'Running', stopped: 'Stopped', active: 'Active', inactive: 'Inactive'
    };
    return labels[status];
  }

  min(value: number, max: number): number {
    return Math.min(value, max);
  }
}
