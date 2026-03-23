import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Mailbox, Domain, Alias, CreateMailboxDto } from '../../core/models';

@Component({
  selector: 'app-mailboxes',
  imports: [FormsModule],
  templateUrl: './mailboxes.component.html',
})
export class MailboxesComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly mailboxes = signal<Mailbox[]>([]);
  readonly domains = signal<Domain[]>([]);
  readonly aliases = signal<Alias[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'mailboxes' | 'aliases'>('mailboxes');

  // Create mailbox form
  readonly showCreateForm = signal(false);
  readonly newEmail = signal('');
  readonly newPassword = signal('');
  readonly newQuota = signal('');
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);

  // Search
  readonly searchQuery = signal('');

  readonly filteredMailboxes = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.mailboxes();
    return this.mailboxes().filter(m => m.email.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.api.getMailboxes().subscribe({
      next: (mb) => { this.mailboxes.set(mb); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
    this.api.getDomains().subscribe({ next: (d) => this.domains.set(d) });
    this.api.getAliases().subscribe({ next: (a) => this.aliases.set(a) });
  }

  createMailbox(): void {
    const email = this.newEmail().trim();
    const password = this.newPassword().trim();
    if (!email || !password) return;

    this.creating.set(true);
    this.createError.set(null);

    const dto: CreateMailboxDto = { email, password, quota: this.newQuota() || undefined };
    this.api.createMailbox(dto).subscribe({
      next: () => {
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.newEmail.set('');
        this.newPassword.set('');
        this.newQuota.set('');
        this.loadAll();
      },
      error: (err) => {
        this.creating.set(false);
        this.createError.set(err.error?.message ?? err.message);
      }
    });
  }

  deleteMailbox(email: string): void {
    if (!confirm(`Delete mailbox ${email}? This cannot be undone.`)) return;
    this.api.deleteMailbox(email).subscribe({ next: () => this.loadAll() });
  }

  deleteAlias(alias: string): void {
    if (!confirm(`Delete alias ${alias}?`)) return;
    this.api.deleteAlias(alias).subscribe({ next: () => this.loadAll() });
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    this.newEmail.set('');
    this.newPassword.set('');
    this.newQuota.set('');
    this.createError.set(null);
  }
}
