import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { calculateInstallments, getRelevantInvoiceMonth } from '../utils/installments'
import { getSubscriptionsForMonth } from '../utils/subscriptions'

export function useDashboard() {
  const [cards, setCards] = useState([])
  const [purchases, setPurchases] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [transactions, setTransactions] = useState([])
  const [invoicePayments, setInvoicePayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const [
        { data: cardsData, error: cardsError },
        { data: purchasesData, error: purchasesError },
        { data: subscriptionsData, error: subscriptionsError },
        { data: transactionsData, error: transactionsError },
      ] = await Promise.all([
        supabase
          .from('cards')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('purchases')
          .select('*'),
        supabase
          .from('subscriptions')
          .select('*'),
        supabase
          .from('balance_transactions')
          .select('*')
          .order('date', { ascending: false }),
      ])

      const firstError = cardsError || purchasesError || subscriptionsError || transactionsError
      if (firstError) throw firstError

      let paymentsData = []
      if (cardsData?.length > 0) {
        const { data, error: paymentsError } = await supabase
          .from('invoice_payments')
          .select('*')
          .in('card_id', cardsData.map(c => c.id))

        if (paymentsError) throw paymentsError
        paymentsData = data || []
      }

      setCards(cardsData || [])
      setPurchases(purchasesData || [])
      setSubscriptions(subscriptionsData || [])
      setTransactions(transactionsData || [])
      setInvoicePayments(paymentsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Calcula saldo atual (todas as transações)
  const currentBalance = useMemo(() => {
    return transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount)
    }, 0)
  }, [transactions])

  // Calcula fatura de um cartão para um mês/ano
  const calculateCardInvoice = useCallback((cardId, month, year) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return { total: 0, purchases: [], subscriptions: [] }

    const cardPurchases = purchases.filter(p => p.card_id === cardId)
    const purchaseItems = []

    cardPurchases.forEach(purchase => {
      const installments = calculateInstallments(purchase, card)
      const currentInstallment = installments.find(
        inst => inst.month === month && inst.year === year
      )

      if (currentInstallment) {
        purchaseItems.push({
          ...purchase,
          installmentAmount: currentInstallment.amount,
          installmentNumber: currentInstallment.installmentNumber,
        })
      }
    })

    const cardSubscriptions = subscriptions.filter(s => s.card_id === cardId)
    const activeSubscriptions = getSubscriptionsForMonth(cardSubscriptions, month, year)

    const totalPurchases = purchaseItems.reduce((sum, item) => sum + item.installmentAmount, 0)
    const totalSubscriptions = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0)

    return {
      total: totalPurchases + totalSubscriptions,
      purchases: purchaseItems,
      subscriptions: activeSubscriptions,
    }
  }, [cards, purchases, subscriptions])

  // Dados consolidados com mês relevante por cartão
  const dashboardData = useMemo(() => {
    // Para cada cartão, determina o mês relevante e calcula a fatura
    const cardInvoices = cards.map(card => {
      const { month, year } = getRelevantInvoiceMonth(card)
      const invoice = calculateCardInvoice(card.id, month, year)

      // Verifica se a fatura está paga
      const isPaid = invoicePayments.some(
        p => p.card_id === card.id && p.month === month && p.year === year
      )

      return {
        card,
        ...invoice,
        invoiceMonth: month,
        invoiceYear: year,
        isPaid,
      }
    })

    // Total apenas de faturas em aberto (não pagas)
    const totalInvoices = cardInvoices
      .filter(item => !item.isPaid)
      .reduce((sum, item) => sum + item.total, 0)

    const monthResult = currentBalance - totalInvoices

    return {
      cardInvoices,
      totalInvoices,
      monthResult,
    }
  }, [cards, calculateCardInvoice, invoicePayments, currentBalance])

  return {
    cards,
    transactions,
    currentBalance,
    loading,
    error,
    fetchDashboardData,
    ...dashboardData,
  }
}
