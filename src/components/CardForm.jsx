import { useState } from 'react'
import { toast } from 'sonner'

const PRESET_COLORS = [
  '#57449a', // Primary purple
  '#2f363f', // Dark carbon
  '#d9d7ef', // Light lilac
  '#e74c3c', // Red
  '#3498db', // Blue
  '#2ecc71', // Green
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Teal
  '#34495e', // Dark blue
]

const getInitialFormData = (card) => ({
  name: card?.name ?? '',
  closing_day: card?.closing_day ?? '',
  due_day: card?.due_day ?? '',
  color: card?.color ?? '#57449a',
})

export function CardForm({ card, onClose, onSubmit }) {
  const [formData, setFormData] = useState(() => getInitialFormData(card))
  const [loading, setLoading] = useState(false)
  const isEditing = !!card

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validações
    if (!formData.name.trim()) {
      toast.error('O nome do cartão é obrigatório')
      return
    }

    const closingDay = parseInt(formData.closing_day)
    const dueDay = parseInt(formData.due_day)

    if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) {
      toast.error('O dia de fechamento deve estar entre 1 e 31')
      return
    }

    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      toast.error('O dia de vencimento deve estar entre 1 e 31')
      return
    }

    setLoading(true)

    const dataToSubmit = {
      name: formData.name.trim(),
      closing_day: closingDay,
      due_day: dueDay,
      color: formData.color,
    }

    const result = await onSubmit(dataToSubmit)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isEditing ? 'Cartão atualizado com sucesso!' : 'Cartão criado com sucesso!')
      onClose()
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Cartão' : 'Novo Cartão'}</h2>
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
            <label htmlFor="name">Nome do cartão</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Nubank, Itaú, etc."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="closing_day">Dia de fechamento</label>
              <input
                type="number"
                id="closing_day"
                name="closing_day"
                min="1"
                max="31"
                value={formData.closing_day}
                onChange={handleChange}
                placeholder="1-31"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="due_day">Dia de vencimento</label>
              <input
                type="number"
                id="due_day"
                name="due_day"
                min="1"
                max="31"
                value={formData.due_day}
                onChange={handleChange}
                placeholder="1-31"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Cor do cartão</label>
            <div className="color-picker">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`auth-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? '' : isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
