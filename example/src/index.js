import './index.css'

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
