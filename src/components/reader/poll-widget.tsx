import { useState } from 'react';
import { usePollVotes } from '@/hooks/usePollVotes';
import { useUser } from '@/components/user-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReaderAuthModal } from '@/components/reader-auth-modal';
import { CheckCircle2 } from 'lucide-react';

interface PollOption {
  key: string;
  label: string;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

interface PollWidgetProps {
  poll: Poll;
}

export function PollWidget({ poll }: PollWidgetProps) {
  const { user } = useUser();
  const { votes, userVote, loading, vote } = usePollVotes(poll.id, user?.id);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  const getPercentage = (optionKey: string) => {
    if (totalVotes === 0) return 0;
    return Math.round(((votes[optionKey] || 0) / totalVotes) * 100);
  };

  const handleVote = (optionKey: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    vote(optionKey);
  };

  return (
    <>
      <ReaderAuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        feature="vote in polls"
      />
      <Card className="p-6">
        <h3 className="typography-h3 mb-4">{poll.question}</h3>
      
      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.key);
          const isSelected = userVote === option.key;
          const voteCount = votes[option.key] || 0;

          return (
            <div key={option.key}>
              {userVote ? (
                // Show results after voting
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="typography-body font-medium flex items-center gap-2">
                      {option.label}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </span>
                    <span className="typography-caption text-muted-foreground">
                      {percentage}% ({voteCount})
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ) : (
                // Show vote buttons before voting
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleVote(option.key)}
                  disabled={loading}
                >
                  {option.label}
                </Button>
              )}
            </div>
          );
        })}
      </div>

        {totalVotes > 0 && (
          <p className="typography-caption text-muted-foreground mt-4 text-center">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </p>
        )}
      </Card>
    </>
  );
}
