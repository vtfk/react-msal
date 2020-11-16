import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import * as msal from '@azure/msal-browser'
import { useSessionStorage } from './use-session-storage'
import defaultConfig from '../config'

export const MsalContext = React.createContext()
export const useSession = () => useContext(MsalContext)

export const MsalProvider = ({
  children,
  config,
  scopes
}) => {
  const isMock = config.isMock || defaultConfig.isMock
  const mockUser = config.mockUser || defaultConfig.mockUser
  const userInfoUrl = config.userInfoUrl || defaultConfig.userInfoUrl
  const loginScopes = scopes || config.scopes || defaultConfig.scopes
  const postLogoutRedirectUri = config.auth.postLogoutRedirectUri || defaultConfig.auth.postLogoutRedirectUri

  const ua = window.navigator.userAgent
  const msie = ua.indexOf('MSIE ')
  const msie11 = ua.indexOf('Trident/')
  const msedge = ua.indexOf('Edge/')
  const isIE = msie > 0 || msie11 > 0
  const isEdge = msedge > 0

  const sessionKey = 'MSAL-AUTH'
  const [auth, setAuth] = useSessionStorage(sessionKey, {
    isAuthenticated: isMock,
    user: false,
    token: false,
    idToken: false,
    expires: new Date().getTime(),
    authStatus: 'unknown'
  })

  const [publicClient, setPublicClient] = useState()
  const [popupOpen, setPopupOpen] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const { isAuthenticated, user, token, idToken, expires, authStatus } = auth

  const getUserInfo = async token => {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
    try {
      const { data } = await axios.get(userInfoUrl)
      return data
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  async function updateUserInfo (token, user) {
    const userInfo = await getUserInfo(token)
    return { ...user, ...userInfo }
  }

  async function saveUserdata (response, user) {
    const token = response.accessToken
    const idToken = response.idToken
    const expires = new Date(response.expiresOn).getTime()
    const userInfo = await updateUserInfo(token, user)
    const isAuthenticated = token && expires > new Date().getTime()
    const authStatus = 'finished'

    setAuth({
      isAuthenticated,
      user: userInfo,
      token,
      idToken,
      expires,
      authStatus
    })
  }

  async function updateToken (user) {
    if (!publicClient) return false
    const response = await publicClient.acquireTokenSilent({ account: user.username, ...loginScopes })
    await saveUserdata(response, user)
  }

  useEffect(() => {
    if (!isMock) {
      const pc = new msal.PublicClientApplication(config || defaultConfig)
      setPublicClient(pc)

      // Første innlogging
      const copyAuth = { ...auth }
      setAuth({ ...copyAuth, authStatus: 'pending' })
      pc.handleRedirectPromise().then((response) => {
        if (response) {
          const user = pc.getAllAccounts()[0]
          saveUserdata(response, user)
        } else {
          const copyAuth = { ...auth }
          setAuth({ ...copyAuth, authStatus: 'finished' })
        }
      }).catch(error => {
        const copyAuth = { ...auth }
        setAuth({ ...copyAuth, authStatus: 'rejected' })
        console.error(error)
        setLoginError(error)
      })

      // Dersom bruker er innlogget fra tidligere
      if (pc.getAllAccounts().length > 0) {
        const user = pc.getAllAccounts()[0]
        const copyAuth = { ...auth }
        setAuth({ ...copyAuth, authStatus: 'pending' })
        if (!token) {
          updateToken(user)
        } else {
          const copyAuth = { ...auth }
          setAuth({ ...copyAuth, isAuthenticated: token && expires > new Date().getTime(), authStatus: 'finished' })
        }
      }
    // eslint-disable-next-line
    }
  }, [])

  useEffect(() => {
    if (isMock) {
      const now = new Date()
      now.setDate(now.getDate() + 24)

      setAuth({
        isAuthenticated: true,
        user: mockUser,
        token: '12345',
        idToken: '67890',
        expires: now.getTime(),
        authStatus: 'finished'
      })

      console.log('Running in mock modus')
    }
    }, []) // eslint-disable-line

  const login = async (loginRequest, method = 'loginRedirect') => {
    if (!publicClient) return null
    const signInType = (isIE || isEdge) ? 'loginRedirect' : method

    if (signInType === 'loginPopup') {
      setPopupOpen(true)
      try {
        const copyAuth = { ...auth }
        setAuth({ ...copyAuth, authStatus: 'pending' })
        await publicClient.loginPopup(loginRequest)
        if (publicClient.getAccount()) {
          updateToken(publicClient.getAccount())
        }
      } catch (error) {
        console.error(error)
        setLoginError(error)
      } finally {
        setPopupOpen(false)
      }
    } else if (signInType === 'loginRedirect') {
      const copyAuth = { ...auth }
      setAuth({ ...copyAuth, authStatus: 'pending' })
      publicClient.loginRedirect(loginRequest)
    }
  }

  const logout = () => {
    if (isMock) {
      console.log('mock logout')
      window.sessionStorage.clear()
      window.location.replace(postLogoutRedirectUri)
      return
    }

    window.sessionStorage.removeItem(sessionKey)
    const account = user.homeAccountId ? publicClient.getAccountByHomeId(user.homeAccountId) : undefined
    publicClient.logout({ account, postLogoutRedirectUri })
  }

  const getTokenPopup = async (loginRequest) => {
    try {
      const response = await publicClient.acquireTokenSilent(loginRequest)
      saveUserdata(response.accessToken, user)
    } catch (error) {
      try {
        setPopupOpen(true)
        const response = await publicClient.acquireTokenPopup(loginRequest)
        saveUserdata(response.accessToken, user)
      } catch (error) {
        console.log(error)
        setLoginError(error)
      } finally {
        setPopupOpen(false)
      }
    }
  }

  // This function can be removed if you do not need to support IE
  const getTokenRedirect = async (loginRequest) => {
    const copyAuth = { ...auth }
    setAuth({ ...copyAuth, authStatus: 'pending' })
    try {
      const token = await publicClient.acquireTokenSilent(loginRequest)
      setAuth({ ...copyAuth, token })
    } catch (error) {
      try {
        const copyAuth = { ...auth }
        setAuth({ ...copyAuth, authStatus: 'pending' })
        publicClient.acquireTokenRedirect(loginRequest)
      } catch (error) {
        console.error(error)
        setLoginError(error)
      }
    }
  }

  const getToken = async (loginRequest, method) => {
    const signInType = (isIE || isEdge) ? 'loginRedirect' : method
    if (signInType === 'loginRedirect') {
      return await getTokenRedirect(loginRequest)
    } else {
      return await getTokenPopup(loginRequest)
    }
  }

  // Implementerer api kall
  const is401 = error => /401/.test(error.message)
  const isValid = (token, expires) => token && expires > new Date().getTime()

  const retry = async func => {
    if (isValid(idToken, expires)) {
      axios.defaults.headers.common.Authorization = `Bearer ${idToken}`
      try {
        const { data } = await func()
        return data
      } catch (error) {
        if (is401(error)) {
          await updateToken(user)
          axios.defaults.headers.common.Authorization = `Bearer ${idToken}`
          try {
            const { data } = await func()
            return data
          } catch (error) {
            console.error(error)
            return false
          }
        } else {
          console.error(error)
          return false
        }
      }
    } else {
      console.warn('invalid token or expire')
      await updateToken(user)
      return func()
    }
  }

  const apiGet = url => retry(() => axios.get(url))
  const apiPost = (url, payload) => retry(() => axios.post(url, payload))
  const apiPut = (url, payload) => retry(() => axios.put(url, payload))

  return (
    <MsalContext.Provider
      value={{
        isAuthenticated,
        authStatus,
        user,
        token,
        idToken,
        popupOpen,
        loginError,
        login,
        logout,
        getToken,
        apiGet,
        apiPost,
        apiPut
      }}
    >
      {children}
    </MsalContext.Provider>
  )
}
