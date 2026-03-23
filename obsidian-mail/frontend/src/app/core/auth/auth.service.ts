import { Injectable, computed, inject, signal } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oauthService = inject(OAuthService);

  readonly isAuthenticated = computed(() => this._authState());
  private readonly _authState = signal(false);
  private readonly _userProfile = signal<Record<string, unknown>>({});

  async init(): Promise<void> {
    const updateState = async () => {
      const valid = this.oauthService.hasValidAccessToken();
      this._authState.set(valid);
      if (valid) {
        try {
          const profile = await this.oauthService.loadUserProfile();
          this._userProfile.set((profile as any).info || profile);
        } catch (e) {
          this._userProfile.set((this.oauthService.getIdentityClaims() as Record<string, unknown>) ?? {});
        }
      } else {
        this._userProfile.set({});
      }
    };

    this.oauthService.events.subscribe(() => {
      updateState();
    });
    await updateState();
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  logout(): void {
    this.oauthService.revokeTokenAndLogout();
  }

  get accessToken(): string {
    return this.oauthService.getAccessToken();
  }

  get userProfile(): Record<string, unknown> {
    return this._userProfile();
  }

  get userEmail(): string {
    return (this.userProfile['email'] as string) ?? '';
  }

  get userName(): string {
    return (this.userProfile['name'] as string) ?? this.userEmail;
  }

  /** Checks if the user has the required group/role in Zitadel claims */
  hasRequiredGroup(): boolean {
    const claims = this.userProfile;
    const requiredGroup = environment.oidc.requiredGroup;

    // Zitadel stores project roles as: { "urn:zitadel:iam:org:project:roles": { "role-name": { "orgId": "..." } } }
    const roles = claims['urn:zitadel:iam:org:project:roles'] as Record<string, unknown> | undefined;
    if (roles && typeof roles === 'object') {
      return requiredGroup in roles;
    }

    // Fallback: check standard `roles` claim array
    const rolesArray = claims['roles'] as string[] | undefined;
    if (Array.isArray(rolesArray)) {
      return rolesArray.includes(requiredGroup);
    }

    return false;
  }
}
