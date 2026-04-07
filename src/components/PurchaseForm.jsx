import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCards } from '../hooks/useCards'

const getInitialFormData = (purchase, cardId) => ({
  description: purchase?.description ?? '',
  total_amount: purchase?.total_amount?.toString() ?? '',
  installments: purchase?.installments?.toString() ?? '1',
  purchase_date: purchase?.purchase_date ?? new Date().toISOString().split('T')[0],
  card_id: purchase?.card_id ?? cardId ?? '',
  category: purchase?.category ?? '',
})

export function PurchaseForm({ purchase, cardId, onClose, onSubmit }) {
  const { cards, loading: loadingCards, fetchCards } = useCards()
  const [formData, setFormData] = useState(() => getInitialFormData(purchase, cardId))
  const [loading, setLoading] = useState(false)
  const isEditing = !!purchase

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast.error('A descrição é obrigatória')
      return
    }

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

    const dataToSubmit = {
      description: formData.description.trim(),
      total_amount: totalAmount,
      installments,
      purchase_date: formData.purchase_date,
      card_id: formData.card_id,
      category: formData.category.trim() || null,
    }

    const result = await onSubmit(dataToSubmit)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isEditing ? 'Compra atualizada com sucesso!' : 'Compra registrada com sucesso!')
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
          <h2>{isEditing ? 'Editar Compra' : 'Nova Compra'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-form">
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

          <div className="form-group">
            <label htmlFor="card_id">Cartão</label>
            <select
              id="card_id"
              name="card_id"
              value={formData.card_id}
              onChange={handleChange}
              disabled={loadingCards || !!cardId}
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
