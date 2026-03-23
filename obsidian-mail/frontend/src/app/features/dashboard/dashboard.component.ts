import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ServerStats, QueueMessage, ServiceStatus, ThroughputPoint } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly stats = signal<ServerStats | null>(null);
  readonly queue = signal<QueueMessage[]>([]);
  readonly throughput = signal<ThroughputPoint[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly throughputMax = computed(() => {
    const points = this.throughput();
    return Math.max(1, ...points.map(p => Math.max(p.sent, p.received)));
  });

  readonly throughputHasActivity = computed(() =>
    this.throughput().some(p => p.sent > 0 || p.received > 0)
  );

  normalizeHeight(value: number): number {
    const pct = Math.round((value / this.throughputMax()) * 100);
    return pct > 0 ? Math.max(pct, 4) : 0;
  }

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

    this.api.getThroughput().subscribe({
      next: (t) => this.throughput.set(t),
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
