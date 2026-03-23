import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);

  if (!req.url.includes(environment.apiBaseUrl)) {
    return next(req);
  }

  const idToken = oauthService.getIdToken();
  const accToken = oauthService.getAccessToken();
  
  if (idToken) {
    const authReq = req.clone({
      setHeaders: { 
        Authorization: `Bearer ${idToken}`,
        'X-Zitadel-Access-Token': accToken
      }
    });
    return next(authReq);
  }

  return next(req);
};
