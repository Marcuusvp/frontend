import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCards } from '../hooks/useCards'
import { EmptyState } from '../components/EmptyState'
import { CardItem } from '../components/CardItem'
import { CardForm } from '../components/CardForm'
import '../styles/cards.css'

function DeleteConfirmModal({ card, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="delete-confirm">
          <div className="delete-confirm-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3>Excluir cartão?</h3>
          <p>
            Tem certeza que deseja excluir o cartão <strong>{card?.name}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="delete-confirm-actions">
            <button className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Cards() {
  const { user, signOut } = useAuth()
  const { cards, loading, fetchCards, createCard, updateCard, deleteCard } = useCards()
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [deletingCard, setDeletingCard] = useState(null)

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const handleLogout = async () => {
    await signOut()
  }

  const handleAddNew = () => {
    setEditingCard(null)
    setShowForm(true)
  }

  const handleEdit = (card) => {
    setEditingCard(card)
    setShowForm(true)
  }

  const handleDelete = (card) => {
    setDeletingCard(card)
  }

  const handleSubmit = async (formData) => {
    if (editingCard) {
      return await updateCard(editingCard.id, formData)
    } else {
      return await createCard(formData)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingCard) return
    const result = await deleteCard(deletingCard.id)
    if (!result.error) {
      setDeletingCard(null)
    }
    return result
  }

  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>Meus Cartões</h1>
        <div className="cards-header-actions">
          <span className="user-email">{user?.email}</span>
          <button className="btn-primary" onClick={handleAddNew}>
            + Novo Cartão
          </button>
          <button className="btn-secondary" onClick={handleLogout} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
            Sair
          </button>
        </div>
      </header>

      <main className="cards-main">
        {loading ? (
          <div className="empty-state">
            <p>Carregando cartões...</p>
          </div>
        ) : cards.length === 0 ? (
          <EmptyState
            title="Nenhum cartão cadastrado"
            description="Cadastre seus cartões de crédito para começar a controlar suas faturas."
            actionLabel="Adicionar primeiro cartão"
            onAction={handleAddNew}
          />
        ) : (
          <div className="cards-list">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <CardForm
          key={editingCard?.id || 'new'}
          card={editingCard}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      {deletingCard && (
        <DeleteConfirmModal
          card={deletingCard}
          onClose={() => setDeletingCard(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
