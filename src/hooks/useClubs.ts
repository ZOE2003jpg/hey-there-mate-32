import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Club {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  avatar_url: string | null;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export function useClubs(userId?: string) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (clubsError) throw clubsError;

      // Get member counts and membership status
      const clubsWithDetails = await Promise.all(
        (clubsData || []).map(async (club) => {
          const { count } = await supabase
            .from('club_members')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', club.id);

          let is_member = false;
          if (userId) {
            const { data: memberData } = await supabase
              .from('club_members')
              .select('id')
              .eq('club_id', club.id)
              .eq('user_id', userId)
              .maybeSingle();
            is_member = !!memberData;
          }

          return {
            ...club,
            member_count: count || 0,
            is_member,
          };
        })
      );

      setClubs(clubsWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  };

  const createClub = async (name: string, description: string) => {
    if (!userId) {
      toast({ title: 'Error', description: 'You must be logged in to create a club', variant: 'destructive' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('clubs')
        .insert({
          name,
          description,
          owner_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator
      await supabase.from('club_members').insert({
        club_id: data.id,
        user_id: userId,
        role: 'owner',
      });

      toast({ title: 'Success', description: 'Club created successfully!' });
      fetchClubs();
      return data;
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create club', variant: 'destructive' });
      return null;
    }
  };

  const joinClub = async (clubId: string) => {
    if (!userId) {
      toast({ title: 'Error', description: 'You must be logged in to join a club', variant: 'destructive' });
      return;
    }

    try {
      await supabase.from('club_members').insert({
        club_id: clubId,
        user_id: userId,
      });

      toast({ title: 'Success', description: 'Joined club successfully!' });
      fetchClubs();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to join club', variant: 'destructive' });
    }
  };

  const leaveClub = async (clubId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId);

      toast({ title: 'Success', description: 'Left club successfully!' });
      fetchClubs();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to leave club', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [userId]);

  return {
    clubs,
    loading,
    error,
    createClub,
    joinClub,
    leaveClub,
    refetch: fetchClubs,
  };
}
