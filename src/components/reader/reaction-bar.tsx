import { Button } from '@/components/ui/button';
import { useReactions, ReactionType } from '@/hooks/useReactions';
import { motion } from 'framer-motion';
import { useUser } from '@/components/user-context';

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

  const handleReactionClick = (reactionType: ReactionType) => {
    if (!user) return;
    toggleReaction(reactionType);
  };

  return (
    <div className="flex items-center gap-2 py-3 px-4 bg-muted/50 rounded-lg">
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
              onClick={() => handleReactionClick(reactionType)}
              className="flex items-center gap-1 h-8 px-2"
              disabled={!user}
            >
              <span className="text-lg">{reactionEmojis[reactionType]}</span>
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
