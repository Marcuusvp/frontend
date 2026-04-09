import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          cards (name, color)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubscriptions(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchSubscriptionsByCard = useCallback(async (cardId) => {
    if (!user || !cardId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubscriptions(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createSubscription = async (subscriptionData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          ...subscriptionData,
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) throw error
      setSubscriptions(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateSubscription = async (id, subscriptionData) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setSubscriptions(prev => prev.map(sub => sub.id === id ? data : sub))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const deleteSubscription = async (id) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSubscriptions(prev => prev.filter(sub => sub.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const toggleSubscriptionActive = async (id, currentActive) => {
    return updateSubscription(id, { active: !currentActive })
  }

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    fetchSubscriptionsByCard,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionActive,
  }
}
