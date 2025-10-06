import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoteDistribution {
  [key: string]: number;
}

export function usePollVotes(pollId: string, userId?: string) {
  const [votes, setVotes] = useState<VoteDistribution>({});
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const { data: votesData, error: votesError } = await supabase
        .from('poll_votes')
        .select('option_key')
        .eq('poll_id', pollId);

      if (votesError) throw votesError;

      // Calculate distribution
      const distribution: VoteDistribution = {};
      votesData?.forEach((vote) => {
        distribution[vote.option_key] = (distribution[vote.option_key] || 0) + 1;
      });
      setVotes(distribution);

      // Get user's vote
      if (userId) {
        const { data: userVoteData } = await supabase
          .from('poll_votes')
          .select('option_key')
          .eq('poll_id', pollId)
          .eq('user_id', userId)
          .maybeSingle();

        setUserVote(userVoteData?.option_key || null);
      }
    } catch (err) {
      console.error('Failed to fetch votes:', err);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (optionKey: string) => {
    if (!userId) {
      toast({ title: 'Error', description: 'You must be logged in to vote', variant: 'destructive' });
      return;
    }

    try {
      // Check if user already voted
      if (userVote) {
        // Update existing vote
        await supabase
          .from('poll_votes')
          .update({ option_key: optionKey })
          .eq('poll_id', pollId)
          .eq('user_id', userId);
      } else {
        // Insert new vote
        await supabase.from('poll_votes').insert({
          poll_id: pollId,
          user_id: userId,
          option_key: optionKey,
        });
      }

      toast({ title: 'Success', description: 'Vote recorded!' });
      fetchVotes();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to record vote', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (pollId) {
      fetchVotes();

      // Set up realtime subscription
      const channel = supabase
        .channel(`poll_votes:${pollId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'poll_votes',
            filter: `poll_id=eq.${pollId}`,
          },
          () => {
            fetchVotes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [pollId, userId]);

  return {
    votes,
    userVote,
    loading,
    vote,
    refetch: fetchVotes,
  };
}
