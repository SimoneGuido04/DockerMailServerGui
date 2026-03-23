import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center">
      <div class="flex flex-col items-center gap-4 text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl text-primary animate-spin">autorenew</span>
        <p class="font-mono text-sm uppercase tracking-widest">Authenticating…</p>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private readonly oauthService = inject(OAuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    await this.router.navigate(['/dashboard']);
  }
}
