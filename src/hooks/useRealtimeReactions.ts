import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { ReactionType } from './useReactions'

interface RealtimeReaction {
  id: string
  emoji: string
  userId: string
  timestamp: number
}

export function useRealtimeReactions(slideId: string, userId?: string) {
  const [floatingReactions, setFloatingReactions] = useState<RealtimeReaction[]>([])
  const [lastReactionTime, setLastReactionTime] = useState(0)
  const COOLDOWN_MS = 2000 // 2 seconds between reactions

  useEffect(() => {
    if (!slideId) return

    const channel = supabase.channel(`slide-reactions:${slideId}`)

    // Listen to presence state
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        // Process new reactions from presence
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.reaction && presence.userId !== userId) {
              const reactionId = `${presence.userId}-${presence.timestamp}`
              setFloatingReactions(prev => {
                // Avoid duplicates
                if (prev.some(r => r.id === reactionId)) return prev
                return [...prev, {
                  id: reactionId,
                  emoji: getEmojiForType(presence.reaction),
                  userId: presence.userId,
                  timestamp: presence.timestamp
                }]
              })
            }
          })
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [slideId, userId])

  const broadcastReaction = useCallback(async (reactionType: ReactionType) => {
    if (!userId) return

    const now = Date.now()
    if (now - lastReactionTime < COOLDOWN_MS) {
      return // Cooldown active
    }

    setLastReactionTime(now)

    const channel = supabase.channel(`slide-reactions:${slideId}`)
    
    // Track own reaction locally
    const reactionId = `${userId}-${now}`
    const emoji = getEmojiForType(reactionType)
    
    setFloatingReactions(prev => [...prev, {
      id: reactionId,
      emoji,
      userId,
      timestamp: now
    }])

    // Broadcast to others via presence
    await channel.track({
      userId,
      reaction: reactionType,
      timestamp: now
    })

    // Untrack after a short delay so it doesn't persist
    setTimeout(() => {
      channel.untrack()
    }, 100)
  }, [slideId, userId, lastReactionTime])

  const removeReaction = useCallback((reactionId: string) => {
    setFloatingReactions(prev => prev.filter(r => r.id !== reactionId))
  }, [])

  return {
    floatingReactions,
    broadcastReaction,
    removeReaction
  }
}

function getEmojiForType(type: ReactionType): string {
  const emojiMap: Record<ReactionType, string> = {
    fire: '🔥',
    heart: '❤️',
    cry: '😭',
    laugh: '😂',
    shock: '😱',
    thinking: '🤔'
  }
  return emojiMap[type] || '👍'
}
