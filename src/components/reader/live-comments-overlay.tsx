import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface LiveComment {
  id: string
  content: string
  user_name: string
  created_at: string
}

interface LiveCommentsOverlayProps {
  slideId: string
  storyId: string
}

export function LiveCommentsOverlay({ slideId, storyId }: LiveCommentsOverlayProps) {
  const [liveComments, setLiveComments] = useState<LiveComment[]>([])
  const commentIdsSeen = useRef(new Set<string>())

  useEffect(() => {
    const channel = supabase
      .channel(`live-comments-${slideId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `chapter_id=eq.${slideId}`
        },
        async (payload) => {
          const newComment = payload.new as any
          
          // Skip if we've already shown this comment
          if (commentIdsSeen.current.has(newComment.id)) return
          commentIdsSeen.current.add(newComment.id)

          // Fetch profile for the comment
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', newComment.user_id)
            .single()

          const userName = profile?.display_name || profile?.username || 'Anonymous'

          const comment: LiveComment = {
            id: newComment.id,
            content: newComment.content,
            user_name: userName,
            created_at: newComment.created_at
          }

          setLiveComments(prev => [...prev, comment])

          // Remove comment after 8 seconds
          setTimeout(() => {
            setLiveComments(prev => prev.filter(c => c.id !== comment.id))
          }, 8000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [slideId])

  return (
    <div className="fixed left-0 right-0 bottom-32 z-30 pointer-events-none px-4 max-w-2xl mx-auto">
      <AnimatePresence mode="popLayout">
        {liveComments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: -100, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              x: 0,
              y: -index * 60
            }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ 
              duration: 8,
              opacity: {
                times: [0, 0.05, 0.9, 1]
              }
            }}
            className="absolute bottom-0 left-0 right-0"
          >
            <div className="bg-background/90 backdrop-blur-md border border-border/50 rounded-lg px-4 py-2 shadow-xl max-w-md">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-sm text-primary shrink-0">
                  {comment.user_name}
                </span>
                <span className="text-sm text-foreground/90 break-words">
                  {comment.content}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
