import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { AUTH_ROUTES, STORAGE_KEYS } from '../../config/constants.js'

function isAuthed() {
  try {
    return !!(localStorage.getItem(STORAGE_KEYS.token) && localStorage.getItem(STORAGE_KEYS.user))
  } catch {
    return false
  }
}

export function PrivateRoute({ children }) {
  const { ready, isAuthenticated } = useAuth()

  if (!ready) return null
  if (!isAuthenticated && !isAuthed()) {
    return <Navigate to={AUTH_ROUTES.login} replace />
  }
  return children
}

export function PublicRoute({ children }) {
  const { ready, isAuthenticated } = useAuth()

  if (!ready) return null
  if (isAuthenticated || isAuthed()) {
    return <Navigate to={AUTH_ROUTES.home} replace />
  }
  return children
}
