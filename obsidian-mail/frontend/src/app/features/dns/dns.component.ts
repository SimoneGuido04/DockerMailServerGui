import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { DnsRecord, AuthStatus } from '../../core/models';

@Component({
  selector: 'app-dns',
  templateUrl: './dns.component.html',
})
export class DnsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly records = signal<DnsRecord[]>([]);
  readonly authStatus = signal<AuthStatus | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly copiedKey = signal<string | null>(null);

  ngOnInit(): void {
    this.api.getDnsRecords().subscribe({
      next: r => { this.records.set(r); this.loading.set(false); },
      error: err => { this.error.set(err.message ?? 'Failed to load DNS records'); this.loading.set(false); },
    });
    this.api.getAuthStatus().subscribe({ next: s => this.authStatus.set(s) });
  }

  copyToClipboard(text: string, key: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedKey.set(key);
      setTimeout(() => this.copiedKey.set(null), 2000);
    });
  }

  statusColor(status: DnsRecord['status']): string {
    const map: Record<string, string> = {
      ok: 'text-secondary',
      warning: 'text-yellow-400',
      error: 'text-tertiary',
    };
    return map[status] ?? 'text-on-surface-variant';
  }

  statusBg(status: DnsRecord['status']): string {
    const map: Record<string, string> = {
      ok: 'bg-secondary/10 text-secondary',
      warning: 'bg-yellow-400/10 text-yellow-400',
      error: 'bg-tertiary/10 text-tertiary',
    };
    return map[status] ?? 'bg-white/5 text-on-surface-variant';
  }

  spfColor(spf: string): string {
    return spf === 'PASS' ? 'text-secondary' : spf === 'FAIL' ? 'text-tertiary' : 'text-yellow-400';
  }

  dmarcColor(policy: string): string {
    return policy === 'reject' ? 'text-secondary' : policy === 'quarantine' ? 'text-yellow-400' : 'text-tertiary';
  }
}
