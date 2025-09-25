import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useLikes } from './useLikes'

export function useRealtimeLikes(userId?: string) {
  const likesHook = useLikes(userId)
  const [storyLikeCounts, setStoryLikeCounts] = useState<{[key: string]: number}>({})

  useEffect(() => {
    if (!userId) return

    // Subscribe to realtime likes changes
    const channel = supabase
      .channel('likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes'
        },
        (payload) => {
          console.log('Likes change:', payload)
          // Refresh likes when changes occur
          likesHook.fetchLikes()
          
          // Update story like counts if needed
          if (payload.new && (payload.new as any).story_id) {
            fetchStoryLikeCount((payload.new as any).story_id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const fetchStoryLikeCount = async (storyId: string) => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('like_count')
        .eq('id', storyId)
        .single()

      if (!error && data) {
        setStoryLikeCounts(prev => ({
          ...prev,
          [storyId]: data.like_count || 0
        }))
      }
    } catch (err) {
      console.error('Failed to fetch story like count:', err)
    }
  }

  return {
    ...likesHook,
    storyLikeCounts,
    fetchStoryLikeCount
  }
}