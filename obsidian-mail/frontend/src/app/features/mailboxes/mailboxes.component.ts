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

  // Create alias form
  readonly showCreateAliasForm = signal(false);
  readonly newAliasAddress = signal('');
  readonly newAliasDestination = signal('');
  readonly creatingAlias = signal(false);
  readonly createAliasError = signal<string | null>(null);

  // Search
  readonly searchQuery = signal('');

  readonly filteredMailboxes = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.mailboxes();
    return this.mailboxes().filter(m => m.email.toLowerCase().includes(q));
  });

  readonly filteredAliases = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.aliases();
    return this.aliases().filter(a =>
      a.alias.toLowerCase().includes(q) || a.destination.toLowerCase().includes(q)
    );
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

  createAlias(): void {
    const alias = this.newAliasAddress().trim();
    const destination = this.newAliasDestination().trim();
    if (!alias || !destination) return;

    this.creatingAlias.set(true);
    this.createAliasError.set(null);

    this.api.createAlias(alias, destination).subscribe({
      next: () => {
        this.creatingAlias.set(false);
        this.showCreateAliasForm.set(false);
        this.newAliasAddress.set('');
        this.newAliasDestination.set('');
        this.loadAll();
      },
      error: (err) => {
        this.creatingAlias.set(false);
        this.createAliasError.set(err.error?.message ?? err.message);
      }
    });
  }

  deleteMailbox(email: string): void {
    if (!confirm(`Delete mailbox ${email}? This cannot be undone.`)) return;
    this.api.deleteMailbox(email).subscribe({ next: () => this.loadAll() });
  }

  deleteAlias(alias: string, destination: string): void {
    if (!confirm(`Delete alias ${alias} → ${destination}?`)) return;
    this.api.deleteAlias(alias).subscribe({ next: () => this.loadAll() });
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    this.newEmail.set('');
    this.newPassword.set('');
    this.newQuota.set('');
    this.createError.set(null);
  }

  cancelCreateAlias(): void {
    this.showCreateAliasForm.set(false);
    this.newAliasAddress.set('');
    this.newAliasDestination.set('');
    this.createAliasError.set(null);
  }
}
