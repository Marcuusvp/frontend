import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useCards } from '../hooks/useCards'
import { SubscriptionForm } from '../components/SubscriptionForm'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorState } from '../components/ErrorState'
import { getSubscriptionStatus, getSubscriptionStatusLabel, formatCurrency } from '../utils/subscriptions'
import '../styles/cards.css'

function SubscriptionItem({ subscription, card, onEdit, onDelete, onToggleActive }) {
  const status = getSubscriptionStatus(subscription)
  const statusLabel = getSubscriptionStatusLabel(status)

  return (
    <div className="card-item" style={{ opacity: subscription.active ? 1 : 0.7 }}>
      <div
        className="card-color-indicator"
        style={{ backgroundColor: card?.color || '#57449a' }}
      />
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-name">{subscription.description}</h3>
          <span className={`subscription-status ${status}`}>
            {statusLabel}
          </span>
        </div>
        <div className="card-details">
          <span className="card-detail">
            <strong>{formatCurrency(subscription.amount)}</strong> / mês
          </span>
          <span className="card-detail">
            Cobrança: dia {subscription.billing_day}
          </span>
          {card && (
            <span className="card-detail">
              Cartão: {card.name}
            </span>
          )}
        </div>
        <div className="card-dates">
          Início: {new Date(subscription.start_date).toLocaleDateString('pt-BR')}
          {subscription.end_date && (
            <span> | Término: {new Date(subscription.end_date).toLocaleDateString('pt-BR')}</span>
          )}
        </div>
      </div>
      <div className="card-actions">
        <button
          className="card-action-btn"
          onClick={() => onToggleActive(subscription)}
          title={subscription.active ? 'Pausar' : 'Ativar'}
        >
          {subscription.active ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        <button
          className="card-action-btn edit"
          onClick={() => onEdit(subscription)}
          title="Editar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className="card-action-btn delete"
          onClick={() => onDelete(subscription)}
          title="Excluir"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function EmptySubscriptions({ onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#57449a" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20" strokeDasharray="4 4" />
        </svg>
      </div>
      <h3 className="empty-state-title">Nenhuma mensalidade cadastrada</h3>
      <p className="empty-state-description">Cadastre suas assinaturas e mensalidades para acompanhá-las automaticamente nas faturas.</p>
      <button className="auth-button" onClick={onAction}>
        Adicionar mensalidade
      </button>
    </div>
  )
}

export function Subscriptions() {
  const {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
  } = useSubscriptions()
  const { cards, fetchCards } = useCards()

  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [deletingSubscription, setDeletingSubscription] = useState(null)

  useEffect(() => {
    fetchSubscriptions()
    fetchCards()
  }, [fetchSubscriptions, fetchCards])

  const handleAddNew = () => {
    setEditingSubscription(null)
    setShowForm(true)
  }

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription)
    setShowForm(true)
  }

  const handleDelete = (subscription) => {
    setDeletingSubscription(subscription)
  }

  const handleToggleActive = async (subscription) => {
    const result = await toggleSubscriptionActive(subscription.id, subscription.active)
    if (!result.error) {
      toast.success(subscription.active ? 'Mensalidade pausada' : 'Mensalidade ativada')
    }
  }

  const handleSubmit = async (formData) => {
    if (editingSubscription) {
      return await updateSubscription(editingSubscription.id, formData)
    } else {
      return await createSubscription(formData)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingSubscription) return
    const result = await deleteSubscription(deletingSubscription.id)
    if (!result.error) {
      setDeletingSubscription(null)
      toast.success('Mensalidade excluída com sucesso!')
    }
    return result
  }

  const getCardById = (cardId) => cards.find(c => c.id === cardId)

  if (loading) {
    return <LoadingScreen message="Carregando mensalidades..." />
  }

  if (error) {
    return (
      <div className="cards-page-content">
        <main className="cards-main">
          <ErrorState error={error} onRetry={() => { fetchSubscriptions(); fetchCards() }} />
        </main>
      </div>
    )
  }

  return (
    <div className="cards-page-content">
      <header className="page-header">
        <h1>Mensalidades</h1>
        <div className="page-header-right">
          <button className="btn-primary" onClick={handleAddNew}>
            + Nova Mensalidade
          </button>
        </div>
      </header>

      <main className="cards-main">
        {subscriptions.length === 0 ? (
          <EmptySubscriptions onAction={handleAddNew} />
        ) : (
          <div className="cards-list">
            {subscriptions.map((subscription) => (
              <SubscriptionItem
                key={subscription.id}
                subscription={subscription}
                card={getCardById(subscription.card_id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <SubscriptionForm
          key={editingSubscription?.id || 'new'}
          subscription={editingSubscription}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      {deletingSubscription && (
        <DeleteConfirmModal
          title="Excluir mensalidade?"
          itemName={deletingSubscription.description}
          onClose={() => setDeletingSubscription(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
