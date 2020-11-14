import React from 'react'
import { useSession } from '@vtfk/react-msal'
import { loginRequest } from './config'

const keyTable = (obj) => {
  const tableRows = []
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      tableRows.push({ key, value: obj[key] })
    }
  }

  return (
    <table>
      <tbody>
        {tableRows && tableRows.map(row => (
          <tr key={row.key}>
            <td>{row.key}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const AppContent = () => {
  const { user, logout } = useSession()
  return (
    <>
      <code>
        Hi there, {user.givenName}! <span role='img' aria-label='waving hand emoji'>👋</span><br />
        Here is you MSAL user object:
      </code>

      {keyTable(user)}

      <button onClick={() => logout()}>Log out!</button>
    </>
  )
}

const App = () => {
  const { isAuthenticated, login, authStatus } = useSession()

  if (['pending'].includes(authStatus)) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    console.log('app-!isAuth')
    login(loginRequest, 'loginRedirect')
    return <></>
  }

  if (isAuthenticated && authStatus === 'finished') {
    return <AppContent />
  }
}

export default App
