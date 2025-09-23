import { useState, useEffect } from 'react'

export interface Notification {
  id: string
  user_id: string
  type: string
  message: string
  seen: boolean
  created_at: string
}

// Mock notifications data since notifications table doesn't exist
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: '1',
    type: 'like',
    message: 'Someone liked your story "Sample Story"',
    seen: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: '1',
    type: 'comment',
    message: 'New comment on your story "Sample Story"',
    seen: false,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: '1',
    type: 'follow',
    message: 'You have a new follower',
    seen: true,
    created_at: new Date().toISOString()
  }
]

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
      // Mock fetch with delay
      setTimeout(() => {
        const userNotifications = mockNotifications.filter(n => n.user_id === userId)
        setNotifications(userNotifications)
        setLoading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, seen: true } : n
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
      throw err
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return

    try {
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read')
      throw err
    }
  }

  const getUnreadCount = () => {
    return notifications.filter(n => !n.seen).length
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