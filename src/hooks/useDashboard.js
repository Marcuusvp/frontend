import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { calculateInstallments } from '../utils/installments'
import { getSubscriptionsForMonth } from '../utils/subscriptions'

export function useDashboard() {
  const [cards, setCards] = useState([])
  const [purchases, setPurchases] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Buscar cartões
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (cardsError) throw cardsError

      // Buscar compras
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')

      if (purchasesError) throw purchasesError

      // Buscar mensalidades
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')

      if (subscriptionsError) throw subscriptionsError

      // Buscar transações de saldo (últimas 5)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('balance_transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(5)

      if (transactionsError) throw transactionsError

      setCards(cardsData || [])
      setPurchases(purchasesData || [])
      setSubscriptions(subscriptionsData || [])
      setTransactions(transactionsData || [])
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

  // Calcula fatura de um cartão específico para um mês/ano
  const calculateCardInvoice = useCallback((cardId, month, year) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return { total: 0, purchases: [], subscriptions: [] }

    // Compras do cartão
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

    // Mensalidades do cartão
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

  // Retorna dados consolidados para um mês específico
  const getMonthData = useCallback((month, year) => {
    // Faturas por cartão
    const cardInvoices = cards.map(card => {
      const invoice = calculateCardInvoice(card.id, month, year)
      return {
        card,
        ...invoice,
      }
    })

    // Total de todas as faturas
    const totalInvoices = cardInvoices.reduce((sum, item) => sum + item.total, 0)

    // Resultado do mês (saldo - faturas)
    const monthResult = currentBalance - totalInvoices

    return {
      cardInvoices,
      totalInvoices,
      monthResult,
    }
  }, [cards, currentBalance, calculateCardInvoice])

  // Estado para mês/ano atual do dashboard
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())

  // Dados do mês atual
  const currentMonthData = useMemo(() => {
    return getMonthData(currentMonth, currentYear)
  }, [getMonthData, currentMonth, currentYear])

  // Função para mudar o mês
  const changeMonth = useCallback((month, year) => {
    setCurrentMonth(month)
    setCurrentYear(year)
  }, [])

  return {
    cards,
    transactions,
    currentBalance,
    currentMonth,
    currentYear,
    loading,
    error,
    fetchDashboardData,
    getMonthData,
    changeMonth,
    ...currentMonthData,
  }
}
