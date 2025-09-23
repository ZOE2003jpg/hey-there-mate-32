import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement_type: string
  requirement_value: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement: Achievement
}

export function useAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      
      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true })

      if (achievementsError) throw achievementsError
      setAchievements(achievementsData || [])

      // Fetch user achievements if user is provided
      if (userId) {
        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievement:achievements(*)
          `)
          .eq('user_id', userId)

        if (userAchievementsError) throw userAchievementsError
        setUserAchievements(userAchievementsData || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }

  const checkAndAwardAchievements = async (stats: {
    storiesPublished: number
    totalReads: number
    followers: number
    highRatedStories: number
    trendingFeatures: number
  }) => {
    if (!userId) return

    try {
      const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id)
      const unearned = achievements.filter(a => !earnedAchievementIds.includes(a.id))

      for (const achievement of unearned) {
        let shouldAward = false

        switch (achievement.requirement_type) {
          case 'stories_published':
            shouldAward = stats.storiesPublished >= achievement.requirement_value
            break
          case 'story_reads':
            shouldAward = stats.totalReads >= achievement.requirement_value
            break
          case 'followers':
            shouldAward = stats.followers >= achievement.requirement_value
            break
          case 'high_rated_stories':
            shouldAward = stats.highRatedStories >= achievement.requirement_value
            break
          case 'trending_features':
            shouldAward = stats.trendingFeatures >= achievement.requirement_value
            break
        }

        if (shouldAward) {
          const { error } = await supabase
            .from('user_achievements')
            .insert({ user_id: userId, achievement_id: achievement.id })

          if (!error) {
            // Refresh achievements
            fetchAchievements()
          }
        }
      }
    } catch (err) {
      console.error('Error checking achievements:', err)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [userId])

  return {
    achievements,
    userAchievements,
    loading,
    error,
    fetchAchievements,
    checkAndAwardAchievements
  }
}