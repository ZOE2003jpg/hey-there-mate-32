import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Statistics {
  mostLikedCount: number
  recentlyUpdatedCount: number
  quickReadsCount: number
  completedCount: number
}

export function useStatistics() {
  const [statistics, setStatistics] = useState<Statistics>({
    mostLikedCount: 0,
    recentlyUpdatedCount: 0,
    quickReadsCount: 0,
    completedCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      
      // Get most liked stories count (stories with likes > 0)
      const { count: mostLikedCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .gt('like_count', 0)

      // Get recently updated chapters count (updated in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: recentlyUpdatedCount } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('updated_at', sevenDaysAgo.toISOString())

      // Get quick reads count - simplified approach
      // Just count published stories for now, we can refine this later
      const { count: quickReadsCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      // Get published stories count (using published status instead of completed)
      const { count: completedCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      setStatistics({
        mostLikedCount: mostLikedCount || 0,
        recentlyUpdatedCount: recentlyUpdatedCount || 0,
        quickReadsCount: quickReadsCount || 0,
        completedCount: completedCount || 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  // Realtime subscription for statistics updates
  useEffect(() => {
    const channel = supabase
      .channel('statistics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories'
        },
        () => {
          fetchStatistics()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chapters'
        },
        () => {
          fetchStatistics()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    statistics,
    loading,
    error,
    fetchStatistics
  }
}