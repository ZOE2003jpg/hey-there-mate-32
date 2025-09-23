import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  story_id?: string
  chapter_id?: string
  created_at: string
  updated_at: string
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw error
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
      throw err
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read')
      throw err
    }
  }

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  }
}