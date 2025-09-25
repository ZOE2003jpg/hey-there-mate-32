import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Story } from './useStories'

export interface LibraryItem {
  id: string
  user_id: string
  story_id: string
  created_at: string
  stories: Story | null
}

export function useLibrary(userId?: string) {
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLibrary = async () => {
    if (!userId) {
      setLibrary([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('library')
        .select(`
          *,
          stories (
            *,
            profiles (
              display_name,
              username
            ),
            story_tags (
              tag
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLibrary((data || []) as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch library')
    } finally {
      setLoading(false)
    }
  }

  const addToLibrary = async (storyId: string, currentUserId: string) => {
    try {
      // Check if already in library
      const { data: existingItem } = await supabase
        .from('library')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('story_id', storyId)
        .single()

      if (existingItem) {
        throw new Error('Story is already in your library')
      }

      const { error } = await supabase
        .from('library')
        .insert({
          user_id: currentUserId,
          story_id: storyId
        })

      if (error) throw error
      await fetchLibrary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to library')
      throw err
    }
  }

  const removeFromLibrary = async (storyId: string, currentUserId: string) => {
    try {
      const { error } = await supabase
        .from('library')
        .delete()
        .eq('user_id', currentUserId)
        .eq('story_id', storyId)

      if (error) throw error
      await fetchLibrary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from library')
      throw err
    }
  }

  const isInLibrary = (storyId: string) => {
    return library.some(item => item.story_id === storyId)
  }

  useEffect(() => {
    fetchLibrary()
  }, [userId])

  return {
    library,
    loading,
    error,
    fetchLibrary,
    addToLibrary,
    removeFromLibrary,
    isInLibrary
  }
}