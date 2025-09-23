import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface WriterStats {
  totalStories: number
  totalReads: number
  totalLikes: number
  totalComments: number
  totalFollowers: number
  averageRating: number
  joinedDate: string
}

export function useWriterStats(userId?: string) {
  const [stats, setStats] = useState<WriterStats>({
    totalStories: 0,
    totalReads: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollowers: 0,
    averageRating: 0,
    joinedDate: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    if (!userId) return

    try {
      setLoading(true)

      // Get user profile for join date
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', userId)
        .single()

      // Get stories stats
      const { data: stories } = await supabase
        .from('stories')
        .select('view_count, like_count, comment_count')
        .eq('author_id', userId)

      // Get follower count (this would need a followers table in a real app)
      // For now, we'll use a placeholder
      const totalFollowers = 0

      if (stories) {
        const totalStories = stories.length
        const totalReads = stories.reduce((sum, story) => sum + (story.view_count || 0), 0)
        const totalLikes = stories.reduce((sum, story) => sum + (story.like_count || 0), 0)
        const totalComments = stories.reduce((sum, story) => sum + (story.comment_count || 0), 0)
        
        // Calculate average rating (placeholder for now)
        const averageRating = totalLikes > 0 ? Math.min(5, 3 + (totalLikes / totalStories / 100)) : 0

        setStats({
          totalStories,
          totalReads,
          totalLikes,
          totalComments,
          totalFollowers,
          averageRating: parseFloat(averageRating.toFixed(1)),
          joinedDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }) : ''
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch writer stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [userId])

  return { stats, loading, error, fetchStats }
}