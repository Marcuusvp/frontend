import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/auth.css'

export function Dashboard() {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <h1>Dashboard</h1>
        <p className="auth-subtitle">Bem-vindo, {user?.email}</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '24px'
        }}>
          <Link
            to="/cards"
            className="auth-button"
            style={{ textAlign: 'center', textDecoration: 'none' }}
          >
            Meus Cartões
          </Link>
          <button
            className="auth-button"
            onClick={handleLogout}
            style={{ background: '#2f363f' }}
          >
            Sair
          </button>
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', color: '#666' }}>
          <p>O dashboard completo será implementado na Fase 6.</p>
        </div>
      </div>
    </div>
  )
}
