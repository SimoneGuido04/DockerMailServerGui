export const environment = {
  production: true,
  apiBaseUrl: '/api',
  oidc: {
    issuer: 'https://auth2.bitebuddy.it',
    clientId: 'CONFIGURE_ME',          // Replace with your Zitadel client ID
    redirectUri: `${window.location.origin}/callback`,
    postLogoutRedirectUri: window.location.origin,
    scope: 'openid profile email',
    requiredGroup: 'obsidian-mail-admins',
  }
};
