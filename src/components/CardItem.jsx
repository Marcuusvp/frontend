import { Link } from 'react-router-dom'

export function CardItem({ card, onEdit, onDelete }) {
  return (
    <div className="card-item" style={{ borderLeftColor: card.color }}>
      <div className="card-info">
        <h3 className="card-name">{card.name}</h3>
        <div className="card-details">
          <span className="card-detail">
            Fechamento: dia {card.closing_day}
          </span>
          <span className="card-detail">
            Vencimento: dia {card.due_day}
          </span>
        </div>
        <Link to={`/cards/${card.id}/invoice`} className="view-invoice-link">
          Ver fatura →
        </Link>
      </div>
      <div className="card-actions">
        <button
          className="card-action-btn edit"
          onClick={() => onEdit(card)}
          title="Editar"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className="card-action-btn delete"
          onClick={() => onDelete(card)}
          title="Excluir"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
