import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingScreen } from './LoadingScreen'

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Verificando autenticação..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
