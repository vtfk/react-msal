export const config = {
  auth: {
    clientId: '58e282d0-b89b-4d06-b188-a3761389c33d',
    authority: 'https://login.microsoftonline.com/08f3813c-9f29-482f-9aec-16ef7cbf477a',
    redirectUri: process.env.AUTH_REDIRECT_URL || 'http://localhost:3000',
    postLogoutRedirectUri: 'https://github.com/vtfk/react-msal'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
}

export const loginRequest = {
  scopes: ['openid', 'profile', 'User.Read'],
  forceRefresh: true
}

export const apiRequest = {
  scopes: ['openid', 'profile', 'User.Read'],
  forceRefresh: false
}
