import { Button } from '@/components/ui/button';
import { useFollowers } from '@/hooks/useFollowers';
import { UserPlus, UserCheck } from 'lucide-react';
import { useUser } from '@/components/user-context';

interface FollowButtonProps {
  authorId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function FollowButton({ authorId, variant = 'default', size = 'default' }: FollowButtonProps) {
  const { user } = useUser();
  const { isFollowing, followUser, unfollowUser, loading } = useFollowers(user?.id);

  if (!user || user.id === authorId) return null;

  const isUserFollowing = isFollowing[authorId];

  const handleClick = () => {
    if (isUserFollowing) {
      unfollowUser(authorId);
    } else {
      followUser(authorId);
    }
  };

  return (
    <Button
      variant={isUserFollowing ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
    >
      {isUserFollowing ? (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
