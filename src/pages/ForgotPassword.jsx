import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import '../styles/auth.css'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      toast.error(error.message || 'Erro ao enviar email')
    } else {
      toast.success('Email de recuperação enviado!')
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Recuperar Senha</h1>
        <p className="auth-subtitle">
          {sent
            ? 'Verifique sua caixa de entrada'
            : 'Informe seu email para receber as instruções'}
        </p>
        {!sent ? (
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
            <button
              type="submit"
              className={`auth-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : 'Enviar instruções'}
            </button>
          </form>
        ) : (
          <div className="auth-form">
            <p style={{ textAlign: 'center', color: '#57449a', marginBottom: '20px' }}>
              Enviamos um email para <strong>{email}</strong> com as instruções para redefinir sua senha.
            </p>
          </div>
        )}
        <div className="auth-links">
          <Link to="/login">Voltar para login</Link>
        </div>
      </div>
    </div>
  )
}
