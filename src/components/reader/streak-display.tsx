import { useStreaks } from '@/hooks/useStreaks';
import { Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUser } from '@/components/user-context';

export function StreakDisplay() {
  const { user } = useUser();
  const { streak, isStreakActive } = useStreaks(user?.id);

  if (!streak || !user) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`text-3xl ${isStreakActive ? 'animate-pulse' : 'opacity-50'}`}>
          <Flame className={`w-8 h-8 ${isStreakActive ? 'text-orange-500' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <div className="text-2xl font-bold">{streak.current_streak} Day{streak.current_streak !== 1 ? 's' : ''}</div>
          <div className="text-sm text-muted-foreground">
            Longest: {streak.longest_streak} day{streak.longest_streak !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      {!isStreakActive && (
        <p className="text-xs text-destructive mt-2">
          Read today to keep your streak alive!
        </p>
      )}
    </Card>
  );
}
