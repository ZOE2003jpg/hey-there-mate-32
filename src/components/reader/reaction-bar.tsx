import { Button } from '@/components/ui/button';
import { useReactions, ReactionType } from '@/hooks/useReactions';
import { useRealtimeReactions } from '@/hooks/useRealtimeReactions';
import { motion } from 'framer-motion';
import { useUser } from '@/components/user-context';
import { toast } from 'sonner';

interface ReactionBarProps {
  slideId: string;
}

const reactionEmojis: Record<ReactionType, string> = {
  fire: '🔥',
  heart: '❤️',
  cry: '😭',
  laugh: '😂',
  shock: '😱',
  thinking: '🤔'
};

export function ReactionBar({ slideId }: ReactionBarProps) {
  const { user } = useUser();
  const { reactionCounts, userReactions, toggleReaction } = useReactions(slideId, user?.id);
  const { broadcastReaction } = useRealtimeReactions(slideId, user?.id);

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!user) {
      toast.error('Please login to react');
      return;
    }
    
    console.log('Reaction clicked:', reactionType);
    
    try {
      await toggleReaction(reactionType);
      await broadcastReaction(reactionType);
    } catch (error) {
      console.error('Error reacting:', error);
      toast.error('Failed to react');
    }
  };

  return (
    <div className="flex items-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 bg-muted/50 rounded-lg overflow-x-auto">
      {(Object.keys(reactionEmojis) as ReactionType[]).map((reactionType) => {
        const count = reactionCounts[reactionType];
        const isActive = userReactions.has(reactionType);

        return (
          <motion.div
            key={reactionType}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <Button
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReactionClick(reactionType);
              }}
              className="flex items-center gap-1 h-7 md:h-8 px-1.5 md:px-2 min-w-0"
            >
              <span className="text-base md:text-lg">{reactionEmojis[reactionType]}</span>
              {count > 0 && (
                <span className="text-xs font-medium">{count}</span>
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
