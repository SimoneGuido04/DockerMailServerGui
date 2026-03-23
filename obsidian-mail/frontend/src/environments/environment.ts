export const environment = {
  production: false,
  apiBaseUrl: window.location.origin.includes('4200') ? 'http://localhost:3000/api' : '/api',
  oidc: {
    issuer: 'https://auth2.bitebuddy.it',
    clientId: (window as any).__env?.clientId || 'INSERISCI_QUI_IL_TUO_CLIENT_ID',
    redirectUri: `${window.location.origin}/callback`,
    postLogoutRedirectUri: window.location.origin,
    scope: 'openid profile email urn:zitadel:iam:org:projects:roles urn:zitadel:iam:org:project:id:zitadel:aud',
    requiredGroup: (window as any).__env?.requiredGroup || 'obsidian-mail-admins', // Zitadel role/group required for access
  }
};
