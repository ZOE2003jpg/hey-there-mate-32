import { StoryCard } from "@/components/ui/story-card"
import { useStories } from "@/hooks/useStories"
import { TrendingUp, Flame, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface TrendingPageProps {
  onNavigate: (page: string, data?: any) => void
}

export function TrendingPage({ onNavigate }: TrendingPageProps) {
  const { stories = [] } = useStories()
  const [timePeriod, setTimePeriod] = useState("week")
  
  // Sort stories by view count and likes for trending
  const trendingStories = stories
    .filter(story => story.view_count && story.view_count > 0)
    .sort((a, b) => {
      const scoreA = (a.view_count || 0) + (a.like_count || 0) * 2
      const scoreB = (b.view_count || 0) + (b.like_count || 0) * 2
      return scoreB - scoreA
    })
    .slice(0, 20)

  const timePeriods = [
    { id: "day", label: "Today", icon: Clock },
    { id: "week", label: "This Week", icon: Calendar },
    { id: "month", label: "This Month", icon: TrendingUp },
  ]

  const handleReadStory = (story: any) => {
    onNavigate("story-chapters", story)
  }

  const handleLikeStory = (story: any) => {
    console.log("Like story:", story.id)
  }

  const handleBookmarkStory = (story: any) => {
    console.log("Bookmark story:", story.id)
  }

  return (
    <div className="trending-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container-system py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <h1 className="typography-h1">Trending Stories</h1>
            <p className="typography-large text-muted-foreground max-w-2xl mx-auto">
              The hottest stories everyone's talking about right now
            </p>
          </div>
        </div>
      </div>

      {/* Time Period Filters */}
      <div className="time-filters">
        <div className="container-system">
          <div className="flex justify-center space-x-4 mb-8">
            {timePeriods.map((period) => {
              const Icon = period.icon
              return (
                <Button
                  key={period.id}
                  variant={timePeriod === period.id ? "default" : "outline"}
                  onClick={() => setTimePeriod(period.id)}
                  className="time-filter-btn"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {period.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Trending Rankings */}
      <div className="rankings-section">
        <div className="container-system mb-8">
          <h2 className="typography-h2 mb-6 text-center">Top 3 This Week</h2>
          <div className="top-rankings">
            {trendingStories.slice(0, 3).map((story, index) => (
              <div key={story.id} className="ranking-card">
                <div className="ranking-number">#{index + 1}</div>
                <div className="ranking-content">
                  <StoryCard
                    story={story}
                    onRead={() => handleReadStory(story)}
                    onLike={() => handleLikeStory(story)}
                    onBookmark={() => handleBookmarkStory(story)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Trending Stories */}
      <div className="stories-section">
        <div className="container-system">
          <h2 className="typography-h2 mb-6">All Trending Stories</h2>
          <div className="stories-grid">
            {trendingStories.map((story, index) => (
              <div key={story.id} className="story-with-rank">
                <div className="rank-badge">#{index + 1}</div>
                <StoryCard
                  story={story}
                  onRead={() => handleReadStory(story)}
                  onLike={() => handleLikeStory(story)}
                  onBookmark={() => handleBookmarkStory(story)}
                />
              </div>
            ))}
          </div>

          {trendingStories.length === 0 && (
            <div className="empty-state">
              <div className="text-center py-16">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="typography-h3 mb-2">No trending stories yet</h3>
                <p className="typography-body text-muted-foreground">
                  Stories will appear here as they gain popularity
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}