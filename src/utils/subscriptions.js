/**
 * Filtra as assinaturas ativas para um determinado mês/ano
 * @param {Array} subscriptions - Lista de assinaturas
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {Array} Assinaturas ativas no período
 */
export function getSubscriptionsForMonth(subscriptions, month, year) {
  if (!subscriptions || !Array.isArray(subscriptions)) return []

  // Primeiro e último dia do mês em questão
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)

  return subscriptions.filter(sub => {
    // Verifica se está ativa
    if (!sub.active) return false

    // Data de início da assinatura
    const startDate = new Date(sub.start_date + 'T00:00:00')

    // Se a data de início é posterior ao mês atual, não está ativa ainda
    if (startDate > lastDayOfMonth) return false

    // Se tem data de término e já terminou antes deste mês, não está ativa
    if (sub.end_date) {
      const endDate = new Date(sub.end_date + 'T00:00:00')
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
    const endDate = new Date(subscription.end_date + 'T00:00:00')
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
