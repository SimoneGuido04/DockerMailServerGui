import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);

  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const accToken = oauthService.getAccessToken();

  if (accToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accToken}`,
      }
    });
    return next(authReq);
  }

  return next(req);
};
