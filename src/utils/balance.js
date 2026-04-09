import { formatCurrency } from './installments'
export { formatCurrency }

/**
 * Filtra transações por mês e ano
 * @param {Array} transactions - Lista de transações
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {Array} Transações do mês
 */
export function filterTransactionsByMonth(transactions, month, year) {
  if (!transactions || !Array.isArray(transactions)) return []

  return transactions.filter(t => {
    const date = new Date(t.date + 'T00:00:00')
    return date.getMonth() + 1 === month && date.getFullYear() === year
  })
}

/**
 * Calcula o total de entradas (income) de uma lista de transações
 * @param {Array} transactions
 * @returns {number} Total de entradas
 */
export function calculateTotalIncome(transactions) {
  if (!transactions || !Array.isArray(transactions)) return 0

  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
}

/**
 * Calcula o total de saídas (expense) de uma lista de transações
 * @param {Array} transactions
 * @returns {number} Total de saídas
 */
export function calculateTotalExpense(transactions) {
  if (!transactions || !Array.isArray(transactions)) return 0

  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
}

/**
 * Calcula o saldo (entradas - saídas)
 * @param {Array} transactions
 * @returns {number} Saldo
 */
export function calculateBalance(transactions) {
  if (!transactions || !Array.isArray(transactions)) return 0

  return calculateTotalIncome(transactions) - calculateTotalExpense(transactions)
}

/**
 * Retorna o label traduzido do tipo de transação
 * @param {string} type - 'income' ou 'expense'
 * @returns {string}
 */
export function getTransactionTypeLabel(type) {
  const labels = {
    income: 'Entrada',
    expense: 'Saída',
  }
  return labels[type] || type
}

/**
 * Retorna a cor associada ao tipo de transação
 * @param {string} type - 'income' ou 'expense'
 * @returns {string} Cor hexadecimal
 */
export function getTransactionTypeColor(type) {
  const colors = {
    income: '#2ecc71',  // Verde
    expense: '#e74c3c', // Vermelho
  }
  return colors[type] || '#666'
}

/**
 * Retorna o ícone associado ao tipo de transação
 * @param {string} type - 'income' ou 'expense'
 * @returns {string} SVG path
 */
export function getTransactionTypeIcon(type) {
  if (type === 'income') {
    // Seta para cima
    return 'M7 14l5-5 5 5M12 3v11'
  }
  // Seta para baixo
  return 'M7 10l5 5 5-5M12 21v-11'
}

/**
 * Formata o valor com sinal (+ ou -)
 * @param {number} value
 * @param {string} type - 'income' ou 'expense'
 * @returns {string}
 */
export function formatSignedCurrency(value, type) {
  const formatted = formatCurrency(value)
  return type === 'income' ? `+${formatted}` : `-${formatted}`
}
