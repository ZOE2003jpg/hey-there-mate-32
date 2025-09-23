import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Read {
  id: string
  user_id: string
  story_id: string
  chapter_id: string | null
  slide_id: string | null
  progress: number | null
  last_read_at: string | null
  created_at: string
}

export function useReads(readerId?: string) {
  const [reads, setReads] = useState<Read[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReads = async () => {
    if (!readerId) {
      setReads([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reads')
        .select('*')
        .eq('user_id', readerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReads(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reads')
    } finally {
      setLoading(false)
    }
  }

  const trackProgress = async (readerId: string, storyId: string, chapterId?: string, slideId?: string, progress = 0) => {
    try {
      const { data, error } = await supabase.functions.invoke('track-progress', {
        body: {
          readerId,
          storyId,
          chapterId,
          slideId,
          progress
        }
      })
      
      if (error) throw error
      await fetchReads()
      return data
    } catch (err) {
      console.error('Failed to track progress:', err)
      throw err
    }
  }

  const getReadingProgress = (storyId: string, chapterId?: string) => {
    if (chapterId) {
      return reads.find(r => r.story_id === storyId && r.chapter_id === chapterId)
    }
    return reads.filter(r => r.story_id === storyId)
  }

  useEffect(() => {
    fetchReads()
  }, [readerId])

  // Realtime subscription for reads updates
  useEffect(() => {
    if (!readerId) return

    const channel = supabase
      .channel('reads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reads',
          filter: `user_id=eq.${readerId}`
        },
        () => {
          fetchReads()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [readerId])

  return {
    reads,
    loading,
    error,
    fetchReads,
    trackProgress,
    getReadingProgress
  }
}