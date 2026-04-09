import { useEffect, useState } from 'react'
import { useCards } from '../hooks/useCards'
import { EmptyState } from '../components/EmptyState'
import { CardItem } from '../components/CardItem'
import { CardForm } from '../components/CardForm'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorState } from '../components/ErrorState'
import '../styles/cards.css'

export function Cards() {
  const { cards, loading, error, fetchCards, createCard, updateCard, deleteCard } = useCards()
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [deletingCard, setDeletingCard] = useState(null)

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

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

  if (loading) {
    return <LoadingScreen message="Carregando cartões..." />
  }

  if (error) {
    return (
      <div className="cards-page-content">
        <main className="cards-main">
          <ErrorState error={error} onRetry={fetchCards} />
        </main>
      </div>
    )
  }

  return (
    <div className="cards-page-content">
      <header className="page-header">
        <h1>Meus Cartões</h1>
        <div className="page-header-right">
          <button className="btn-primary" onClick={handleAddNew}>
            + Novo Cartão
          </button>
        </div>
      </header>

      <main className="cards-main">
        {cards.length === 0 ? (
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
          title="Excluir cartão?"
          itemName={deletingCard.name}
          onClose={() => setDeletingCard(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
