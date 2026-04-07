import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { useCards } from '../hooks/useCards'
import { usePurchases } from '../hooks/usePurchases'
import { MonthNavigator } from '../components/MonthNavigator'
import { PurchaseForm } from '../components/PurchaseForm'
import { calculateInstallments, formatCurrency, getCurrentMonthYear } from '../utils/installments'
import '../styles/invoice.css'

function DeleteConfirmModal({ purchase, onClose, onConfirm }) {
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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3>Excluir compra?</h3>
          <p>
            Tem certeza que deseja excluir <strong>{purchase?.description}</strong>?
            <br />
            Todas as parcelas serão removidas.
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

export function Invoice() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { cards, loading: loadingCards, fetchCards } = useCards()
  const { purchases, loading: loadingPurchases, fetchPurchasesByCard, createPurchase, updatePurchase, deletePurchase } = usePurchases()

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear().month)
  const [currentYear, setCurrentYear] = useState(getCurrentMonthYear().year)
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [deletingPurchase, setDeletingPurchase] = useState(null)

  const card = useMemo(() => cards.find(c => c.id === cardId), [cards, cardId])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  useEffect(() => {
    if (cardId) {
      fetchPurchasesByCard(cardId)
    }
  }, [cardId, fetchPurchasesByCard])

  const invoiceItems = useMemo(() => {
    if (!card) return []

    const items = []

    purchases.forEach(purchase => {
      const installments = calculateInstallments(purchase, card)
      const currentInstallment = installments.find(
        inst => inst.month === currentMonth && inst.year === currentYear
      )

      if (currentInstallment) {
        items.push({
          ...purchase,
          installmentAmount: currentInstallment.amount,
          installmentNumber: currentInstallment.installmentNumber,
          totalInstallments: purchase.installments,
        })
      }
    })

    return items.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
  }, [purchases, card, currentMonth, currentYear])

  const totalAmount = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.installmentAmount, 0)
  }, [invoiceItems])

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  const handleAddPurchase = () => {
    setEditingPurchase(null)
    setShowForm(true)
  }

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase)
    setShowForm(true)
  }

  const handleDeleteClick = (purchase) => {
    setDeletingPurchase(purchase)
  }

  const handleSubmitPurchase = async (formData) => {
    if (editingPurchase) {
      return await updatePurchase(editingPurchase.id, formData)
    } else {
      return await createPurchase(formData)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingPurchase) return
    const result = await deletePurchase(deletingPurchase.id)
    if (!result.error) {
      setDeletingPurchase(null)
      toast.success('Compra excluída com sucesso!')
    }
    return result
  }

  const handleLogout = async () => {
    await signOut()
  }

  if (loadingCards) {
    return <div className="invoice-page"><div className="loading">Carregando...</div></div>
  }

  if (!card) {
    return <div className="invoice-page"><div className="loading">Cartão não encontrado</div></div>
  }

  return (
    <div className="invoice-page">
      <header className="invoice-header" style={{ borderLeftColor: card.color }}>
        <div className="invoice-header-left">
          <button className="btn-back" onClick={() => navigate('/cards')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
          <h1>{card.name}</h1>
          <p className="card-info">
            Fechamento: dia {card.closing_day} | Vencimento: dia {card.due_day}
          </p>
        </div>
        <div className="invoice-header-right">
          <span className="user-email">{user?.email}</span>
          <button className="btn-primary" onClick={handleAddPurchase}>
            + Nova Compra
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className="invoice-main">
        <div className="invoice-controls">
          <MonthNavigator
            month={currentMonth}
            year={currentYear}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </div>

        <div className="invoice-summary">
          <div className="summary-card">
            <span className="summary-label">Total da Fatura</span>
            <span className="summary-value">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Compras no mês</span>
            <span className="summary-value">{invoiceItems.length}</span>
          </div>
        </div>

        {loadingPurchases ? (
          <div className="loading-state">Carregando compras...</div>
        ) : invoiceItems.length === 0 ? (
          <div className="empty-invoice">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#57449a" strokeWidth="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3>Nenhuma compra neste mês</h3>
            <p>Adicione uma nova compra para este cartão.</p>
            <button className="auth-button" onClick={handleAddPurchase}>
              Registrar Compra
            </button>
          </div>
        ) : (
          <div className="purchases-list">
            {invoiceItems.map(item => (
              <div key={item.id} className="purchase-item">
                <div className="purchase-info">
                  <div className="purchase-main">
                    <h4 className="purchase-description">{item.description}</h4>
                    {item.category && <span className="purchase-category">{item.category}</span>}
                  </div>
                  <div className="purchase-meta">
                    <span className="purchase-date">
                      {new Date(item.purchase_date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="purchase-installment">
                      {item.installmentNumber}/{item.totalInstallments}
                    </span>
                  </div>
                </div>
                <div className="purchase-amount-actions">
                  <span className="purchase-amount">{formatCurrency(item.installmentAmount)}</span>
                  <div className="purchase-actions">
                    <button
                      className="card-action-btn edit"
                      onClick={() => handleEditPurchase(item)}
                      title="Editar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="card-action-btn delete"
                      onClick={() => handleDeleteClick(item)}
                      title="Excluir"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <PurchaseForm
          key={editingPurchase?.id || 'new'}
          purchase={editingPurchase}
          cardId={cardId}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmitPurchase}
        />
      )}

      {deletingPurchase && (
        <DeleteConfirmModal
          purchase={deletingPurchase}
          onClose={() => setDeletingPurchase(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
