import { Component, OnInit, inject, signal } from '@angular/core';
import { SlicePipe, TitleCasePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { CertificateInfo, LetsEncryptStatus, DaneStatus, CertSummary } from '../../core/models';

@Component({
  selector: 'app-certificates',
  imports: [SlicePipe, TitleCasePipe],
  templateUrl: './certificates.component.html',
})
export class CertificatesComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly certificates = signal<CertificateInfo[]>([]);
  readonly leStatus = signal<LetsEncryptStatus | null>(null);
  readonly daneStatus = signal<DaneStatus | null>(null);
  readonly summary = signal<CertSummary | null>(null);
  readonly loading = signal(true);
  readonly requesting = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getCertificateList().subscribe({
      next: certs => { this.certificates.set(certs); this.loading.set(false); },
      error: err => { this.error.set(err.message ?? 'Failed to load certificates'); this.loading.set(false); },
    });

    this.api.getLetsEncryptStatus().subscribe({ next: s => this.leStatus.set(s) });
    this.api.getDaneStatus().subscribe({ next: d => this.daneStatus.set(d) });
    this.api.getCertSummary().subscribe({ next: s => this.summary.set(s) });
  }

  requestCert(): void {
    this.requesting.set(true);
    this.api.requestCertificate().subscribe({
      next: () => { this.requesting.set(false); this.loadData(); },
      error: () => this.requesting.set(false),
    });
  }

  statusColor(status: CertificateInfo['status']): string {
    const map: Record<string, string> = {
      valid: 'text-secondary',
      expiring: 'text-yellow-400',
      expired: 'text-tertiary',
      renewing: 'text-primary',
    };
    return map[status] ?? 'text-on-surface-variant';
  }

  statusBg(status: CertificateInfo['status']): string {
    const map: Record<string, string> = {
      valid: 'bg-secondary/10 text-secondary',
      expiring: 'bg-yellow-400/10 text-yellow-400',
      expired: 'bg-tertiary/10 text-tertiary',
      renewing: 'bg-primary/10 text-primary',
    };
    return map[status] ?? 'bg-white/5 text-on-surface-variant';
  }

  daysLabel(days: number): string {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    return `${days}d`;
  }
}
