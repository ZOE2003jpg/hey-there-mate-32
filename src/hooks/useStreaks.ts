import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
  streak_freeze_count: number;
  created_at: string;
  updated_at: string;
}

export function useStreaks(userId?: string) {
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchStreak();
    }
  }, [userId]);

  const fetchStreak = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStreak(data || null);
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStreakActive = () => {
    if (!streak?.last_read_date) return false;
    
    const lastRead = new Date(streak.last_read_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastRead.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - lastRead.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 1;
  };

  return {
    streak,
    loading,
    isStreakActive: isStreakActive(),
    refetch: fetchStreak
  };
}
