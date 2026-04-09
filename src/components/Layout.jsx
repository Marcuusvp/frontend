import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/layout.css'

export function Layout({ children }) {
  const { user, signOut } = useAuth()

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">Finanças</span>
        </div>
        <div className="app-header-right">
          <span className="user-email">{user?.email}</span>
          <NavLink to="/profile" className="btn-profile" title="Perfil">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </NavLink>
          <button className="btn-logout" onClick={signOut} title="Sair">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="logout-text">Sair</span>
          </button>
        </div>
      </header>

      <nav className="app-nav-desktop">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/cards" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Cartões
        </NavLink>
        <NavLink to="/subscriptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20" />
          </svg>
          Mensalidades
        </NavLink>
        <NavLink to="/balance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          Extrato
        </NavLink>
      </nav>

      <main className="app-main">
        {children}
      </main>

      <nav className="app-nav-mobile">
        <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>Início</span>
        </NavLink>
        <NavLink to="/cards" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Cartões</span>
        </NavLink>
        <NavLink to="/subscriptions" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20" />
          </svg>
          <span>Mensal.</span>
        </NavLink>
        <NavLink to="/balance" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <span>Extrato</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Perfil</span>
        </NavLink>
      </nav>
    </div>
  )
}
