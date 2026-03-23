import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ServerSetting } from '../../core/models';

interface SettingGroup {
  title: string;
  icon: string;
  keys: string[];
}

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly settings = signal<ServerSetting[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal<string | null>(null); // key being saved
  readonly saved = signal<string | null>(null);  // key just saved

  readonly groups: SettingGroup[] = [
    { title: 'SMTP',      icon: 'send',          keys: ['POSTFIX_INET_PROTOCOLS', 'SMTP_ONLY', 'ENABLE_SMTP_AUTH'] },
    { title: 'Security',  icon: 'security',      keys: ['ENABLE_FAIL2BAN', 'SPOOF_PROTECTION', 'ENABLE_SRS'] },
    { title: 'Spam',      icon: 'block',         keys: ['ENABLE_RSPAMD', 'ENABLE_RSPAMD_REDIS', 'RSPAMD_GREYLISTING'] },
    { title: 'TLS / SSL', icon: 'lock',          keys: ['SSL_TYPE', 'TLS_LEVEL'] },
    { title: 'DKIM',      icon: 'verified',      keys: ['ENABLE_OPENDKIM', 'ENABLE_OPENDMARC', 'ENABLE_POLICYD_SPF'] },
    { title: 'Quotas',    icon: 'storage',       keys: ['ENABLE_QUOTAS', 'POSTFIX_MAILBOX_SIZE_LIMIT'] },
  ];

  ngOnInit(): void {
    this.api.getSettings().subscribe({
      next: (s) => { this.settings.set(s); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getSetting(key: string): ServerSetting | undefined {
    return this.settings().find(s => s.key === key);
  }

  getSettingValue(key: string): string {
    return this.getSetting(key)?.value ?? '';
  }

  updateSetting(key: string, value: string): void {
    this.saving.set(key);
    this.api.updateSetting(key, value).subscribe({
      next: () => {
        this.saving.set(null);
        this.saved.set(key);
        this.settings.update(list =>
          list.map(s => s.key === key ? { ...s, value } : s)
        );
        setTimeout(() => this.saved.set(null), 2000);
      },
      error: () => this.saving.set(null)
    });
  }
}
