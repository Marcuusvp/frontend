import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import '../styles/auth.css'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    const { data, error } = await signUp(email, password)

    if (error) {
      toast.error(error.message || 'Erro ao criar conta')
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.info('Usuário já cadastrado. Verifique seu email para confirmar.')
    } else {
      toast.success('Cadastro realizado! Verifique seu email para confirmar.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Criar conta</h1>
        <p className="auth-subtitle">Comece a gerenciar suas finanças</p>
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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : 'Cadastrar'}
          </button>
        </form>
        <div className="auth-links">
          <p>
            Já tem conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
