import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface AnalyticsData {
  id: string
  story_id: string | null
  chapter_id: string | null
  user_id: string | null
  event_type: string
  metadata: any
  created_at: string
}

export interface WriterStats {
  total_reads: number
  total_likes: number
  total_comments: number
  total_followers: number
  completion_rate: number
  avg_reading_time: number
}

export function useAnalytics(authorId?: string) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [writerStats, setWriterStats] = useState<WriterStats>({
    total_reads: 0,
    total_likes: 0,
    total_comments: 0,
    total_followers: 0,
    completion_rate: 0,
    avg_reading_time: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!authorId) {
      setAnalytics([])
      setWriterStats({
        total_reads: 0,
        total_likes: 0,
        total_comments: 0,
        total_followers: 0,
        completion_rate: 0,
        avg_reading_time: 0
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // First get story IDs for this author
      const { data: storyIds, error: storiesError } = await supabase
        .from('stories')
        .select('id')
        .eq('author_id', authorId)

      if (storiesError) throw storiesError

      const storyIdArray = (storyIds || []).map(story => story.id)

      // Fetch analytics events for stories authored by this user
      let analyticsData = []
      if (storyIdArray.length > 0) {
        const { data, error: analyticsError } = await supabase
          .from('analytics_events')
          .select('*')
          .in('story_id', storyIdArray)
          .order('created_at', { ascending: false })

        if (analyticsError) throw analyticsError
        analyticsData = data || []
      }

      // Fetch writer stats
      const { data: statsData, error: statsError } = await supabase
        .from('writer_stats')
        .select('*')
        .eq('user_id', authorId)
        .maybeSingle()

      if (statsError && statsError.code !== 'PGRST116') throw statsError

      setAnalytics(analyticsData)
      setWriterStats(statsData ? {
        total_reads: statsData.total_reads || 0,
        total_likes: statsData.total_likes || 0,
        total_comments: statsData.total_comments || 0,
        total_followers: statsData.total_followers || 0,
        completion_rate: Number(statsData.completion_rate) || 0,
        avg_reading_time: statsData.avg_reading_time || 0
      } : {
        total_reads: 0,
        total_likes: 0,
        total_comments: 0,
        total_followers: 0,
        completion_rate: 0,
        avg_reading_time: 0
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      console.error('Analytics fetch error:', err)
    } finally {
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
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          story_id: eventData.story_id || null,
          chapter_id: eventData.chapter_id || null,
          user_id: eventData.user_id || null,
          event_type: eventData.event_type,
          metadata: eventData.metadata || {}
        })

      if (error) throw error

      // Refresh analytics after tracking
      await fetchAnalytics()
    } catch (err) {
      console.error('Failed to track event:', err)
    }
  }

  const getStoryStats = async (storyId: string) => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type')
        .eq('story_id', storyId)

      if (error) throw error

      const events = data || []
      const stats = {
        views: events.filter(d => d.event_type === 'view').length,
        likes: events.filter(d => d.event_type === 'like').length,
        comments: events.filter(d => d.event_type === 'comment').length,
        shares: events.filter(d => d.event_type === 'share').length,
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
    analytics: writerStats, // Return aggregated stats instead of raw events
    loading,
    error,
    fetchAnalytics,
    trackEvent,
    getStoryStats,
    writerStats
  }
}