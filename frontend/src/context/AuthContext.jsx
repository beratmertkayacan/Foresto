import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react'
import { STORAGE_KEYS } from '../config/constants.js'

const AuthContext = createContext({
  ready: false,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
})

function readAuth() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.token)
    const user = localStorage.getItem(STORAGE_KEYS.user)
    return !!(token && user)
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ ready: false, isAuthenticated: false })

  useLayoutEffect(() => {
    setState({ ready: true, isAuthenticated: readAuth() })
  }, [])

  const signIn = useCallback(() => {
    setState({ ready: true, isAuthenticated: true })
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.user)
    setState({ ready: true, isAuthenticated: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
