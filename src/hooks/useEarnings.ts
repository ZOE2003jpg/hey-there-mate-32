import { useState, useEffect } from 'react'

export interface Earning {
  id: string
  writer_id: string
  story_id: string | null
  amount: number
  currency: string
  source: string | null
  created_at: string
  stories?: {
    title: string
  }
}

// Mock earnings data since earnings table doesn't exist
const mockEarnings: Earning[] = [
  {
    id: '1',
    writer_id: '1',
    story_id: '1',
    amount: 25.50,
    currency: 'USD',
    source: 'Story views',
    created_at: new Date().toISOString(),
    stories: { title: 'Sample Story' }
  },
  {
    id: '2',
    writer_id: '1',
    story_id: '1',
    amount: 15.75,
    currency: 'USD',
    source: 'Premium reads',
    created_at: new Date().toISOString(),
    stories: { title: 'Sample Story' }
  }
]

export function useEarnings(writerId?: string) {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalEarnings, setTotalEarnings] = useState(0)

  const fetchEarnings = async () => {
    if (!writerId) {
      setEarnings([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Mock fetch with delay
      setTimeout(() => {
        const writerEarnings = mockEarnings.filter(e => e.writer_id === writerId)
        setEarnings(writerEarnings)
        
        // Calculate total earnings
        const total = writerEarnings.reduce((sum, earning) => sum + Number(earning.amount), 0)
        setTotalEarnings(total)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings')
      setLoading(false)
    }
  }

  const addEarning = async (earningData: {
    writer_id: string
    story_id?: string
    amount: number
    currency?: string
    source?: string
  }) => {
    try {
      const newEarning: Earning = {
        id: Date.now().toString(),
        writer_id: earningData.writer_id,
        story_id: earningData.story_id || null,
        amount: earningData.amount,
        currency: earningData.currency || 'USD',
        source: earningData.source || null,
        created_at: new Date().toISOString()
      }
      setEarnings(prev => [newEarning, ...prev])
      setTotalEarnings(prev => prev + earningData.amount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add earning')
      throw err
    }
  }

  const getEarningsByMonth = () => {
    const monthlyEarnings: { [key: string]: number } = {}
    
    earnings.forEach(earning => {
      const date = new Date(earning.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyEarnings[monthKey] = (monthlyEarnings[monthKey] || 0) + Number(earning.amount)
    })

    return Object.entries(monthlyEarnings).map(([month, amount]) => ({
      month,
      amount
    }))
  }

  const getEarningsBySource = () => {
    const sourceEarnings: { [key: string]: number } = {}
    
    earnings.forEach(earning => {
      const source = earning.source || 'Other'
      sourceEarnings[source] = (sourceEarnings[source] || 0) + Number(earning.amount)
    })

    return Object.entries(sourceEarnings).map(([source, amount]) => ({
      source,
      amount
    }))
  }

  useEffect(() => {
    fetchEarnings()
  }, [writerId])

  return {
    earnings,
    loading,
    error,
    totalEarnings,
    fetchEarnings,
    addEarning,
    getEarningsByMonth,
    getEarningsBySource
  }
}