import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { getStoredStories, setStoredStories, appendStoredStories } from '@/lib/localStorage'

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

// Helper function to verify story ownership
const verifyStoryOwnership = async (storyId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: story, error } = await supabase
      .from('stories')
      .select('author_id')
      .eq('id', storyId)
      .single()

    if (error || !story) return false
    return story.author_id === user.id
  } catch {
    return false
  }
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const cached = getStoredStories()
    if (cached.length > 0) {
      // Use cached data immediately while fetching fresh data
      setStories(cached as any)
      setLoading(false)
    }
  }, [])

  const fetchStories = async (userStoriesOnly = false) => {
    const currentRequestId = ++requestIdRef.current
    
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase.from('stories').select('*')
      
      if (userStoriesOnly && user) {
        query = query.eq('author_id', user.id)
      } else {
        query = query.eq('status', 'published')
      }
      
      const { data: storiesData, error: storiesError } = await query
        .order('created_at', { ascending: false })

      if (storiesError) throw storiesError

      if (currentRequestId !== requestIdRef.current) {
        return
      }

      const authorIds = storiesData?.map(story => story.author_id) || []
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', authorIds)

      if (profilesError) console.warn('Error fetching profiles:', profilesError)

      if (currentRequestId !== requestIdRef.current) {
        return
      }

      const storiesWithAuthors = storiesData?.map(story => {
        const profile = profilesData?.find(p => p.user_id === story.author_id)
        return {
          ...story,
          profiles: profile || null
        }
      }) || []

      if (currentRequestId !== requestIdRef.current) {
        return
      }

      const newStories = storiesWithAuthors
      
      // Check if this is initial load or refresh
      if (!initialLoadDone) {
        setStories(newStories as any)
        setStoredStories(newStories)
        setInitialLoadDone(true)
      } else {
        // Append new stories to existing ones
        setStories(prev => {
          const existingIds = new Set(prev.map(s => s.id))
          const toAdd = newStories.filter((s: any) => !existingIds.has(s.id))
          const updated = [...prev, ...toAdd]
          appendStoredStories(toAdd)
          return updated as any
        })
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) {
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch stories')
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }

  const createStory = async (storyData: {
    title: string
    description: string
    genre: string
    author_id: string
    tags?: string[]
    cover_image_url?: string | null
    mood?: string
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
          status: 'draft',
          metadata: storyData.mood ? { mood: storyData.mood } : {}
        })
        .select()
        .single()

      if (error) throw error

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

  const fetchAllStories = async () => {
    const currentRequestId = ++requestIdRef.current
    
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      // Only fetch user's own stories and published stories from others
      let query = supabase.from('stories').select('*')
      
      if (user) {
        query = query.or(`author_id.eq.${user.id},status.eq.published`)
      } else {
        query = query.eq('status', 'published')
      }
      
      const { data: storiesData, error: storiesError } = await query
        .order('created_at', { ascending: false })

      if (storiesError) throw storiesError

      if (currentRequestId !== requestIdRef.current) {
        return
      }

      const authorIds = storiesData?.map(story => story.author_id) || []
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, username')
        .in('user_id', authorIds)

      if (profilesError) console.warn('Error fetching profiles:', profilesError)

      if (currentRequestId !== requestIdRef.current) {
        return
      }

      const storiesWithAuthors = storiesData?.map(story => {
        const profile = profilesData?.find(p => p.user_id === story.author_id)
        return {
          ...story,
          profiles: profile || null
        }
      }) || []

      if (currentRequestId !== requestIdRef.current) {
        return
      }

      const newStories = storiesWithAuthors
      setStories(newStories as any)
      setStoredStories(newStories)
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) {
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch all stories')
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }

  const updateStory = async (id: string, updates: Partial<Story>, refetchAll = false) => {
    try {
      // Verify ownership before updating
      const isOwner = await verifyStoryOwnership(id)
      if (!isOwner) {
        throw new Error('You do not have permission to update this story')
      }

      const { error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      
      if (refetchAll) {
        await fetchAllStories()
      } else {
        await fetchStories()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update story')
      throw err
    }
  }

  const deleteStory = async (id: string, refetchAll = false) => {
    try {
      // Verify ownership before deleting
      const isOwner = await verifyStoryOwnership(id)
      if (!isOwner) {
        throw new Error('You do not have permission to delete this story')
      }

      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      if (refetchAll) {
        await fetchAllStories()
      } else {
        await fetchStories()
      }
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
    fetchUserStories: () => fetchStories(true),
    fetchAllStories,
    createStory,
    updateStory,
    deleteStory
  }
}
