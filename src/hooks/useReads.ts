import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { getReadingProgress, setReadingProgress, getAllReadingProgress } from '@/lib/localStorage'

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
      // Save to localStorage immediately for offline access
      if (chapterId) {
        setReadingProgress({
          storyId,
          chapterId,
          slideId,
          slideIndex: progress,
          lastReadAt: new Date().toISOString()
        })
      }

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
    // Try to get from database first
    if (chapterId) {
      const dbProgress = reads.find(r => r.story_id === storyId && r.chapter_id === chapterId)
      if (dbProgress) return dbProgress
      
      // Fallback to localStorage
      const localProgress = getReadingProgress(storyId)
      if (localProgress && localProgress.chapterId === chapterId) {
        return {
          id: 'local',
          user_id: readerId || '',
          story_id: storyId,
          chapter_id: chapterId,
          slide_id: localProgress.slideId || null,
          progress: localProgress.slideIndex,
          last_read_at: localProgress.lastReadAt,
          created_at: localProgress.lastReadAt
        }
      }
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