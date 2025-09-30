import { useState } from "react"
import { useStories } from "@/hooks/useStories"
import { useLikes } from "@/hooks/useLikes"
import { useLibrary } from "@/hooks/useLibrary"
import { useUser } from "@/components/user-context"
import { useStatistics } from "@/hooks/useStatistics"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StoryCard } from "@/components/ui/story-card"
import { SignupPromptDialog } from "@/components/signup-prompt-dialog"
import { 
  BookOpen, 
  Star,
  Bookmark,
  TrendingUp,
  Heart,
  Clock,
  Filter
} from "lucide-react"

interface DiscoverPageProps {
  onNavigate: (page: string, data?: any) => void
}

export function DiscoverPage({ onNavigate }: DiscoverPageProps) {
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [signupFeature, setSignupFeature] = useState("save stories to your library")
  const { stories, loading } = useStories()
  const { user } = useUser()
  const { toggleLike, isLiked } = useLikes(user?.id)
  const { addToLibrary, isInLibrary } = useLibrary(user?.id)
  const { statistics, loading: statsLoading } = useStatistics()

  const handleLike = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      toast.error("Please login to like stories")
      return
    }
    try {
      await toggleLike(storyId, user.id)
      toast.success("Story liked!")
    } catch (error) {
      toast.error("Failed to like story")
    }
  }

  const handleAddToLibrary = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      setSignupFeature("save stories to your library")
      setShowSignupPrompt(true)
      return
    }
    if (isInLibrary(storyId)) {
      toast.info("Story is already in your library")
      return
    }
    try {
      await addToLibrary(storyId, user.id)
      toast.success("Added to library!")
    } catch (error) {
      console.error("Library error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add to library")
    }
  }

  const handleSignup = () => {
    setShowSignupPrompt(false)
    // Navigate to home which will trigger the login modal
    window.location.href = "/"
  }

  const filteredStories = stories.filter(story => 
    selectedGenre === "all" || story.genre === selectedGenre
  )

  const featuredStories = filteredStories.slice(0, 6)
  const trendingStories = filteredStories
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6)

  const genres = ["all", ...Array.from(new Set(stories.map(story => story.genre).filter(Boolean)))]

  return (
    <>
      <SignupPromptDialog
        open={showSignupPrompt}
        onOpenChange={setShowSignupPrompt}
        onSignup={handleSignup}
        feature={signupFeature}
      />
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="typography-h1 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Discover Stories
          </h1>
          <p className="typography-body text-muted-foreground mt-2">
            Find your next favorite story from our curated collection
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => onNavigate("search")}
          className="btn-secondary"
        >
          <Filter className="h-4 w-4 mr-2" />
          Advanced Search
        </Button>
      </div>

      {/* Genre Filter */}
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGenre(genre)}
            className={selectedGenre === genre ? "btn-primary" : "btn-ghost"}
          >
            {genre === "all" ? "All Genres" : genre}
          </Button>
        ))}
      </div>

      {/* Featured Stories */}
      <section>
        <div className="mb-6">
          <h2 className="typography-h2 flex items-center gap-3">
            <Star className="h-6 w-6 text-primary" />
            Featured Stories
          </h2>
          <p className="typography-body text-muted-foreground mt-2">
            Editor's picks and trending releases
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stories...</p>
          </div>
        ) : (
          <div className="story-grid">
            {featuredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={{
                  ...story,
                  author: story.profiles?.display_name || story.profiles?.username || "Anonymous"
                }}
                onRead={() => onNavigate("story-chapters", story)}
                onLike={(e) => {
                  e?.stopPropagation();
                  handleLike(story.id, e as React.MouseEvent);
                }}
                onBookmark={(e) => {
                  e?.stopPropagation();
                  handleAddToLibrary(story.id, e as React.MouseEvent);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trending This Week */}
      <Card className="vine-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trending This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:gap-4">
            {trendingStories.map((story, index) => (
              <Card key={story.id} className="vine-card hover-scale cursor-pointer" onClick={() => onNavigate("details", story)}>
                <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
                  <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="text-lg sm:text-2xl font-bold text-primary/60 w-6 sm:w-8 flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{story.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-1">
                          by {story.profiles?.display_name || story.profiles?.username || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-4 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{story.genre || "General"}</Badge>
                          <div className="flex items-center gap-1 text-xs">
                            <Heart className="h-3 w-3 text-primary" />
                            {story.like_count}
                          </div>
                          <span className="text-xs text-muted-foreground hidden sm:inline">{story.comment_count} comments</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={(e) => handleAddToLibrary(story.id, e)}
                        className={`${isInLibrary(story.id) ? "text-primary" : ""} h-8`}
                      >
                        <Bookmark className={`h-3 w-3 ${isInLibrary(story.id) ? "fill-primary" : ""}`} />
                      </Button>
                      <Button size="sm" className="vine-button-hero h-8 px-3 text-xs" onClick={(e) => {e.stopPropagation(); onNavigate("story-chapters", story)}}>
                        Read Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Categories */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {[
          { 
            name: "Most Liked", 
            icon: Heart, 
            count: statsLoading ? "Loading..." : `${statistics.mostLikedCount} stories`
          },
          { 
            name: "Recently Updated", 
            icon: Clock, 
            count: statsLoading ? "Loading..." : `${statistics.recentlyUpdatedCount} new chapters`
          },
          { 
            name: "Quick Reads", 
            icon: BookOpen, 
            count: statsLoading ? "Loading..." : `${statistics.quickReadsCount} quick stories`
          },
          { 
            name: "Completed", 
            icon: Star, 
            count: statsLoading ? "Loading..." : `${statistics.completedCount} finished stories`
          }
        ].map((category) => (
          <Card key={category.name} className="vine-card hover-scale cursor-pointer">
            <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6 text-center">
              <category.icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-4 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base mb-1">{category.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{category.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  )
}