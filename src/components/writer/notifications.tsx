import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/useNotifications"
import { useUser } from "@/components/user-context"
import { 
  ArrowLeft,
  Bell,
  MessageCircle,
  Heart,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Users,
  Filter
} from "lucide-react"

interface NotificationsProps {
  onNavigate: (page: string, data?: any) => void
}

export function Notifications({ onNavigate }: NotificationsProps) {
  const [filter, setFilter] = useState("all")
  const { user } = useUser()
  const { notifications, loading, markAsRead, markAllAsRead, getUnreadCount } = useNotifications(user?.id)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment": return MessageCircle
      case "like": return Heart
      case "milestone": return TrendingUp
      case "follower": return Users
      case "admin": return Star
      default: return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "comment": return "text-blue-500"
      case "like": return "text-red-500"
      case "milestone": return "text-green-500"
      case "follower": return "text-purple-500"
      case "admin": return "text-yellow-500"
      default: return "text-gray-500"
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "admin": return "default"
      case "milestone": return "default"
      default: return "secondary"
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    return notification.type === filter
  })

  const unreadCount = getUnreadCount()

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleToggleNotificationRead = async (id: string) => {
    try {
      await markAsRead(id)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return '1 day ago'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
    return `${Math.floor(diffInHours / 168)} weeks ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with your story activity</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Card className="vine-card">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All", count: notifications.length },
              { key: "unread", label: "Unread", count: unreadCount },
              { key: "comment", label: "Comments", count: notifications.filter(n => n.type === "comment").length },
              { key: "milestone", label: "Milestones", count: notifications.filter(n => n.type === "milestone").length },
              { key: "admin", label: "Admin", count: notifications.filter(n => n.type === "admin").length },
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.key)}
                className="flex items-center gap-2"
              >
                {filterOption.label}
                <Badge variant="secondary" className="text-xs">
                  {filterOption.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading notifications...</div>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type)
            return (
              <Card 
                key={notification.id} 
                className={`vine-card cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? "bg-primary/5 border-primary/20" : ""
                }`}
                onClick={() => handleToggleNotificationRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      !notification.read ? "bg-primary/10" : "bg-secondary/30"
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        !notification.read ? "text-primary" : getNotificationColor(notification.type)
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant={getBadgeVariant(notification.type)}>
                          {notification.type}
                        </Badge>
                        {notification.story_id && (
                          <Badge variant="outline">
                            Story
                          </Badge>
                        )}
                        {notification.chapter_id && (
                          <Badge variant="outline">
                            Chapter
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <Card className="vine-card">
          <CardContent className="pt-6 pb-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "all" 
                ? "You're all caught up! New notifications will appear here."
                : `No ${filter} notifications at the moment.`
              }
            </p>
            {filter !== "all" && (
              <Button variant="outline" onClick={() => setFilter("all")}>
                View All Notifications
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      <Card className="vine-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Email Notifications</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>New comments on stories</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Story milestones</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>New followers</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Weekly analytics report</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">In-App Notifications</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Real-time comments</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Instant likes</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin announcements</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>System updates</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => onNavigate("settings")}>
              Manage All Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}