import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClubPost {
  id: string;
  club_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

export function useClubPosts(clubId: string, userId?: string) {
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: postsData, error: postsError } = await supabase
        .from('club_posts')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get author profiles
      const postsWithAuthors = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', post.author_id)
            .maybeSingle();

          return {
            ...post,
            author_name: profile?.display_name || 'Anonymous',
            author_avatar: profile?.avatar_url,
          };
        })
      );

      setPosts(postsWithAuthors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string) => {
    if (!userId) {
      toast({ title: 'Error', description: 'You must be logged in to post', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.from('club_posts').insert({
        club_id: clubId,
        author_id: userId,
        content,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Post created successfully!' });
      fetchPosts();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchPosts();

      // Set up realtime subscription
      const channel = supabase
        .channel(`club_posts:${clubId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'club_posts',
            filter: `club_id=eq.${clubId}`,
          },
          () => {
            fetchPosts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [clubId, userId]);

  return {
    posts,
    loading,
    error,
    createPost,
    refetch: fetchPosts,
  };
}
