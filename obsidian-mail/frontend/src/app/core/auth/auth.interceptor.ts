import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const idToken = oauthService.getIdToken();
  const accToken = oauthService.getAccessToken();

  if (idToken) {
    const headers: Record<string, string> = { Authorization: `Bearer ${idToken}` };
    if (accToken) headers['X-Zitadel-Access-Token'] = accToken;
    return next(req.clone({ setHeaders: headers }));
  }

  return next(req);
};
