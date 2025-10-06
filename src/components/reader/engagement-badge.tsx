import { useReactionStats } from '@/hooks/useReactionStats'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

interface EngagementBadgeProps {
  slideId: string
}

const reactionEmojis: Record<string, string> = {
  fire: '🔥',
  heart: '❤️',
  cry: '😭',
  laugh: '😂',
  shock: '😱',
  thinking: '🤔'
}

export function EngagementBadge({ slideId }: EngagementBadgeProps) {
  const { stats, loading } = useReactionStats(slideId)

  // Only show if there are 50+ reactions
  if (loading || stats.totalReactions < 50 || !stats.topReaction) {
    return null
  }

  const emoji = reactionEmojis[stats.topReaction] || '👍'

  return (
    <div className="absolute top-4 right-4 z-10">
      <Badge 
        variant="secondary" 
        className="bg-background/80 backdrop-blur-sm border border-primary/20 px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 md:gap-2 animate-fade-in text-xs md:text-sm"
      >
        <span className="text-base md:text-lg">{emoji}</span>
        <Eye className="h-3 w-3" />
        <span className="font-medium">{stats.totalReactions}</span>
        <span className="hidden md:inline text-xs text-muted-foreground">readers reacted</span>
      </Badge>
    </div>
  )
}
