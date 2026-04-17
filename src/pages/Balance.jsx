import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useBalanceTransactions } from '../hooks/useBalanceTransactions'
import { MonthNavigator } from '../components/MonthNavigator'
import { BalanceTransactionForm } from '../components/BalanceTransactionForm'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorState } from '../components/ErrorState'
import {
  formatCurrency,
  calculateBalance,
  calculateTotalIncome,
  calculateTotalExpense,
  getTransactionTypeColor,
  getTransactionTypeLabel,
  formatSignedCurrency,
} from '../utils/balance'
import '../styles/balance.css'

export function Balance() {
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useBalanceTransactions()

  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deletingTransaction, setDeletingTransaction] = useState(null)

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date + 'T00:00:00')
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
    })
  }, [transactions, currentMonth, currentYear])

  const monthlyIncome = useMemo(() => calculateTotalIncome(monthlyTransactions), [monthlyTransactions])
  const monthlyExpense = useMemo(() => calculateTotalExpense(monthlyTransactions), [monthlyTransactions])
  const monthlyBalance = useMemo(
    () => calculateBalance(monthlyTransactions),
    [monthlyTransactions]
  )

  const totalBalance = useMemo(() => {
    const pastTransactions = transactions.filter((t) => {
      const date = new Date(t.date + 'T00:00:00')
      const currentDate = new Date(currentYear, currentMonth - 1, 31)
      return date <= currentDate
    })
    return calculateBalance(pastTransactions)
  }, [transactions, currentMonth, currentYear])

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear((prev) => prev - 1)
    } else {
      setCurrentMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear((prev) => prev + 1)
    } else {
      setCurrentMonth((prev) => prev + 1)
    }
  }

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setShowForm(true)
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDeleteClick = (transaction) => {
    setDeletingTransaction(transaction)
  }

  const handleSubmitTransaction = async (formData) => {
    if (editingTransaction) {
      return await updateTransaction(editingTransaction.id, formData)
    } else {
      return await createTransaction(formData)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return
    const result = await deleteTransaction(deletingTransaction.id)
    if (!result.error) {
      setDeletingTransaction(null)
      toast.success('Transação excluída com sucesso!')
    }
    return result
  }

  const formatMonth = (month) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ]
    return months[month - 1]
  }

  if (loading) {
    return <LoadingScreen message="Carregando extrato..." />
  }

  if (error) {
    return (
      <div className="balance-page-content">
        <main className="balance-main">
          <ErrorState error={error} onRetry={fetchTransactions} />
        </main>
      </div>
    )
  }

  return (
    <div className="balance-page-content">
      <header className="page-header">
        <h1>Extrato</h1>
        <div className="page-header-right">
          <button className="btn-primary" onClick={handleAddTransaction}>
            + Nova Transação
          </button>
        </div>
      </header>

      <main className="balance-main">
        <div className="balance-controls">
          <MonthNavigator
            month={currentMonth}
            year={currentYear}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </div>

        <div className="balance-summary">
          <div className="summary-card balance-total">
            <span className="summary-label">Saldo em {formatMonth(currentMonth)}</span>
            <span className={`summary-value ${monthlyBalance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(monthlyBalance)}
            </span>
          </div>
          <div className="summary-card income">
            <span className="summary-label">Entradas</span>
            <span className="summary-value positive">{formatCurrency(monthlyIncome)}</span>
          </div>
          <div className="summary-card expense">
            <span className="summary-label">Saídas</span>
            <span className="summary-value negative">{formatCurrency(monthlyExpense)}</span>
          </div>
          <div className="summary-card total-balance">
            <span className="summary-label">Saldo Acumulado</span>
            <span className={`summary-value ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>

        <div className="transactions-section">
          <h3 className="section-title">Transações de {formatMonth(currentMonth)}</h3>

          {monthlyTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#57449a" strokeWidth="1.5">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="7" y1="15" x2="7.01" y2="15" />
                  <line x1="12" y1="15" x2="12.01" y2="15" />
                </svg>
              </div>
              <h3 className="empty-state-title">Nenhuma transação neste mês</h3>
              <p className="empty-state-description">Adicione uma nova transação para começar a controlar suas finanças.</p>
              <button className="auth-button" onClick={handleAddTransaction}>
                Registrar Transação
              </button>
            </div>
          ) : (
            <div className="transactions-list">
              {monthlyTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon" style={{ backgroundColor: `${getTransactionTypeColor(transaction.type)}20` }}>
                    <svg
                      width="20"
                      height="20"
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
                    <div className="transaction-main">
                      <h4 className="transaction-description">{transaction.description}</h4>
                      {transaction.category && (
                        <span className="category-badge">{transaction.category}</span>
                      )}
                    </div>
                    <div className="transaction-meta">
                      <span className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span
                        className="transaction-type"
                        style={{ color: getTransactionTypeColor(transaction.type) }}
                      >
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                    </div>
                  </div>

                  <div className="transaction-amount-actions">
                    <span
                      className="transaction-amount"
                      style={{ color: getTransactionTypeColor(transaction.type) }}
                    >
                      {formatSignedCurrency(transaction.amount, transaction.type)}
                    </span>
                    <div className="transaction-actions">
                      <button
                        className="card-action-btn edit"
                        onClick={() => handleEditTransaction(transaction)}
                        title="Editar"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="card-action-btn delete"
                        onClick={() => handleDeleteClick(transaction)}
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
        </div>
      </main>

      {showForm && (
        <BalanceTransactionForm
          key={editingTransaction?.id || 'new'}
          transaction={editingTransaction}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmitTransaction}
        />
      )}

      {deletingTransaction && (
        <DeleteConfirmModal
          title="Excluir transação?"
          itemName={deletingTransaction.description}
          onClose={() => setDeletingTransaction(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
