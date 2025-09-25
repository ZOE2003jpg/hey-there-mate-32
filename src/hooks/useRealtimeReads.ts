import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useReads } from './useReads'

export function useRealtimeReads(userId?: string) {
  const readsHook = useReads(userId)
  const [storyReadCounts, setStoryReadCounts] = useState<{[key: string]: number}>({})

  useEffect(() => {
    if (!userId) return

    // Subscribe to realtime reads changes
    const channel = supabase
      .channel('reads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reads'
        },
        (payload) => {
          console.log('Reads change:', payload)
          // Refresh reads when changes occur
          readsHook.fetchReads()
          
          // Update story read counts if needed
          if (payload.new && (payload.new as any).story_id) {
            fetchStoryReadCount((payload.new as any).story_id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const fetchStoryReadCount = async (storyId: string) => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('view_count')
        .eq('id', storyId)
        .single()

      if (!error && data) {
        setStoryReadCounts(prev => ({
          ...prev,
          [storyId]: data.view_count || 0
        }))
      }
    } catch (err) {
      console.error('Failed to fetch story read count:', err)
    }
  }

  return {
    ...readsHook,
    storyReadCounts,
    fetchStoryReadCount
  }
}