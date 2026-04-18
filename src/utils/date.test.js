import { describe, it, expect } from 'vitest'
import { parseSupabaseDate, isDateInMonth, isDateBefore, isDateAfter } from './date'

describe('parseSupabaseDate', () => {
  it('faz parse de data simples sem shift de timezone', () => {
    const date = parseSupabaseDate('2024-03-15')
    expect(date.getDate()).toBe(15)
    expect(date.getMonth()).toBe(2)
    expect(date.getFullYear()).toBe(2024)
  })

  it('retorna null para input nulo', () => {
    expect(parseSupabaseDate(null)).toBeNull()
    expect(parseSupabaseDate(undefined)).toBeNull()
    expect(parseSupabaseDate('')).toBeNull()
  })

  it('aceita ISO 8601 com hora', () => {
    const date = parseSupabaseDate('2024-03-15T10:30:00')
    expect(date).toBeInstanceOf(Date)
    expect(date.getFullYear()).toBe(2024)
  })
})

describe('isDateInMonth', () => {
  it('retorna true para data dentro do mês', () => {
    expect(isDateInMonth('2024-06-15', 6, 2024)).toBe(true)
  })

  it('retorna false para mês diferente', () => {
    expect(isDateInMonth('2024-07-01', 6, 2024)).toBe(false)
  })

  it('retorna false para ano diferente', () => {
    expect(isDateInMonth('2023-06-15', 6, 2024)).toBe(false)
  })

  it('retorna false para data nula', () => {
    expect(isDateInMonth(null, 6, 2024)).toBe(false)
  })
})

describe('isDateBefore', () => {
  it('retorna true para data anterior', () => {
    expect(isDateBefore('2024-01-15', new Date('2024-06-01'))).toBe(true)
  })

  it('retorna false para data posterior', () => {
    expect(isDateBefore('2024-12-15', new Date('2024-06-01'))).toBe(false)
  })
})

describe('isDateAfter', () => {
  it('retorna true para data posterior', () => {
    expect(isDateAfter('2024-12-15', new Date('2024-06-01'))).toBe(true)
  })

  it('retorna false para data anterior', () => {
    expect(isDateAfter('2024-01-15', new Date('2024-06-01'))).toBe(false)
  })
})
