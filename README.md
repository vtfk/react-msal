[![NPM](https://img.shields.io/npm/v/@vtfk/react-msal.svg)](https://www.npmjs.com/package/@vtfk/react-msal) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# @vtfk/react-msal

MSAL (Azure auth) React hook

## Install

```bash
npm install --save @vtfk/react-msal
```

## Usage

config.js

```javascript
export const config = {
  auth: {
    clientId: '<client-id>',
    authority: 'https://login.microsoftonline.com/<tenant-id>',
    redirectUri: '<https://app-hostname.com>',
    postLogoutRedirectUri: '<https://direct-url.com'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
}

// See valid values here: https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_redirectrequest_.html
export const loginRequest = {
  scopes: ['openid', 'profile', 'User.Read']
}
```

index.js

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { MsalProvider } from '@vtfk/react-msal'
import { config, loginRequest } from './config'

ReactDOM.render(
  <React.StrictMode>
    <MsalProvider config={config} scopes={loginRequest}>
      <App />
    </MsalProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
```

App.js

```jsx
const App = () => {
  const { isAuthenticated, login, authStatus } = useSession()

  if (['pending'].includes(authStatus)) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    console.log('app-!isAuth')
    login(loginRequest)
    return <></>
  }

  if (isAuthenticated && authStatus === 'finished') {
    return <div>Hello authenticated user!</div>
  }
}
```

### useSession()

**The useSession() hook has these methods and objects available:**

- `isAuthenticated` (bool)
- `authStatus` (string) - values are: pending, finished, rejected, unknown
- `user` (object) - user object from MS Graph - [example](#user-object)
- `token` (string) - access_token from MS Graph
- `idToken` (string) - id_token from MS Graph
- `popupOpen` (bool) - true if login popup is open
- `loginError` (object) - login error object
- `login` (function) - trigger login
  <details>
    <summary>Parameters</summary>
    <ul>
      <li>options (object) - <a href="https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_redirectrequest_.html#redirectrequest">loginRequest</a> <i>(required)</i></li> 
      <li>method (string): loginRedirect or loginPopup</ul>
  </details>
- `logout` (function) - trigger logout (clears session storage and redirects to azure)
- `getToken` (function) - gathers and returns the users access token
  <details>
    <summary>Parameters</summary>
    <ul>
      <li>options (object) - <a href="https://azuread.github.io/microsoft-authentication-library-for-js/ref/msal-browser/modules/_src_request_redirectrequest_.html#redirectrequest">loginRequest</a> <i>(required)</i></li> 
      <li>method (string): loginRedirect or loginPopup</ul>
  </details>
- `apiGet` (function) - gets data from provided URL using the users id_token
  <details>
    <summary>Parameters</summary>
    <ul>
      <li>url (string) <i>(required)</i></li> 
  </details>
- `apiPost` (function) - posts the provided data to the URL using the users id_token
  <details>
    <summary>Parameters</summary>
    <ul>
      <li>url (string) <i>(required)</i></li> 
      <li>data  <i>(required)</i></ul>
  </details>
- `apiPut` (function) - updates/put the provided data to the URL using the users id_token
  <details>
    <summary>Parameters</summary>
    <ul>
      <li>url (string) <i>(required)</i></li> 
      <li>data  <i>(required)</i></ul>
  </details>
- `apiDelete` (function) - deletes data from provided URL using the users id_token
  <details>
    <summary>Parameters</summary>
    <ul>
      <li>url (string) <i>(required)</i></li> 
  </details>

#### User object

```javascript
{
  displayName: 'Trine Testesen',
  givenName: 'Trine',
  name: 'Trine Testesen',
  onPremisesSamAccountName: 'tri0308',
  surname: 'Testesen',
  tenantId: '08f3813c-9f29-482f-9aec-16ef7cbf477a',
  userPrincipalName: 'trine.testesen@vtfk.no',
  username: 'trine.testesen@vtfk.no'
}
```

## License

MIT © [Vestfold og Telemark fylkeskommune](https://github.com/vtfk)
