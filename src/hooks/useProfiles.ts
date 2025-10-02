import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Profile {
  id: string
  user_id: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  status: string | null
  created_at: string
  updated_at: string
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles')
    } finally {
      setLoading(false)
    }
  }

  const getProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (err) {
      console.error('Failed to get profile:', err)
      return null
    }
  }

  const createProfile = async (profileData: {
    user_id: string
    username?: string
    display_name?: string
    bio?: string
    avatar_url?: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) throw error
      // Don't refetch all profiles - just return the created profile
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      throw err
    }
  }

  const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)

      if (error) throw error
      // Don't refetch all profiles - just return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }

  const deleteProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      await fetchProfiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile')
      throw err
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  return {
    profiles,
    loading,
    error,
    fetchProfiles,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile
  }
}