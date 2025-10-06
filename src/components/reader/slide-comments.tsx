import { useState, useEffect } from 'react'
import { useComments } from '@/hooks/useComments'
import { useUser } from '@/components/user-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Send, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'

interface SlideCommentsProps {
  slideId: string
  storyId: string
  isOpen: boolean
  onClose: () => void
}

interface CommentWithProfile {
  id: string
  content: string
  user_id: string
  created_at: string
  like_count: number
  profiles: {
    username: string
    display_name: string
    avatar_url: string
  }
}

export function SlideComments({ slideId, storyId, isOpen, onClose }: SlideCommentsProps) {
  const { user } = useUser()
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [slideId, isOpen])

  // Real-time subscription for new comments
  useEffect(() => {
    if (!isOpen) return

    console.log('Setting up realtime for comments:', { slideId, storyId })

    const channel = supabase
      .channel(`comments-${slideId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `chapter_id=eq.${slideId}`
        },
        (payload) => {
          console.log('New comment received:', payload)
          fetchComments()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `chapter_id=eq.${slideId}`
        },
        (payload) => {
          console.log('Comment updated:', payload)
          fetchComments()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `chapter_id=eq.${slideId}`
        },
        (payload) => {
          console.log('Comment deleted:', payload)
          fetchComments()
        }
      )
      .subscribe((status) => {
        console.log('Comment subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [slideId, isOpen])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          user_id,
          created_at,
          like_count
        `)
        .eq('story_id', storyId)
        .eq('chapter_id', slideId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch profiles separately
      const userIds = [...new Set((data || []).map(c => c.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds)

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      )

      const commentsWithProfiles = (data || []).map(comment => ({
        ...comment,
        profiles: profilesMap.get(comment.user_id) || {
          username: 'Unknown',
          display_name: 'Unknown User',
          avatar_url: ''
        }
      }))

      setComments(commentsWithProfiles)

      // Fetch user's liked comments
      if (user) {
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', (data || []).map(c => c.id))

        if (likes) {
          setLikedComments(new Set(likes.map(l => l.comment_id)))
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please login to comment')
      return
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    console.log('Submitting comment:', { userId: user.id, storyId, slideId, content: newComment.trim() })

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          story_id: storyId,
          chapter_id: slideId,
          depth: 0
        })
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      
      console.log('Comment inserted:', data)
      setNewComment('')
      await fetchComments()
      toast.success('💫 Comment posted!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please login to like comments')
      return
    }

    const isLiked = likedComments.has(commentId)

    try {
      if (isLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)

        setLikedComments(prev => {
          const newSet = new Set(prev)
          newSet.delete(commentId)
          return newSet
        })
      } else {
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          })

        setLikedComments(prev => new Set(prev).add(commentId))
      }
      fetchComments()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-background border-t border-border max-h-[60vh] flex flex-col animate-slide-in-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">Comments ({comments.length})</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.profiles.avatar_url} />
                <AvatarFallback>
                  {comment.profiles.display_name?.[0] || comment.profiles.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm">
                    {comment.profiles.display_name || comment.profiles.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <Heart
                      className={`h-3 w-3 ${likedComments.has(comment.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    {comment.like_count > 0 && (
                      <span className="ml-1 text-xs">{comment.like_count}</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
