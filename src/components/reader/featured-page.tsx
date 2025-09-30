import { StoryCard } from "@/components/ui/story-card"
import { useStories } from "@/hooks/useStories"
import { Star, Award, Crown } from "lucide-react"

interface FeaturedPageProps {
  onNavigate: (page: string, data?: any) => void
}

export function FeaturedPage({ onNavigate }: FeaturedPageProps) {
  const { stories = [] } = useStories()
  
  // Filter featured stories (top rated or editor's choice)
  const featuredStories = stories.filter(story => story.like_count && story.like_count > 50)
    .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    .slice(0, 12)

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
    <div className="featured-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="container-system py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="h-8 w-8 text-primary" />
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <h1 className="typography-h1">Featured Stories</h1>
            <p className="typography-large text-muted-foreground max-w-2xl mx-auto">
              Hand-picked stories that showcase the best of visual storytelling
            </p>
          </div>
        </div>
      </div>

      {/* Featured Badge Section */}
      <div className="featured-badges">
        <div className="container-system">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="feature-badge">
              <Award className="h-12 w-12 text-primary mb-3" />
              <h3 className="typography-h4 mb-2">Editor's Choice</h3>
              <p className="typography-body text-muted-foreground">
                Curated by our editorial team
              </p>
            </div>
            <div className="feature-badge">
              <Star className="h-12 w-12 text-primary mb-3" />
              <h3 className="typography-h4 mb-2">Highest Rated</h3>
              <p className="typography-body text-muted-foreground">
                Loved by the community
              </p>
            </div>
            <div className="feature-badge">
              <Crown className="h-12 w-12 text-primary mb-3" />
              <h3 className="typography-h4 mb-2">Award Winners</h3>
              <p className="typography-body text-muted-foreground">
                Recognized for excellence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Stories Grid */}
      <div className="stories-section">
        <div className="container-system">
          <div className="stories-grid">
            {featuredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onRead={() => handleReadStory(story)}
              />
            ))}
          </div>

          {featuredStories.length === 0 && (
            <div className="empty-state">
              <div className="text-center py-16">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="typography-h3 mb-2">No featured stories yet</h3>
                <p className="typography-body text-muted-foreground">
                  Check back soon for our hand-picked selection
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}