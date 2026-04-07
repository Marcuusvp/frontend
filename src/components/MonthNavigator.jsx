import { formatMonth } from '../utils/installments'

export function MonthNavigator({ month, year, onPrevMonth, onNextMonth }) {
  return (
    <div className="month-navigator">
      <button
        className="month-nav-btn"
        onClick={onPrevMonth}
        title="Mês anterior"
      >
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="month-display">
        <span className="month-name">{formatMonth(month)}</span>
        <span className="month-year">{year}</span>
      </div>

      <button
        className="month-nav-btn"
        onClick={onNextMonth}
        title="Próximo mês"
      >
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
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
