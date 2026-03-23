export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  oidc: {
    issuer: 'https://auth2.bitebuddy.it',
    clientId: 'CONFIGURE_ME',          // Replace with your Zitadel client ID
    redirectUri: 'http://localhost:4200/callback',
    postLogoutRedirectUri: 'http://localhost:4200',
    scope: 'openid profile email',
    requiredGroup: 'obsidian-mail-admins', // Zitadel role/group required for access
  }
};
