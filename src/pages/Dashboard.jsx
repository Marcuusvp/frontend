import { useAuth } from '../hooks/useAuth'

export function Dashboard() {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={handleLogout}>Sair</button>
        </div>
      </header>
      <main>
        <p>Bem-vindo ao seu controle financeiro!</p>
        <p>O dashboard será implementado nas próximas fases.</p>
      </main>
    </div>
  )
}
