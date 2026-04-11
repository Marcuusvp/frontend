/**
 * Calcula as parcelas de uma compra considerando o dia de fechamento do cartão
 * @param {Object} purchase - Dados da compra
 * @param {string} purchase.purchase_date - Data da compra (YYYY-MM-DD)
 * @param {number} purchase.total_amount - Valor total da compra
 * @param {number} purchase.installments - Número de parcelas
 * @param {Object} card - Dados do cartão
 * @param {number} card.closing_day - Dia de fechamento (1-31)
 * @returns {Array} Array de objetos { month, year, amount, installmentNumber }
 */
export function calculateInstallments(purchase, card) {
  const { purchase_date, total_amount, installments } = purchase
  const { closing_day } = card

  if (!purchase_date || !total_amount || !installments || !closing_day) {
    return []
  }

  const purchaseDate = new Date(purchase_date + 'T00:00:00')
  const purchaseDay = purchaseDate.getDate()
  const purchaseMonth = purchaseDate.getMonth() // 0-11
  const purchaseYear = purchaseDate.getFullYear()

  // Determina o mês da primeira parcela
  // Se a compra foi feita APÓS o dia de fechamento, vai para o mês seguinte
  let firstInstallmentMonth = purchaseMonth
  let firstInstallmentYear = purchaseYear

  // Ajusta o dia de fechamento para o mês da compra (considerando meses com menos dias)
  const daysInPurchaseMonth = new Date(purchaseYear, purchaseMonth + 1, 0).getDate()
  const effectiveClosingDay = Math.min(closing_day, daysInPurchaseMonth)

  if (purchaseDay > effectiveClosingDay) {
    firstInstallmentMonth++
    if (firstInstallmentMonth > 11) {
      firstInstallmentMonth = 0
      firstInstallmentYear++
    }
  }

  // Calcula o valor de cada parcela
  // Arredonda para 2 casas decimais
  const baseAmount = Math.floor((total_amount / installments) * 100) / 100
  const totalBase = baseAmount * (installments - 1)
  const lastAmount = Math.round((total_amount - totalBase) * 100) / 100

  const result = []

  for (let i = 0; i < installments; i++) {
    let month = firstInstallmentMonth + i
    let year = firstInstallmentYear

    // Ajusta para virada de ano
    while (month > 11) {
      month -= 12
      year++
    }

    const amount = i === installments - 1 ? lastAmount : baseAmount

    result.push({
      month: month + 1, // Converter para 1-12
      year,
      amount,
      installmentNumber: i + 1,
    })
  }

  return result
}

/**
 * Formata o valor monetário
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata o nome do mês
 * @param {number} month - Mês (1-12)
 * @returns {string}
 */
export function formatMonth(month) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return months[month - 1]
}

/**
 * Retorna o mês e ano atual
 * @returns {Object} { month, year }
 */
export function getCurrentMonthYear() {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

/**
 * Determina o mês/ano da fatura relevante para um cartão
 * Se hoje passou do dia de fechamento, retorna o mês seguinte (fatura que está acumulando)
 * Caso contrário, retorna o mês atual (fatura aberta)
 * @param {Object} card - Dados do cartão com closing_day
 * @returns {Object} { month, year }
 */
export function getRelevantInvoiceMonth(card) {
  const now = new Date()
  const today = now.getDate()

  // Ajusta o closing_day para o mês atual (meses com menos dias)
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const effectiveClosingDay = Math.min(card.closing_day, daysInCurrentMonth)

  if (today > effectiveClosingDay) {
    // Após fechamento → mostra fatura do mês seguinte
    let month = now.getMonth() + 2 // +1 (1-indexed) +1 (next month)
    let year = now.getFullYear()
    if (month > 12) {
      month = 1
      year++
    }
    return { month, year }
  }

  // Antes do fechamento → mostra fatura do mês atual
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}
