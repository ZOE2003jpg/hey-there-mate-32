import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Story {
  id: string
  title: string
  description: string | null
  genre: string | null
  cover_image_url: string | null
  author_id: string
  status: 'draft' | 'published' | 'archived'
  view_count: number
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  profiles?: {
    display_name: string | null
    username: string | null
  } | null
  story_tags?: { tag: string }[]
  chapters?: Chapter[]
}

interface Chapter {
  id: string
  title: string
  status: 'draft' | 'published'
  chapter_number: number
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('stories')
        .select('*, profiles(display_name, username), story_tags(tag)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStories((data || []) as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories')
    } finally {
      setLoading(false)
    }
  }

  const createStory = async (storyData: {
    title: string
    description: string
    genre: string
    author_id: string
    tags?: string[]
  }) => {
    try {
      const { data: story, error } = await supabase
        .from('stories')
        .insert({
          title: storyData.title,
          description: storyData.description,
          genre: storyData.genre,
          author_id: storyData.author_id,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      // Add tags if provided
      if (storyData.tags && storyData.tags.length > 0) {
        const tagInserts = storyData.tags.map(tag => ({
          story_id: story.id,
          tag: tag
        }))
        
        await supabase.from('story_tags').insert(tagInserts)
      }

      await fetchStories()
      return story
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story')
      throw err
    }
  }

  const updateStory = async (id: string, updates: Partial<Story>) => {
    try {
      const { error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchStories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update story')
      throw err
    }
  }

  const deleteStory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchStories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story')
      throw err
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  return {
    stories,
    loading,
    error,
    fetchStories,
    createStory,
    updateStory,
    deleteStory
  }
}