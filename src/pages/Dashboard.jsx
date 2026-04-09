import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorState } from '../components/ErrorState'
import { formatCurrency } from '../utils/installments'
import { getTransactionTypeColor } from '../utils/balance'
import '../styles/dashboard.css'

export function Dashboard() {
  const navigate = useNavigate()
  const {
    cards,
    transactions,
    currentBalance,
    totalInvoices,
    monthResult,
    cardInvoices,
    loading,
    error,
  } = useDashboard()

  const handleCardClick = (cardId) => {
    navigate(`/cards/${cardId}/invoice`)
  }

  const formatMonth = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    const now = new Date()
    return `${months[now.getMonth()]} ${now.getFullYear()}`
  }

  if (loading) {
    return <LoadingScreen message="Carregando dashboard..." />
  }

  if (error) {
    return (
      <div className="dashboard-main">
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div className="page-header-left">
          <h1>Visão Geral</h1>
          <p className="page-subtitle">{formatMonth()}</p>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="summary-section">
          <div className="summary-grid">
            <div className="summary-card balance">
              <div className="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className="summary-content">
                <span className="summary-label">Saldo em Conta</span>
                <span className="summary-value">{formatCurrency(currentBalance)}</span>
              </div>
            </div>

            <div className="summary-card invoices">
              <div className="summary-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div className="summary-content">
                <span className="summary-label">Total de Faturas</span>
                <span className="summary-value">{formatCurrency(totalInvoices)}</span>
              </div>
            </div>

            <div className={`summary-card result ${monthResult >= 0 ? 'positive' : 'negative'}`}>
              <div className="summary-icon">
                {monthResult >= 0 ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                  </svg>
                )}
              </div>
              <div className="summary-content">
                <span className="summary-label">Resultado do Mês</span>
                <span className="summary-value">
                  {monthResult >= 0 ? '+' : ''}{formatCurrency(monthResult)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="cards-section">
          <div className="section-header">
            <h2>Faturas deste Mês</h2>
            <button className="btn-text" onClick={() => navigate('/cards')}>
              Gerenciar cartões →
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="empty-cards">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#57449a" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p>Nenhum cartão cadastrado</p>
              <button className="btn-primary" onClick={() => navigate('/cards')}>
                Adicionar primeiro cartão
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {cardInvoices.map(({ card, total, purchases, subscriptions }) => (
                <div
                  key={card.id}
                  className="card-invoice-item"
                  onClick={() => handleCardClick(card.id)}
                  style={{ borderLeftColor: card.color }}
                >
                  <div className="card-invoice-header">
                    <h3 style={{ color: card.color }}>{card.name}</h3>
                    <span className="due-date">Venc. dia {card.due_day}</span>
                  </div>
                  <div className="card-invoice-amount">
                    {formatCurrency(total)}
                  </div>
                  <div className="card-invoice-details">
                    {purchases.length > 0 && (
                      <span>{purchases.length} compra{purchases.length > 1 ? 's' : ''}</span>
                    )}
                    {subscriptions.length > 0 && (
                      <span>{subscriptions.length} mensalidade{subscriptions.length > 1 ? 's' : ''}</span>
                    )}
                    {purchases.length === 0 && subscriptions.length === 0 && (
                      <span>Sem lançamentos</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="transactions-section">
          <div className="section-header">
            <h2>Transações Recentes</h2>
            <button className="btn-text" onClick={() => navigate('/balance')}>
              Ver extrato completo →
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-transactions">
              <p>Nenhuma transação registrada</p>
              <button className="btn-primary" onClick={() => navigate('/balance')}>
                Adicionar transação
              </button>
            </div>
          ) : (
            <div className="recent-transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="recent-transaction-item">
                  <div
                    className="transaction-type-icon"
                    style={{ backgroundColor: `${getTransactionTypeColor(transaction.type)}20` }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={getTransactionTypeColor(transaction.type)}
                      strokeWidth="2"
                    >
                      {transaction.type === 'income' ? (
                        <>
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </>
                      ) : (
                        <>
                          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                          <polyline points="17 18 23 18 23 12" />
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="transaction-info">
                    <span className="transaction-description">{transaction.description}</span>
                    <span className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span
                    className="transaction-amount"
                    style={{ color: getTransactionTypeColor(transaction.type) }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="quick-actions">
          <h2>Ações Rápidas</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigate('/cards')}>
              <div className="action-icon purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span>Ver Cartões</span>
            </button>

            <button className="action-card" onClick={() => navigate('/subscriptions')}>
              <div className="action-icon green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <span>Mensalidades</span>
            </button>

            <button className="action-card" onClick={() => navigate('/balance')}>
              <div className="action-icon blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <span>Extrato</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
