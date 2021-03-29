const defaultMockUser = {
  displayName: 'Trine Testesen',
  givenName: 'Trine',
  name: 'Trine Testesen',
  onPremisesSamAccountName: 'tri0308',
  surname: 'Testesen',
  tenantId: '08f3813c-9f29-482f-9aec-16ef7cbf477a',
  userPrincipalName: 'trine.testesen@vtfk.no',
  username: 'trine.testesen@vtfk.no'
}

export default {
  auth: {
    clientId: process.env.AUTH_CLIENT_ID,
    authority: process.env.AUTH_AUTHORITY,
    redirectUri: process.env.AUTH_REDIRECT_URL,
    postLogoutRedirectUri: process.env.AUTH_POST_LOGOUT_URL || 'https://vtfk.no'
  },
  cache: {
    cacheLocation: process.env.AUTH_CACHE_LOCATION || 'sessionStorage',
    storeAuthStateInCookie: process.env.AUTH_STATE_IN_COOKIE === 'true' || false
  },
  userInfoUrl: process.env.AUTH_USER_INFO_URL || 'https://graph.microsoft.com/v1.0/me?$select=userPrincipalName,onPremisesSamaccountName,givenName,surname,displayName',
  isMock: (process.env.AUTH_IS_MOCK && process.env.AUTH_IS_MOCK === 'true') || (process.env.REACT_APP_IS_MOCK && process.env.REACT_APP_IS_MOCK === 'true') || false,
  mockUser: process.env.AUTH_MOCK_USER ? JSON.parse(process.env.AUTH_MOCK_USER) : defaultMockUser
}
