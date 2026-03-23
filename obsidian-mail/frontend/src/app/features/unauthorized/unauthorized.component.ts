import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center px-6">
      <div class="glass-card rounded-xl p-10 max-w-md w-full text-center space-y-6">
        <span class="material-symbols-outlined text-5xl text-tertiary block"
              style="font-variation-settings:'FILL' 1">gpp_bad</span>
        <div class="space-y-2">
          <h1 class="text-2xl font-bold font-headline text-on-surface">Access Denied</h1>
          <p class="text-sm text-on-surface-variant font-mono">
            Your account does not have the required group membership
            to access Obsidian Mail.
          </p>
        </div>
        <button (click)="auth.logout()"
                class="w-full bg-primary-container text-on-primary-container py-3 rounded-xl
                       font-bold text-sm hover:brightness-110 transition-all">
          Sign Out
        </button>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {
  protected readonly auth = inject(AuthService);
}
