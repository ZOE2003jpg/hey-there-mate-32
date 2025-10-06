import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ReactionType = 'fire' | 'heart' | 'cry' | 'laugh' | 'shock' | 'thinking';

export interface Reaction {
  id: string;
  slide_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface ReactionCounts {
  fire: number;
  heart: number;
  cry: number;
  laugh: number;
  shock: number;
  thinking: number;
}

export function useReactions(slideId: string, userId?: string) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({
    fire: 0,
    heart: 0,
    cry: 0,
    laugh: 0,
    shock: 0,
    thinking: 0
  });
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slideId) {
      fetchReactions();
      setupRealtimeSubscription();
    }
  }, [slideId, userId]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`reactions-${slideId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paragraph_reactions',
          filter: `slide_id=eq.${slideId}`
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('paragraph_reactions')
        .select('*')
        .eq('slide_id', slideId);

      if (error) throw error;

      const typedReactions = (data || []).map(r => ({
        ...r,
        reaction_type: r.reaction_type as ReactionType
      }));
      
      setReactions(typedReactions);
      
      // Count reactions by type
      const counts: ReactionCounts = {
        fire: 0,
        heart: 0,
        cry: 0,
        laugh: 0,
        shock: 0,
        thinking: 0
      };

      const userReactionSet = new Set<ReactionType>();

      typedReactions.forEach(reaction => {
        counts[reaction.reaction_type]++;
        if (userId && reaction.user_id === userId) {
          userReactionSet.add(reaction.reaction_type);
        }
      });

      setReactionCounts(counts);
      setUserReactions(userReactionSet);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReaction = async (reactionType: ReactionType) => {
    if (!userId) return;

    const hasReaction = userReactions.has(reactionType);

    try {
      if (hasReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('paragraph_reactions')
          .delete()
          .eq('slide_id', slideId)
          .eq('user_id', userId)
          .eq('reaction_type', reactionType);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('paragraph_reactions')
          .insert({
            slide_id: slideId,
            user_id: userId,
            reaction_type: reactionType
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  return {
    reactions,
    reactionCounts,
    userReactions,
    loading,
    toggleReaction
  };
}
