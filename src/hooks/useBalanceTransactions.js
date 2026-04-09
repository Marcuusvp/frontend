import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBalanceTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchTransactions = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('balance_transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchTransactionsByMonth = useCallback(async (month, year) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Criar datas de início e fim do mês
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`

      const { data, error } = await supabase
        .from('balance_transactions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createTransaction = async (transactionData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('balance_transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) throw error
      setTransactions(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateTransaction = async (id, transactionData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('balance_transactions')
        .update(transactionData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTransactions(prev => prev.map(t => t.id === id ? data : t))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const deleteTransaction = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { error } = await supabase
        .from('balance_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTransactions(prev => prev.filter(t => t.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchTransactionsByMonth,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
