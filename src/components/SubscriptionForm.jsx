import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCards } from '../hooks/useCards'

const getInitialFormData = (subscription) => ({
  description: subscription?.description ?? '',
  amount: subscription?.amount ?? '',
  billing_day: subscription?.billing_day ?? '',
  card_id: subscription?.card_id ?? '',
  start_date: subscription?.start_date ?? new Date().toISOString().split('T')[0],
  end_date: subscription?.end_date ?? '',
  active: subscription?.active ?? true,
})

export function SubscriptionForm({ subscription, onClose, onSubmit }) {
  const [formData, setFormData] = useState(() => getInitialFormData(subscription))
  const [loading, setLoading] = useState(false)
  const { cards, loading: loadingCards, fetchCards } = useCards()
  const isEditing = !!subscription

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validações
    if (!formData.description.trim()) {
      toast.error('A descrição é obrigatória')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('O valor deve ser maior que zero')
      return
    }

    const billingDay = parseInt(formData.billing_day)
    if (isNaN(billingDay) || billingDay < 1 || billingDay > 31) {
      toast.error('O dia de cobrança deve estar entre 1 e 31')
      return
    }

    if (!formData.card_id) {
      toast.error('Selecione um cartão')
      return
    }

    if (!formData.start_date) {
      toast.error('A data de início é obrigatória')
      return
    }

    // Validação de datas
    if (formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate < startDate) {
        toast.error('A data de término não pode ser anterior à data de início')
        return
      }
    }

    setLoading(true)

    const dataToSubmit = {
      description: formData.description.trim(),
      amount: amount,
      billing_day: billingDay,
      card_id: formData.card_id,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      active: formData.active,
    }

    const result = await onSubmit(dataToSubmit)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isEditing ? 'Mensalidade atualizada com sucesso!' : 'Mensalidade criada com sucesso!')
      onClose()
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const selectedCard = cards.find(c => c.id === formData.card_id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Mensalidade' : 'Nova Mensalidade'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
              placeholder="Ex: Netflix, Spotify, Academia..."
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
              <label htmlFor="billing_day">Dia de cobrança</label>
              <input
                type="number"
                id="billing_day"
                name="billing_day"
                min="1"
                max="31"
                value={formData.billing_day}
                onChange={handleChange}
                placeholder="1-31"
                required
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
              required
              disabled={loadingCards}
            >
              <option value="">
                {loadingCards ? 'Carregando cartões...' : 'Selecione um cartão'}
              </option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
            {selectedCard && (
              <small className="form-help">
                Fechamento: dia {selectedCard.closing_day} | Vencimento: dia {selectedCard.due_day}
              </small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Data de início</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_date">Data de término (opcional)</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
                <span>Ativa</span>
              </label>
              <small className="form-help">
                Desmarque para pausar a mensalidade sem excluí-la
              </small>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`auth-button ${loading ? 'loading' : ''}`}
              disabled={loading || loadingCards}
            >
              {loading ? '' : isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
