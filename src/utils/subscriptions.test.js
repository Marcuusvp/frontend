import { describe, it, expect } from 'vitest'
import { getSubscriptionsForMonth, getSubscriptionStatus } from './subscriptions'

const subBase = {
  active: true,
  start_date: '2024-01-01',
  end_date: null,
  amount: 50,
  billing_day: 5,
}

describe('getSubscriptionsForMonth', () => {
  it('retorna assinatura ativa sem data de término', () => {
    expect(getSubscriptionsForMonth([subBase], 6, 2024)).toHaveLength(1)
  })

  it('não retorna assinatura com active = false', () => {
    const paused = { ...subBase, active: false }
    expect(getSubscriptionsForMonth([paused], 6, 2024)).toHaveLength(0)
  })

  it('não retorna se start_date é posterior ao mês alvo', () => {
    const future = { ...subBase, start_date: '2024-08-01' }
    expect(getSubscriptionsForMonth([future], 6, 2024)).toHaveLength(0)
  })

  it('retorna se start_date é exatamente o primeiro dia do mês alvo', () => {
    const exact = { ...subBase, start_date: '2024-06-01' }
    expect(getSubscriptionsForMonth([exact], 6, 2024)).toHaveLength(1)
  })

  it('não retorna se end_date terminou antes do mês alvo', () => {
    const ended = { ...subBase, end_date: '2024-05-31' }
    expect(getSubscriptionsForMonth([ended], 6, 2024)).toHaveLength(0)
  })

  it('retorna se end_date é dentro do mês alvo', () => {
    const endingMidMonth = { ...subBase, end_date: '2024-06-15' }
    expect(getSubscriptionsForMonth([endingMidMonth], 6, 2024)).toHaveLength(1)
  })

  it('retorna se end_date é o último dia do mês alvo', () => {
    const endingLastDay = { ...subBase, end_date: '2024-06-30' }
    expect(getSubscriptionsForMonth([endingLastDay], 6, 2024)).toHaveLength(1)
  })

  it('retorna array vazio para lista vazia', () => {
    expect(getSubscriptionsForMonth([], 6, 2024)).toEqual([])
  })

  it('retorna array vazio para input inválido', () => {
    expect(getSubscriptionsForMonth(null, 6, 2024)).toEqual([])
    expect(getSubscriptionsForMonth(undefined, 6, 2024)).toEqual([])
  })

  it('filtra corretamente múltiplas assinaturas', () => {
    const subs = [
      subBase,
      { ...subBase, active: false },
      { ...subBase, end_date: '2024-05-01' },
      { ...subBase, start_date: '2024-07-01' },
    ]
    expect(getSubscriptionsForMonth(subs, 6, 2024)).toHaveLength(1)
  })
})

describe('getSubscriptionStatus', () => {
  it('retorna "active" para assinatura ativa sem fim', () => {
    expect(getSubscriptionStatus(subBase)).toBe('active')
  })

  it('retorna "paused" para active = false', () => {
    expect(getSubscriptionStatus({ ...subBase, active: false })).toBe('paused')
  })

  it('retorna "ended" para assinatura com end_date no passado', () => {
    const ended = { ...subBase, end_date: '2020-01-01' }
    expect(getSubscriptionStatus(ended)).toBe('ended')
  })

  it('retorna "active" para end_date no futuro', () => {
    const future = { ...subBase, end_date: '2099-12-31' }
    expect(getSubscriptionStatus(future)).toBe('active')
  })
})
