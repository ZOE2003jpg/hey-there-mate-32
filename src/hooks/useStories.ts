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

  const fetchStories = async (userStoriesOnly = false) => {
    try {
      setLoading(true)
      
      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase.from('stories').select('*')
      
      if (userStoriesOnly && user) {
        // For manage stories - fetch all user's stories regardless of status
        query = query.eq('author_id', user.id)
      } else {
        // For public discovery - only published stories
        query = query.eq('status', 'published')
      }
      
      const { data: storiesData, error: storiesError } = await query
        .order('created_at', { ascending: false })

      if (storiesError) throw storiesError

      // Fetch author profiles for these stories
      const authorIds = storiesData?.map(story => story.author_id) || []
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', authorIds)

      if (profilesError) console.warn('Error fetching profiles:', profilesError)

      // Merge stories with their author profiles
      const storiesWithAuthors = storiesData?.map(story => {
        const profile = profilesData?.find(p => p.user_id === story.author_id)
        return {
          ...story,
          profiles: profile || null
        }
      }) || []

      setStories(storiesWithAuthors as any)
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
    cover_image_url?: string | null
  }) => {
    try {
      const { data: story, error } = await supabase
        .from('stories')
        .insert({
          title: storyData.title,
          description: storyData.description,
          genre: storyData.genre,
          author_id: storyData.author_id,
          cover_image_url: storyData.cover_image_url,
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

  const fetchAllStories = async () => {
    try {
      setLoading(true)
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false })

      if (storiesError) throw storiesError

      const authorIds = storiesData?.map(story => story.author_id) || []
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', authorIds)

      if (profilesError) console.warn('Error fetching profiles:', profilesError)

      const storiesWithAuthors = storiesData?.map(story => {
        const profile = profilesData?.find(p => p.user_id === story.author_id)
        return {
          ...story,
          profiles: profile || null
        }
      }) || []

      setStories(storiesWithAuthors as any)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories')
    } finally {
      setLoading(false)
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
    fetchUserStories: () => fetchStories(true),
    fetchAllStories,
    createStory,
    updateStory,
    deleteStory
  }
}