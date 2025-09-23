import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Earning {
  id: string
  user_id: string
  amount: number
  source: 'ad_revenue' | 'tips' | 'promotions'
  story_id?: string
  chapter_id?: string
  earned_at: string
  created_at: string
}

export interface Payout {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  method: 'paypal' | 'bank_transfer'
  requested_at: string
  processed_at?: string
  created_at: string
}

export interface EarningsStats {
  availableBalance: number
  totalEarnings: number
  thisMonthEarnings: number
  revenueBreakdown: {
    source: string
    amount: number
    percentage: number
  }[]
}

export function useEarnings(userId?: string) {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [stats, setStats] = useState<EarningsStats>({
    availableBalance: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    revenueBreakdown: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEarnings = async () => {
    if (!userId) return

    try {
      setLoading(true)
      
      // Fetch earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (earningsError) throw earningsError

      // Fetch payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })

      if (payoutsError) throw payoutsError

      setEarnings((earningsData || []).map(e => ({
        ...e,
        source: e.source as 'ad_revenue' | 'tips' | 'promotions'
      })))
      setPayouts((payoutsData || []).map(p => ({
        ...p,
        status: p.status as 'pending' | 'completed' | 'failed',
        method: p.method as 'paypal' | 'bank_transfer'
      })))

      // Calculate stats
      const totalEarnings = (earningsData || []).reduce((sum, earning) => sum + Number(earning.amount), 0)
      const completedPayouts = (payoutsData || []).filter(p => p.status === 'completed').reduce((sum, payout) => sum + Number(payout.amount), 0)
      const availableBalance = totalEarnings - completedPayouts

      // This month earnings
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const thisMonthEarnings = (earningsData || [])
        .filter(earning => new Date(earning.earned_at) >= thisMonth)
        .reduce((sum, earning) => sum + Number(earning.amount), 0)

      // Revenue breakdown
      const sourceGroups = (earningsData || []).reduce((acc, earning) => {
        const source = earning.source
        acc[source] = (acc[source] || 0) + Number(earning.amount)
        return acc
      }, {} as Record<string, number>)

      const revenueBreakdown = Object.entries(sourceGroups).map(([source, amount]) => ({
        source: source === 'ad_revenue' ? 'Ad Revenue Share' : 
                source === 'tips' ? 'Premium Reader Tips' : 'Story Promotions',
        amount: amount,
        percentage: totalEarnings > 0 ? Math.round((amount / totalEarnings) * 100) : 0
      }))

      setStats({
        availableBalance,
        totalEarnings,
        thisMonthEarnings,
        revenueBreakdown
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings')
    } finally {
      setLoading(false)
    }
  }

  const createPayoutRequest = async (amount: number, method: 'paypal' | 'bank_transfer') => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('payouts')
        .insert({
          user_id: userId,
          amount,
          method,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      
      await fetchEarnings() // Refresh data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payout request')
      throw err
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [userId])

  return {
    earnings,
    payouts,
    stats,
    loading,
    error,
    fetchEarnings,
    createPayoutRequest
  }
}