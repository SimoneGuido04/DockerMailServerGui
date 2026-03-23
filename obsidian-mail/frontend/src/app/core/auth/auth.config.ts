import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authConfig: AuthConfig = {
  issuer: environment.oidc.issuer,
  redirectUri: environment.oidc.redirectUri,
  postLogoutRedirectUri: environment.oidc.postLogoutRedirectUri,
  clientId: environment.oidc.clientId,
  responseType: 'code',
  scope: environment.oidc.scope,
  requireHttps: true,
  showDebugInformation: !environment.production,
  strictDiscoveryDocumentValidation: false, // required for Zitadel
  sessionChecksEnabled: false,
  clearHashAfterLogin: true,
  nonceStateSeparator: 'semicolon',
};
