/**
 * Faz parse seguro de datas vindas do Supabase.
 *
 * Datas simples (YYYY-MM-DD) são interpretadas pelo JS como UTC,
 * o que causa um shift de um dia em fusos negativos (ex: Brasil GMT-3).
 * Adicionar T00:00:00 força a interpretação como horário local.
 *
 * @param {string|null} dateStr - Data no formato YYYY-MM-DD ou ISO 8601
 * @returns {Date|null}
 */
export function parseSupabaseDate(dateStr) {
  if (!dateStr) return null
  if (dateStr.includes('T')) return new Date(dateStr)
  return new Date(dateStr + 'T00:00:00')
}

/**
 * Verifica se uma data pertence a um mês/ano específico.
 */
export function isDateInMonth(dateStr, month, year) {
  const date = parseSupabaseDate(dateStr)
  if (!date) return false
  return date.getMonth() + 1 === month && date.getFullYear() === year
}

/**
 * Retorna true se dateStr é anterior a referenceDate.
 */
export function isDateBefore(dateStr, referenceDate) {
  const date = parseSupabaseDate(dateStr)
  if (!date) return false
  return date < referenceDate
}

/**
 * Retorna true se dateStr é posterior a referenceDate.
 */
export function isDateAfter(dateStr, referenceDate) {
  const date = parseSupabaseDate(dateStr)
  if (!date) return false
  return date > referenceDate
}
