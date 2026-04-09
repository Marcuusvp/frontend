import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import '../styles/auth.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast.error(error.message || 'Erro ao fazer login')
    } else {
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Bem-vindo de volta</h1>
        <p className="auth-subtitle">Faça login para acessar sua conta</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : 'Entrar'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">Esqueci minha senha</Link>
          <p>
            Não tem conta? <Link to="/signup">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
