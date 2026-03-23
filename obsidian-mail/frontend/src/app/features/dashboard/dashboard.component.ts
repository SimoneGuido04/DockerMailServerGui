import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ServerStats, QueueMessage, ServiceStatus } from '../../core/models';

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

  get services(): ServiceStatus[] {
    return this.stats()?.services ?? [];
  }

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
