import { useState } from 'react'
import { toast } from 'sonner'

const getInitialFormData = (transaction) => ({
  description: transaction?.description ?? '',
  amount: transaction?.amount?.toString() ?? '',
  type: transaction?.type ?? 'expense',
  date: transaction?.date ?? new Date().toISOString().split('T')[0],
  category: transaction?.category ?? '',
})

export function BalanceTransactionForm({ transaction, onClose, onSubmit }) {
  const [formData, setFormData] = useState(() => getInitialFormData(transaction))
  const [loading, setLoading] = useState(false)
  const isEditing = !!transaction

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast.error('A descrição é obrigatória')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('O valor deve ser maior que zero')
      return
    }

    if (!formData.type) {
      toast.error('Selecione o tipo de transação')
      return
    }

    if (!formData.date) {
      toast.error('A data é obrigatória')
      return
    }

    setLoading(true)

    const dataToSubmit = {
      description: formData.description.trim(),
      amount: amount,
      type: formData.type,
      date: formData.date,
      category: formData.category.trim() || null,
    }

    const result = await onSubmit(dataToSubmit)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isEditing ? 'Transação atualizada com sucesso!' : 'Transação registrada com sucesso!')
      onClose()
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Transação' : 'Nova Transação'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label>tipo de transação</label>
            <div className="transaction-type-selector">
              <button
                type="button"
                className={`type-btn ${formData.type === 'income' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                style={{
                  backgroundColor: formData.type === 'income' ? '#2ecc7120' : 'transparent',
                  borderColor: formData.type === 'income' ? '#2ecc71' : '#d9d7ef',
                  color: formData.type === 'income' ? '#2ecc71' : '#666'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Entrada
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'expense' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                style={{
                  backgroundColor: formData.type === 'expense' ? '#e74c3c20' : 'transparent',
                  borderColor: formData.type === 'expense' ? '#e74c3c' : '#d9d7ef',
                  color: formData.type === 'expense' ? '#e74c3c' : '#666'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
                Saída
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Salário, Aluguel, Freelance..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Valor (R$)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0,00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Data</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria (opcional)</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Ex: Moradia, Transporte, Renda..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={`auth-button ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? '' : isEditing ? 'Salvar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
