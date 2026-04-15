import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCards } from '../hooks/useCards'
import { usePurchases } from '../hooks/usePurchases'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useInvoicePayments } from '../hooks/useInvoicePayments'
import { MonthNavigator } from '../components/MonthNavigator'
import { PurchaseForm } from '../components/PurchaseForm'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorState } from '../components/ErrorState'
import { calculateInstallments, formatCurrency, getCurrentMonthYear, getRelevantInvoiceMonth } from '../utils/installments'
import { getSubscriptionsForMonth } from '../utils/subscriptions'
import '../styles/invoice.css'

export function Invoice() {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const { cards, loading: loadingCards, error: errorCards, fetchCards } = useCards()
  const { purchases, loading: loadingPurchases, error: errorPurchases, fetchPurchasesByCard, createPurchase, updatePurchase, deletePurchase } = usePurchases()
  const { subscriptions, loading: loadingSubscriptions, error: errorSubscriptions, fetchSubscriptionsByCard } = useSubscriptions()
  const { payment, loading: loadingPayment, fetchPayment, markAsPaid, unmarkAsPaid } = useInvoicePayments()

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear().month)
  const [currentYear, setCurrentYear] = useState(getCurrentMonthYear().year)
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [deletingPurchase, setDeletingPurchase] = useState(null)

  const card = useMemo(() => cards.find(c => c.id === cardId), [cards, cardId])

  const [initialMonthSet, setInitialMonthSet] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  // Ao carregar o cartão, ajustar o mês para a fatura relevante (aberta)
  useEffect(() => {
    if (card && !initialMonthSet) {
      const { month, year } = getRelevantInvoiceMonth(card)
      setCurrentMonth(month)
      setCurrentYear(year)
      setInitialMonthSet(true)
    }
  }, [card, initialMonthSet])

  useEffect(() => {
    if (cardId) {
      fetchPurchasesByCard(cardId)
      fetchSubscriptionsByCard(cardId)
    }
  }, [cardId, fetchPurchasesByCard, fetchSubscriptionsByCard])

  // Buscar status de pagamento ao carregar ou mudar de mês
  useEffect(() => {
    if (cardId) {
      fetchPayment(cardId, currentMonth, currentYear)
    }
  }, [cardId, currentMonth, currentYear, fetchPayment])

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

  const monthlySubscriptions = useMemo(() => {
    return getSubscriptionsForMonth(subscriptions, currentMonth, currentYear)
  }, [subscriptions, currentMonth, currentYear])

  const totalPurchases = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.installmentAmount, 0)
  }, [invoiceItems])

  const totalSubscriptions = useMemo(() => {
    return monthlySubscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0)
  }, [monthlySubscriptions])

  const totalAmount = useMemo(() => {
    return totalPurchases + totalSubscriptions
  }, [totalPurchases, totalSubscriptions])

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
    let result
    if (editingPurchase) {
      result = await updatePurchase(editingPurchase.id, formData)
    } else {
      result = await createPurchase(formData)
    }

    // Auto-reabrir fatura se estava paga e antes do fechamento
    if (!result.error && payment && card) {
      const today = new Date().getDate()
      const daysInCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      const effectiveClosingDay = Math.min(card.closing_day, daysInCurrentMonth)

      if (today <= effectiveClosingDay) {
        await unmarkAsPaid(cardId, currentMonth, currentYear)
        toast.info('Fatura reaberta — nova compra adicionada.')
      }
    }

    return result
  }

  const handleMarkAsPaid = async () => {
    if (!card || totalAmount <= 0) return
    const result = await markAsPaid(cardId, card.name, currentMonth, currentYear, totalAmount)
    if (result.error) {
      toast.error('Erro ao marcar fatura como paga.')
    } else {
      toast.success('Fatura marcada como paga!')
    }
  }

  const handleUnmarkAsPaid = async () => {
    const result = await unmarkAsPaid(cardId, currentMonth, currentYear)
    if (result.error) {
      toast.error('Erro ao desfazer pagamento.')
    } else {
      toast.success('Pagamento desfeito.')
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

  if (loadingCards) {
    return <LoadingScreen message="Carregando fatura..." />
  }

  if (errorCards || errorPurchases || errorSubscriptions) {
    return (
      <div className="invoice-page-content">
        <main className="invoice-main">
          <ErrorState
            error={errorCards || errorPurchases || errorSubscriptions}
            onRetry={() => {
              fetchCards()
              if (cardId) {
                fetchPurchasesByCard(cardId)
                fetchSubscriptionsByCard(cardId)
              }
            }}
          />
        </main>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="invoice-page-content">
        <main className="invoice-main">
          <ErrorState
            error="Cartão não encontrado."
            onRetry={() => navigate('/cards')}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="invoice-page-content">
      <header className="page-header" style={{ borderLeftColor: card.color, borderLeft: `4px solid ${card.color}` }}>
        <div className="page-header-left">
          <button className="btn-back" onClick={() => navigate('/cards')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
          <div>
            <h1>{card.name}</h1>
            <p className="page-subtitle">
              Fechamento: dia {card.closing_day} | Vencimento: dia {card.due_day}
            </p>
          </div>
        </div>
        <div className="page-header-right">
          {totalAmount > 0 && !payment && (
            <button className="btn-paid" onClick={handleMarkAsPaid} disabled={loadingPayment}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Marcar como Paga
            </button>
          )}
          {payment && (
            <button className="btn-unpaid" onClick={handleUnmarkAsPaid} disabled={loadingPayment}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Desfazer Pagamento
            </button>
          )}
          <button className="btn-primary" onClick={handleAddPurchase}>
            + Nova Compra
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

        <div className={`invoice-summary ${payment ? 'invoice-paid' : ''}`}>
          <div className="summary-card">
            <div className="summary-card-header">
              <span className="summary-label">Total da Fatura</span>
              {payment && <span className="paid-badge">Paga</span>}
            </div>
            <span className="summary-value">{payment ? formatCurrency(0) : formatCurrency(totalAmount)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Compras</span>
            <span className="summary-value">{formatCurrency(totalPurchases)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Mensalidades</span>
            <span className="summary-value">{formatCurrency(totalSubscriptions)}</span>
          </div>
        </div>

        {monthlySubscriptions.length > 0 && (
          <div className="subscriptions-section">
            <h3 className="section-title">Mensalidades ({monthlySubscriptions.length})</h3>
            <div className="purchases-list">
              {monthlySubscriptions.map(sub => (
                <div key={sub.id} className="purchase-item subscription-item">
                  <div className="purchase-info">
                    <div className="purchase-main">
                      <h4 className="purchase-description">{sub.description}</h4>
                      <span className="purchase-category">Mensalidade</span>
                    </div>
                    <div className="purchase-meta">
                      <span className="purchase-date">
                        Cobrança: dia {sub.billing_day}
                      </span>
                    </div>
                  </div>
                  <div className="purchase-amount-actions">
                    <span className="purchase-amount">{formatCurrency(sub.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingPurchases || loadingSubscriptions ? (
          <div className="loading-state">
            <div className="loading-spinner-small primary" style={{ width: '24px', height: '24px', borderWidth: '3px', margin: '0 auto 12px' }} />
            <p>Carregando lançamentos...</p>
          </div>
        ) : invoiceItems.length === 0 && monthlySubscriptions.length === 0 ? (
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
          <>
            {invoiceItems.length > 0 && (
              <div className="purchases-section">
                <h3 className="section-title">Compras ({invoiceItems.length})</h3>
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
              </div>
            )}
          </>
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
          title="Excluir compra?"
          itemName={deletingPurchase.description}
          warningText="Todas as parcelas serão removidas."
          onClose={() => setDeletingPurchase(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
