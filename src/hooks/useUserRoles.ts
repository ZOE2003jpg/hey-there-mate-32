import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export type UserRole = 'reader' | 'writer' | 'admin'

export interface UserRoleData {
  id: string
  user_id: string
  role: UserRole
  created_at: string
}

export function useUserRoles() {
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserRoles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserRoles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user roles')
    } finally {
      setLoading(false)
    }
  }

  const getUserRoles = async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)

      if (error) throw error
      return data?.map(r => r.role as UserRole) || []
    } catch (err) {
      console.error('Failed to get user roles:', err)
      return []
    }
  }

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })

      if (error) throw error
      await fetchUserRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role')
      throw err
    }
  }

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)

      if (error) throw error
      await fetchUserRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove role')
      throw err
    }
  }

  useEffect(() => {
    fetchUserRoles()
  }, [])

  return {
    userRoles,
    loading,
    error,
    fetchUserRoles,
    getUserRoles,
    assignRole,
    removeRole
  }
}
