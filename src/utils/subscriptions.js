import { parseSupabaseDate } from './date'

/**
 * Filtra as assinaturas ativas para um determinado mês/ano
 */
export function getSubscriptionsForMonth(subscriptions, month, year) {
  if (!subscriptions || !Array.isArray(subscriptions)) return []

  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)

  return subscriptions.filter(sub => {
    if (!sub.active) return false

    const startDate = parseSupabaseDate(sub.start_date)
    if (startDate > lastDayOfMonth) return false

    if (sub.end_date) {
      const endDate = parseSupabaseDate(sub.end_date)
      if (endDate < firstDayOfMonth) return false
    }

    return true
  })
}

/**
 * Determina o status de uma assinatura para exibição
 * @param {Object} subscription - Assinatura
 * @returns {string} Status: 'active', 'paused', 'ended'
 */
import { formatCurrency } from './installments'
export { formatCurrency }

export function getSubscriptionStatus(subscription) {
  if (!subscription.active) return 'paused'

  if (subscription.end_date) {
    const endDate = parseSupabaseDate(subscription.end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (endDate < today) return 'ended'
  }

  return 'active'
}

/**
 * Retorna label traduzido do status
 * @param {string} status
 * @returns {string}
 */
export function getSubscriptionStatusLabel(status) {
  const labels = {
    active: 'Ativa',
    paused: 'Pausada',
    ended: 'Encerrada',
  }
  return labels[status] || status
}

/**
 * Calcula o total de mensalidades para um mês específico
 * @param {Array} subscriptions
 * @param {number} month
 * @param {number} year
 * @returns {number} Valor total
 */
export function calculateSubscriptionsTotal(subscriptions, month, year) {
  const activeSubscriptions = getSubscriptionsForMonth(subscriptions, month, year)
  return activeSubscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0)
}
