import { useState } from "react"
import { useStories } from "@/hooks/useStories"
import { useLikes } from "@/hooks/useLikes"
import { useLibrary } from "@/hooks/useLibrary"
import { useUser } from "@/components/user-context"
import { useStatistics } from "@/hooks/useStatistics"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Star,
  Eye,
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
      toast.error("Please login to save stories")
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

  const filteredStories = stories.filter(story => 
    selectedGenre === "all" || story.genre === selectedGenre
  )

  const featuredStories = filteredStories.slice(0, 6)
  const trendingStories = filteredStories
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6)

  const genres = ["all", ...Array.from(new Set(stories.map(story => story.genre).filter(Boolean)))]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden xs:inline">Back</span>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
              <span className="truncate">Discover Stories</span>
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
              Find your next favorite story
            </p>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => onNavigate("search")}
          className="flex items-center gap-2 text-xs sm:text-sm flex-shrink-0 self-start sm:self-auto"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden xs:inline">Advanced</span> Search
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
            className="capitalize"
          >
            {genre}
          </Button>
        ))}
      </div>

      {/* Featured Stories Carousel */}
      <Card className="vine-card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Featured Stories
          </CardTitle>
          <CardDescription>
            Editor's picks and new releases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading stories...</div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {/* Desktop: Grid layout with image on top */}
              <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {featuredStories.map((story) => (
                  <Card key={story.id} className="vine-card hover-scale cursor-pointer" onClick={() => onNavigate("details", story)}>
                    <CardContent className="p-4">
                      {/* Image on top for desktop */}
                      <div className="aspect-[3/4] bg-muted/30 rounded-lg mb-3 flex items-center justify-center">
                        {story.cover_image_url ? (
                          <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline" className="text-xs">{story.genre || "General"}</Badge>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => handleLike(story.id, e)}
                              className={`h-6 w-6 p-0 ${isLiked(story.id) ? "text-primary" : ""}`}
                            >
                              <Heart className={`h-3 w-3 ${isLiked(story.id) ? "fill-primary" : ""}`} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => handleAddToLibrary(story.id, e)}
                              className={`h-6 w-6 p-0 ${isInLibrary(story.id) ? "text-primary" : ""}`}
                            >
                              <Bookmark className={`h-3 w-3 ${isInLibrary(story.id) ? "fill-primary" : ""}`} />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-base line-clamp-2">{story.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          by {story.profiles?.display_name || story.profiles?.username || "Anonymous"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{story.view_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-primary" />
                              <span>{story.like_count}</span>
                            </div>
                          </div>
                          <Button size="sm" className="vine-button-hero h-7 px-3 text-xs" onClick={(e) => {e.stopPropagation(); onNavigate("story-chapters", story)}}>
                            Read
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tablet: Two-column layout */}
              <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-4">
                {featuredStories.map((story) => (
                  <Card key={story.id} className="vine-card hover-scale cursor-pointer" onClick={() => onNavigate("details", story)}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="aspect-[2/3] w-20 bg-muted/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          {story.cover_image_url ? (
                            <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex justify-between items-start">
                            <Badge variant="outline" className="text-xs">{story.genre || "General"}</Badge>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => handleLike(story.id, e)}
                                className={`h-6 w-6 p-0 ${isLiked(story.id) ? "text-primary" : ""}`}
                              >
                                <Heart className={`h-3 w-3 ${isLiked(story.id) ? "fill-primary" : ""}`} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => handleAddToLibrary(story.id, e)}
                                className={`h-6 w-6 p-0 ${isInLibrary(story.id) ? "text-primary" : ""}`}
                              >
                                <Bookmark className={`h-3 w-3 ${isInLibrary(story.id) ? "fill-primary" : ""}`} />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-2">{story.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            by {story.profiles?.display_name || story.profiles?.username || "Anonymous"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{story.view_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 text-primary" />
                                <span>{story.like_count}</span>
                              </div>
                            </div>
                            <Button size="sm" className="vine-button-hero h-7 px-3 text-xs" onClick={(e) => {e.stopPropagation(); onNavigate("story-chapters", story)}}>
                              Read
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mobile: Compact horizontal layout */}
              <div className="grid md:hidden grid-cols-1 gap-3">
                {featuredStories.map((story) => (
                  <Card key={story.id} className="vine-card hover-scale cursor-pointer" onClick={() => onNavigate("details", story)}>
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Thumbnail left */}
                        <div className="aspect-[2/3] w-16 bg-muted/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          {story.cover_image_url ? (
                            <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Title + author right */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <Badge variant="outline" className="text-xs">{story.genre || "General"}</Badge>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => handleLike(story.id, e)}
                                className={`h-6 w-6 p-0 ${isLiked(story.id) ? "text-primary" : ""}`}
                              >
                                <Heart className={`h-3 w-3 ${isLiked(story.id) ? "fill-primary" : ""}`} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => handleAddToLibrary(story.id, e)}
                                className={`h-6 w-6 p-0 ${isInLibrary(story.id) ? "text-primary" : ""}`}
                              >
                                <Bookmark className={`h-3 w-3 ${isInLibrary(story.id) ? "fill-primary" : ""}`} />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-2">{story.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            by {story.profiles?.display_name || story.profiles?.username || "Anonymous"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action buttons below */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{story.view_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-primary" />
                            <span>{story.like_count}</span>
                          </div>
                          <span className="text-muted-foreground">{story.comment_count}</span>
                        </div>
                        <Button size="sm" className="vine-button-hero h-7 px-3 text-xs" onClick={(e) => {e.stopPropagation(); onNavigate("story-chapters", story)}}>
                          Read
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                            <Eye className="h-3 w-3" />
                            {story.view_count}
                          </div>
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
  )
}