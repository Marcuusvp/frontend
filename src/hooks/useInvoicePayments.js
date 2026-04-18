import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useInvoicePayments() {
  const [payment, setPayment] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const requestIdRef = useRef(0)

  const fetchPayment = useCallback(async (cardId, month, year) => {
    if (!user || !cardId) return

    const requestId = ++requestIdRef.current

    try {
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('card_id', cardId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

      if (error) throw error

      if (requestId === requestIdRef.current) {
        setPayment(data)
      }

      return data
    } catch (err) {
      if (requestId === requestIdRef.current) {
        console.error('Erro ao buscar pagamento:', err)
      }
      return null
    }
  }, [user])

  const fetchPaymentsForCards = useCallback(async (cardIds) => {
    if (!user || cardIds.length === 0) return []

    try {
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .in('card_id', cardIds)

      if (error) throw error
      setPayments(data || [])
      return data || []
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err)
      return []
    }
  }, [user])

  const markAsPaid = async (cardId, cardName, month, year, amount) => {
    if (!user) return { error: 'Usuário não autenticado' }

    setLoading(true)
    try {
      // 1. Criar transação de saída
      const today = new Date().toISOString().split('T')[0]
      const { data: transaction, error: txError } = await supabase
        .from('balance_transactions')
        .insert([{
          user_id: user.id,
          type: 'expense',
          description: `Pagamento da fatura - ${cardName}`,
          amount,
          date: today,
          category: 'pagamento de fatura',
        }])
        .select()
        .single()

      if (txError) throw txError

      // 2. Criar registro de pagamento
      const { data: paymentData, error: payError } = await supabase
        .from('invoice_payments')
        .insert([{
          user_id: user.id,
          card_id: cardId,
          month,
          year,
          transaction_id: transaction.id,
          amount,
        }])
        .select()
        .single()

      if (payError) {
        // Rollback: deletar a transação criada
        await supabase.from('balance_transactions').delete().eq('id', transaction.id)
        throw payError
      }

      setPayment(paymentData)
      return { data: paymentData, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const unmarkAsPaid = async (cardId, month, year) => {
    if (!user) return { error: 'Usuário não autenticado' }

    setLoading(true)
    try {
      // 1. Buscar registro de pagamento
      const { data: paymentRecord, error: fetchError } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('card_id', cardId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!paymentRecord) return { data: null, error: 'Pagamento não encontrado' }

      // 2. Deletar transação vinculada
      if (paymentRecord.transaction_id) {
        const { error: txDeleteError } = await supabase
          .from('balance_transactions')
          .delete()
          .eq('id', paymentRecord.transaction_id)

        if (txDeleteError) throw txDeleteError
      }

      // 3. Deletar registro de pagamento
      const { error: payDeleteError } = await supabase
        .from('invoice_payments')
        .delete()
        .eq('id', paymentRecord.id)

      if (payDeleteError) throw payDeleteError

      setPayment(null)
      return { data: null, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    payment,
    payments,
    loading,
    fetchPayment,
    fetchPaymentsForCards,
    markAsPaid,
    unmarkAsPaid,
  }
}
