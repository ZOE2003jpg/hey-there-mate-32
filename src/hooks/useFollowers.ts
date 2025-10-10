import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export function useFollowers(userId?: string) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchFollowers();
      fetchFollowing();
      setupRealtimeSubscription();
    }
  }, [userId]);

  const setupRealtimeSubscription = () => {
    if (!userId) return;

    // Subscribe to changes where user is being followed (followers)
    const followersChannel = supabase
      .channel('followers-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${userId}`
        },
        () => {
          fetchFollowers();
        }
      )
      .subscribe();

    // Subscribe to changes where user is following others (following)
    const followingChannel = supabase
      .channel('following-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `follower_id=eq.${userId}`
        },
        () => {
          fetchFollowing();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(followersChannel);
      supabase.removeChannel(followingChannel);
    };
  };

  const fetchFollowers = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('following_id', userId);

      if (error) throw error;
      setFollowers(data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', userId);

      if (error) throw error;
      setFollowing(data || []);
      
      // Create a map of who the user is following
      const followingMap = (data || []).reduce((acc, f) => {
        acc[f.following_id] = true;
        return acc;
      }, {} as { [key: string]: boolean });
      
      setIsFollowing(followingMap);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: userId,
          following_id: targetUserId
        });

      if (error) throw error;

      setIsFollowing(prev => ({ ...prev, [targetUserId]: true }));
      toast({
        title: 'Success',
        description: 'You are now following this writer!'
      });
      
      await fetchFollowing();
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to follow user',
        variant: 'destructive'
      });
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetUserId);

      if (error) throw error;

      setIsFollowing(prev => {
        const newState = { ...prev };
        delete newState[targetUserId];
        return newState;
      });
      
      toast({
        title: 'Success',
        description: 'Unfollowed successfully'
      });
      
      await fetchFollowing();
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unfollow user',
        variant: 'destructive'
      });
    }
  };

  return {
    followers,
    following,
    isFollowing,
    loading,
    followUser,
    unfollowUser,
    refetch: () => {
      fetchFollowers();
      fetchFollowing();
    }
  };
}
