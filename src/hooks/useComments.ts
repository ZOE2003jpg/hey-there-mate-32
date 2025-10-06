import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Comment {
  id: string
  content: string
  user_id: string
  story_id?: string
  chapter_id?: string
  parent_comment_id?: string
  depth: number
  edited: boolean
  like_count: number
  created_at: string
  updated_at: string
  profiles?: {
    username: string
    display_name: string
    avatar_url: string
  }
}

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async (storyId?: string, chapterId?: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (storyId) {
        query = query.eq('story_id', storyId)
      }
      if (chapterId) {
        query = query.eq('chapter_id', chapterId)
      }

      const { data, error } = await query

      if (error) throw error
      setComments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  const deleteComment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchComments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
      throw err
    }
  }

  const updateComment = async (id: string, updates: Partial<Comment>) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchComments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment')
      throw err
    }
  }

  const addComment = async (content: string, userId: string, storyId?: string, chapterId?: string, parentCommentId?: string) => {
    try {
      const depth = parentCommentId ? 1 : 0;
      
      const { error } = await supabase
        .from('comments')
        .insert({
          content,
          user_id: userId,
          story_id: storyId,
          chapter_id: chapterId,
          parent_comment_id: parentCommentId,
          depth
        })

      if (error) throw error
      await fetchComments(storyId, chapterId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
      throw err
    }
  }

  const likeComment = async (commentId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like comment')
      throw err
    }
  }

  const unlikeComment = async (commentId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike comment')
      throw err
    }
  }

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    deleteComment,
    updateComment,
    likeComment,
    unlikeComment
  }
}