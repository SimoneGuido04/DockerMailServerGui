import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { RspamdStats, ClamAvStatus, Fail2BanStatus, SecurityTelemetry, Fail2BanBan } from '../../core/models';

@Component({
  selector: 'app-security',
  imports: [DecimalPipe, SlicePipe],
  templateUrl: './security.component.html',
})
export class SecurityComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly rspamd = signal<RspamdStats | null>(null);
  readonly clamav = signal<ClamAvStatus | null>(null);
  readonly fail2ban = signal<Fail2BanStatus | null>(null);
  readonly telemetry = signal<SecurityTelemetry | null>(null);
  readonly loading = signal(true);
  readonly selectedJail = signal<string>('all');
  readonly unbanning = signal<string | null>(null);
  readonly flushing = signal(false);

  readonly filteredBans = computed<Fail2BanBan[]>(() => {
    const f2b = this.fail2ban();
    if (!f2b) return [];
    const jail = this.selectedJail();
    return jail === 'all' ? f2b.bans : f2b.bans.filter(b => b.jail === jail);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.api.getRspamdStats().subscribe({ next: r => { this.rspamd.set(r); this.loading.set(false); }, error: () => this.loading.set(false) });
    this.api.getClamAvStatus().subscribe({ next: c => this.clamav.set(c) });
    this.api.getFail2BanStatus().subscribe({ next: f => { this.fail2ban.set(f); if (f.jails.length) this.selectedJail.set('all'); } });
    this.api.getSecurityTelemetry().subscribe({ next: t => this.telemetry.set(t) });
  }

  unban(ban: Fail2BanBan): void {
    this.unbanning.set(ban.ip);
    this.api.unbanIp(ban.jail, ban.ip).subscribe({
      next: () => { this.unbanning.set(null); this.loadData(); },
      error: () => this.unbanning.set(null),
    });
  }

  flushBans(): void {
    this.flushing.set(true);
    this.api.flushBans().subscribe({
      next: () => { this.flushing.set(false); this.loadData(); },
      error: () => this.flushing.set(false),
    });
  }

  barWidth(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  threatStatusColor(status: string): string {
    const map: Record<string, string> = {
      QUARANTINED: 'bg-yellow-400/10 text-yellow-400',
      DELETED: 'bg-tertiary/10 text-tertiary',
      DETECTED: 'bg-tertiary/10 text-tertiary',
    };
    return map[status] ?? 'bg-white/5 text-on-surface-variant';
  }
}
