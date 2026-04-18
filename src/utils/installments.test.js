import { describe, it, expect } from 'vitest'
import { calculateInstallments } from './installments'

const card = { closing_day: 10 }

describe('calculateInstallments', () => {
  it('compra antes do fechamento cai no mês atual', () => {
    const purchase = { purchase_date: '2024-04-05', total_amount: 300, installments: 3 }
    const result = calculateInstallments(purchase, card)

    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({ month: 4, year: 2024, installmentNumber: 1 })
    expect(result[1]).toMatchObject({ month: 5, year: 2024, installmentNumber: 2 })
    expect(result[2]).toMatchObject({ month: 6, year: 2024, installmentNumber: 3 })
  })

  it('compra após o fechamento vai para o mês seguinte', () => {
    const purchase = { purchase_date: '2024-04-15', total_amount: 200, installments: 2 }
    const result = calculateInstallments(purchase, card)

    expect(result[0]).toMatchObject({ month: 5, year: 2024 })
    expect(result[1]).toMatchObject({ month: 6, year: 2024 })
  })

  it('compra em dezembro após fechamento vai para janeiro do ano seguinte', () => {
    const purchase = { purchase_date: '2024-12-15', total_amount: 300, installments: 3 }
    const result = calculateInstallments(purchase, card)

    expect(result[0]).toMatchObject({ month: 1, year: 2025 })
    expect(result[1]).toMatchObject({ month: 2, year: 2025 })
    expect(result[2]).toMatchObject({ month: 3, year: 2025 })
  })

  it('virada de ano no meio das parcelas', () => {
    const purchase = { purchase_date: '2024-10-05', total_amount: 300, installments: 4 }
    const result = calculateInstallments(purchase, card)

    expect(result[0]).toMatchObject({ month: 10, year: 2024 })
    expect(result[1]).toMatchObject({ month: 11, year: 2024 })
    expect(result[2]).toMatchObject({ month: 12, year: 2024 })
    expect(result[3]).toMatchObject({ month: 1, year: 2025 })
  })

  it('última parcela absorve o arredondamento e o total bate exato', () => {
    const purchase = { purchase_date: '2024-04-05', total_amount: 100, installments: 3 }
    const result = calculateInstallments(purchase, card)

    const soma = result.reduce((acc, i) => acc + i.amount, 0)
    expect(Math.round(soma * 100) / 100).toBe(100)
    expect(result[2].amount).toBeGreaterThanOrEqual(result[0].amount)
  })

  it('parcela única retorna array com um elemento', () => {
    const purchase = { purchase_date: '2024-04-05', total_amount: 150, installments: 1 }
    const result = calculateInstallments(purchase, card)

    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(150)
  })

  it('compra exatamente no dia do fechamento cai no mês atual', () => {
    const purchase = { purchase_date: '2024-04-10', total_amount: 100, installments: 1 }
    const result = calculateInstallments(purchase, card)

    expect(result[0]).toMatchObject({ month: 4, year: 2024 })
  })

  it('closing_day maior que dias do mês não causa erro', () => {
    const cardFev = { closing_day: 30 }
    const purchase = { purchase_date: '2024-02-15', total_amount: 100, installments: 1 }

    expect(() => calculateInstallments(purchase, cardFev)).not.toThrow()
  })

  it('retorna array vazio se dados obrigatórios estão faltando', () => {
    expect(calculateInstallments({ purchase_date: null, total_amount: 100, installments: 1 }, card)).toEqual([])
    expect(calculateInstallments({ purchase_date: '2024-04-05', total_amount: null, installments: 1 }, card)).toEqual([])
  })
})
