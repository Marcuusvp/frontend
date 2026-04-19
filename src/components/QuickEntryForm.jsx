import { useState } from 'react'
import { toast } from 'sonner'

const PAYMENT_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
}

const getInitialFormData = (paymentType) => ({
  description: '',
  amount: '',
  total_amount: '',
  installments: '1',
  purchase_date: new Date().toISOString().split('T')[0],
  date: new Date().toISOString().split('T')[0],
  category: '',
  card_id: '',
  type: 'expense',
})

export function QuickEntryForm({ cards, onClose, onSubmitPurchase, onSubmitTransaction }) {
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.CREDIT)
  const [formData, setFormData] = useState(() => getInitialFormData(PAYMENT_TYPES.CREDIT))
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type)
    setFormData(getInitialFormData(type))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast.error('A descrição é obrigatória')
      return
    }

    if (paymentType === PAYMENT_TYPES.CREDIT) {
      const totalAmount = parseFloat(formData.total_amount)
      if (isNaN(totalAmount) || totalAmount <= 0) {
        toast.error('O valor total deve ser maior que zero')
        return
      }

      const installments = parseInt(formData.installments)
      if (isNaN(installments) || installments < 1) {
        toast.error('O número de parcelas deve ser pelo menos 1')
        return
      }

      if (!formData.card_id) {
        toast.error('Selecione um cartão')
        return
      }

      setLoading(true)
      const result = await onSubmitPurchase({
        description: formData.description.trim(),
        total_amount: totalAmount,
        installments,
        purchase_date: formData.purchase_date,
        card_id: formData.card_id,
        category: formData.category.trim() || null,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Compra registrada com sucesso!')
        onClose()
      }
    } else {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        toast.error('O valor deve ser maior que zero')
        return
      }

      if (!formData.type) {
        toast.error('Selecione o tipo de transação')
        return
      }

      setLoading(true)
      const result = await onSubmitTransaction({
        description: formData.description.trim(),
        amount,
        type: formData.type,
        date: formData.date,
        category: formData.category.trim() || null,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Transação registrada com sucesso!')
        onClose()
      }
    }

    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Lançamento</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label>Tipo de Pagamento</label>
            <div className="payment-type-selector">
              <button
                type="button"
                className={`payment-type-btn ${paymentType === PAYMENT_TYPES.CREDIT ? 'active' : ''}`}
                onClick={() => handlePaymentTypeChange(PAYMENT_TYPES.CREDIT)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Cartão de Crédito
              </button>
              <button
                type="button"
                className={`payment-type-btn ${paymentType === PAYMENT_TYPES.DEBIT ? 'active' : ''}`}
                onClick={() => handlePaymentTypeChange(PAYMENT_TYPES.DEBIT)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Débito em Conta
              </button>
            </div>
          </div>

          {paymentType === PAYMENT_TYPES.CREDIT ? (
            <>
              <div className="form-group">
                <label htmlFor="card_id">Cartão</label>
                <select
                  id="card_id"
                  name="card_id"
                  value={formData.card_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um cartão</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.name} (Fecha dia {card.closing_day})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ex: Supermercado, Eletrônicos..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="total_amount">Valor Total (R$)</label>
                  <input
                    type="number"
                    id="total_amount"
                    name="total_amount"
                    step="0.01"
                    min="0.01"
                    value={formData.total_amount}
                    onChange={handleChange}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="installments">Parcelas</label>
                  <input
                    type="number"
                    id="installments"
                    name="installments"
                    min="1"
                    max="24"
                    value={formData.installments}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="purchase_date">Data da Compra</label>
                  <input
                    type="date"
                    id="purchase_date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Categoria (opcional)</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Ex: Alimentação"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Tipo de Transação</label>
                <div className="transaction-type-selector">
                  <button
                    type="button"
                    className={`type-btn ${formData.type === 'income' ? 'active-income' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    Entrada
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${formData.type === 'expense' ? 'active-expense' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
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
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={`auth-button ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? '' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
