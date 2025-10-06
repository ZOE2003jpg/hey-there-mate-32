import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ReactionStats {
  totalReactions: number
  topReaction: string | null
  topReactionCount: number
}

export function useReactionStats(slideId: string) {
  const [stats, setStats] = useState<ReactionStats>({
    totalReactions: 0,
    topReaction: null,
    topReactionCount: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slideId) return

    const fetchStats = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('paragraph_reactions')
          .select('reaction_type')
          .eq('slide_id', slideId)

        if (error) throw error

        if (data && data.length > 0) {
          // Count reactions by type
          const counts: Record<string, number> = {}
          data.forEach(r => {
            counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1
          })

          // Find top reaction
          let topReaction: string | null = null
          let topCount = 0
          Object.entries(counts).forEach(([type, count]) => {
            if (count > topCount) {
              topCount = count
              topReaction = type
            }
          })

          setStats({
            totalReactions: data.length,
            topReaction,
            topReactionCount: topCount
          })
        } else {
          setStats({
            totalReactions: 0,
            topReaction: null,
            topReactionCount: 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch reaction stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`reaction-stats:${slideId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paragraph_reactions',
          filter: `slide_id=eq.${slideId}`
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [slideId])

  return { stats, loading }
}
