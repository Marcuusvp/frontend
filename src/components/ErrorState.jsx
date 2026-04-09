import { getFriendlyErrorMessage } from '../utils/errors'

export function ErrorState({ error, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e74c3c"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3>Ops! Algo deu errado</h3>
      <p>{getFriendlyErrorMessage(error)}</p>
      {onRetry && (
        <button className="btn-primary" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
