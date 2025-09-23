import { useState, useEffect } from 'react'

export interface AnalyticsData {
  id: string
  story_id: string | null
  chapter_id: string | null
  user_id: string | null
  event_type: string
  metadata: any
  created_at: string
}

// Mock analytics data since analytics table doesn't exist
const mockAnalytics: AnalyticsData[] = [
  {
    id: '1',
    story_id: '1',
    chapter_id: null,
    user_id: '1',
    event_type: 'view',
    metadata: {},
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    story_id: '1',
    chapter_id: '1',
    user_id: '2',
    event_type: 'like',
    metadata: {},
    created_at: new Date().toISOString()
  }
]

export function useAnalytics(authorId?: string) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!authorId) {
      setAnalytics([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Mock fetch with delay
      setTimeout(() => {
        setAnalytics(mockAnalytics)
        setLoading(false)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      setLoading(false)
    }
  }

  const trackEvent = async (eventData: {
    story_id?: string
    chapter_id?: string
    user_id?: string
    event_type: string
    metadata?: any
  }) => {
    try {
      // Mock tracking - in real app this would store in database
      const newEvent: AnalyticsData = {
        id: Date.now().toString(),
        story_id: eventData.story_id || null,
        chapter_id: eventData.chapter_id || null,
        user_id: eventData.user_id || null,
        event_type: eventData.event_type,
        metadata: eventData.metadata || {},
        created_at: new Date().toISOString()
      }
      setAnalytics(prev => [newEvent, ...prev])
    } catch (err) {
      console.error('Failed to track event:', err)
    }
  }

  const getStoryStats = async (storyId: string) => {
    try {
      // Mock stats calculation
      const storyEvents = mockAnalytics.filter(d => d.story_id === storyId)
      
      const stats = {
        views: storyEvents.filter(d => d.event_type === 'view').length || 0,
        likes: storyEvents.filter(d => d.event_type === 'like').length || 0,
        comments: storyEvents.filter(d => d.event_type === 'comment').length || 0,
        shares: storyEvents.filter(d => d.event_type === 'share').length || 0,
      }

      return stats
    } catch (err) {
      console.error('Failed to get story stats:', err)
      return { views: 0, likes: 0, comments: 0, shares: 0 }
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [authorId])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    trackEvent,
    getStoryStats
  }
}