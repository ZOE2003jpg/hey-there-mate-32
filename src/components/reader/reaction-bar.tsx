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

  const handleReactionClick = async (e: React.MouseEvent, reactionType: ReactionType) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to react');
      return;
    }
    
    console.log('Reaction clicked:', { reactionType, userId: user.id, slideId });
    
    try {
      await toggleReaction(reactionType);
      await broadcastReaction(reactionType);
      console.log('Reaction added successfully');
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
              onClick={(e) => handleReactionClick(e, reactionType)}
              className={`
                flex items-center gap-1 h-7 md:h-8 px-1.5 md:px-2 min-w-0
                touch-manipulation cursor-pointer
                transition-all duration-300
                ${isActive ? 'scale-105 shadow-lg shadow-primary/20' : ''}
              `}
              style={{ zIndex: 50 }}
              type="button"
            >
              <span className={`text-base md:text-lg transition-transform ${isActive ? 'animate-bounce' : ''}`}>
                {reactionEmojis[reactionType]}
              </span>
              {count > 0 && (
                <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                  +{count}
                </span>
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
