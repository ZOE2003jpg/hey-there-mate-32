import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollOption {
  key: string;
  label: string;
}

interface Poll {
  id: string;
  story_id: string | null;
  chapter_id: string | null;
  question: string;
  options: PollOption[];
  created_by: string;
  created_at: string;
  expires_at: string | null;
}

export function usePolls(storyId?: string, chapterId?: string) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPolls = async () => {
    try {
      setLoading(true);
      let query = supabase.from('polls').select('*');

      if (storyId) {
        query = query.eq('story_id', storyId);
      }
      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      }

      const { data, error: pollError } = await query.order('created_at', { ascending: false });

      if (pollError) throw pollError;
      
      // Type cast the options field from Json to PollOption[]
      const typedPolls = (data || []).map(poll => ({
        ...poll,
        options: poll.options as unknown as PollOption[]
      }));
      
      setPolls(typedPolls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (
    question: string,
    options: PollOption[],
    userId: string,
    targetStoryId?: string,
    targetChapterId?: string
  ) => {
    try {
      const { error } = await supabase.from('polls').insert([{
        story_id: targetStoryId || storyId || null,
        chapter_id: targetChapterId || chapterId || null,
        question,
        options: options as any,
        created_by: userId,
      }]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Poll created successfully!' });
      fetchPolls();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create poll', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [storyId, chapterId]);

  return {
    polls,
    loading,
    error,
    createPoll,
    refetch: fetchPolls,
  };
}
