import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePurchases() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchPurchasesByCard = useCallback(async (cardId) => {
    if (!user || !cardId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('card_id', cardId)
        .order('purchase_date', { ascending: false })

      if (error) throw error
      setPurchases(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createPurchase = async (purchaseData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([{
          ...purchaseData,
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) throw error
      setPurchases(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updatePurchase = async (id, purchaseData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('purchases')
        .update(purchaseData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPurchases(prev => prev.map(purchase => purchase.id === id ? data : purchase))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const deletePurchase = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPurchases(prev => prev.filter(purchase => purchase.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  return {
    purchases,
    loading,
    error,
    fetchPurchasesByCard,
    createPurchase,
    updatePurchase,
    deletePurchase,
  }
}
