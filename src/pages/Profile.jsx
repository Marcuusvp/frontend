import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { getFriendlyErrorMessage } from '../utils/errors'
import '../styles/profile.css'

export function Profile() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.name || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleUpdateName = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) {
      toast.error('Nome não pode ficar vazio')
      return
    }

    setSavingName(true)
    const { error } = await supabase.auth.updateUser({
      data: { name: displayName.trim() }
    })
    setSavingName(false)

    if (error) {
      toast.error(getFriendlyErrorMessage(error))
    } else {
      toast.success('Nome atualizado com sucesso!')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não conferem')
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    setSavingPassword(false)

    if (error) {
      toast.error(getFriendlyErrorMessage(error))
    } else {
      toast.success('Senha alterada com sucesso!')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleConfirmDelete = async () => {
    await supabase.auth.signOut()
    setShowDeleteConfirm(false)
    toast.success('Sessão encerrada. Para excluir sua conta permanentemente, entre em contato com o suporte.')
  }

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Perfil</h1>
      </header>

      <main className="profile-main">
        <section className="profile-section">
          <h2 className="profile-section-title">Informações</h2>
          <form className="profile-form" onSubmit={handleUpdateName}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="form-input disabled"
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Nome de exibição</label>
              <input
                type="text"
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                className="form-input"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={savingName}
            >
              {savingName ? 'Salvando...' : 'Salvar nome'}
            </button>
          </form>
        </section>

        <section className="profile-section">
          <h2 className="profile-section-title">Alterar senha</h2>
          <form className="profile-form" onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="newPassword">Nova senha</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="form-input"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={savingPassword}
            >
              {savingPassword ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </section>

        <section className="profile-section danger-zone">
          <h2 className="profile-section-title">Zona de perigo</h2>
          <div className="danger-zone-content">
            <div>
              <p className="danger-zone-text">Excluir conta permanentemente</p>
              <p className="danger-zone-desc">Esta ação não pode ser desfeita. Todos os seus dados serão removidos.</p>
            </div>
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              Excluir conta
            </button>
          </div>
        </section>
      </main>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Excluir conta?"
          itemName={user?.email}
          warningText="Todos os seus dados serão removidos permanentemente."
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
