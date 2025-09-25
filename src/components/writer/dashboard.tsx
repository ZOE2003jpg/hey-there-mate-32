import { Button } from "@/components/ui/button"
import { useStories } from "@/hooks/useStories"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useEarnings } from "@/hooks/useEarnings"
import { useUser } from "@/components/user-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateStoryModal } from "./create-story-modal"
import { 
  PenTool, 
  Plus, 
  BookOpen, 
  BarChart3, 
  DollarSign, 
  Bell,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Users
} from "lucide-react"

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useUser()
  const { stories, loading: storiesLoading } = useStories()
  const { writerStats, loading: analyticsLoading } = useAnalytics(user?.id)
  const { stats: earningsStats } = useEarnings(user?.id)

  const userStories = stories.filter(story => story.author_id === user?.id)
  
  const stats = {
    totalStories: userStories.length,
    totalReads: writerStats.total_reads,
    totalLikes: writerStats.total_likes,
    totalComments: writerStats.total_comments,
    earnings: earningsStats.totalEarnings,
    followers: writerStats.total_followers
  }

  const recentNotifications = [
    {
      id: 1,
      message: "New story analytics available",
      time: "2 hours ago",
      type: "analytics"
    },
    {
      id: 2,
      message: `Total earnings: $${earningsStats.totalEarnings.toFixed(2)}`,
      time: "1 day ago", 
      type: "earnings"
    },
    {
      id: 3,
      message: `${stats.totalStories} stories published`,
      time: "3 days ago",
      type: "milestone"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden xs:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Writer Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Welcome back! Here's your writing progress overview
            </p>
          </div>
        </div>
        <CreateStoryModal onStoryCreated={(story) => onNavigate("story-view", { story })}>
          <Button size="lg" className="vine-button-hero text-sm sm:text-base">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Create New </span>Story
          </Button>
        </CreateStoryModal>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              {storiesLoading ? "..." : stats.totalStories}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Stories</div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              {analyticsLoading ? "..." : stats.totalReads.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Reads</div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              {analyticsLoading ? "..." : stats.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Likes</div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">
              {analyticsLoading ? "..." : stats.totalComments}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Comments</div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">${stats.earnings.toFixed(2)}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Earnings</div>
          </CardContent>
        </Card>

        <Card className="vine-card text-center">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{analyticsLoading ? "..." : stats.followers}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateStoryModal onStoryCreated={(story) => onNavigate("story-view", { story })}>
          <Card className="vine-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6 text-center">
              <Plus className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-2 sm:mb-4" />
              <CardTitle className="mb-1 sm:mb-2 text-sm sm:text-base">Create New Story</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Start writing your next masterpiece</CardDescription>
            </CardContent>
          </Card>
        </CreateStoryModal>

        <Card className="vine-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("manage-stories")}>
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6 text-center">
            <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-2 sm:mb-4" />
            <CardTitle className="mb-1 sm:mb-2 text-sm sm:text-base">Manage Stories</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Edit and organize your existing works</CardDescription>
          </CardContent>
        </Card>

        <Card className="vine-card cursor-pointer hover:shadow-lg transition-shadow lg:col-span-1 col-span-2" onClick={() => onNavigate("analytics")}>
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6 text-center">
            <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-2 sm:mb-4" />
            <CardTitle className="mb-1 sm:mb-2 text-sm sm:text-base">View Analytics</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Track your story performance</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Preview */}
      <Card className="vine-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("notifications")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <div className="font-medium">{notification.message}</div>
                  <div className="text-sm text-muted-foreground">{notification.time}</div>
                </div>
                <Badge variant="secondary">{notification.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}