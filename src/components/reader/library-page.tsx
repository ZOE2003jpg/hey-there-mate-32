import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useLibrary } from "@/hooks/useLibrary"
import { useReads } from "@/hooks/useReads"
import { useUser } from "@/components/user-context"
import { toast } from "sonner"
import { 
  BookOpen, 
  Library,
  Clock,
  CheckCircle,
  Heart,
  Trash2,
  MoreHorizontal,
  Filter,
  SortDesc,
  Search
} from "lucide-react"

interface LibraryPageProps {
  onNavigate: (page: string, data?: any) => void
}

export function LibraryPage({ onNavigate }: LibraryPageProps) {
  const { user } = useUser()
  const { library, loading, removeFromLibrary } = useLibrary(user?.id)
  const { reads } = useReads(user?.id)
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical">("recent")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLibrary = library
    .filter(item => 
      item.stories?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stories?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return (a.stories?.title || "").localeCompare(b.stories?.title || "")
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const getReadingProgress = (storyId: string, chapterId?: string) => {
    if (chapterId) {
      return reads.find(r => r.story_id === storyId && r.chapter_id === chapterId)
    }
    const storyReads = reads.filter(r => r.story_id === storyId)
    return storyReads.length > 0 ? storyReads[0] : null
  }

  const handleRemove = async (storyId: string) => {
    if (!user || !confirm("Remove this story from your library?")) return

    try {
      await removeFromLibrary(storyId, user.id)
      toast.success("Removed from library")
    } catch (error) {
      toast.error("Failed to remove from library")
    }
  }

  const getReadingStats = () => {
    const totalSaved = library.length
    const currentlyReading = reads.filter(r => (r.progress || 0) > 0 && (r.progress || 0) < 100).length
    const completed = reads.filter(r => (r.progress || 0) >= 100).length
    const totalSlides = reads.reduce((sum, r) => sum + (r.progress || 0), 0)
    
    return { totalSaved, currentlyReading, completed, totalSlides }
  }

  const stats = getReadingStats()

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
              <Library className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              My Library
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Your reading collection and progress
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "recent" ? "default" : "outline"}
            onClick={() => setSortBy("recent")}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <Clock className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Recent</span>
          </Button>
          <Button
            variant={sortBy === "alphabetical" ? "default" : "outline"}
            onClick={() => setSortBy("alphabetical")}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <Filter className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">A-Z</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="vine-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Library Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className="vine-card">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6 text-center">
            <Library className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
            <div className="text-lg sm:text-2xl font-bold">{stats.totalSaved}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Saved Stories</div>
          </CardContent>
        </Card>
        <Card className="vine-card">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6 text-center">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
            <div className="text-lg sm:text-2xl font-bold">{stats.currentlyReading}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Currently Reading</div>
          </CardContent>
        </Card>
        <Card className="vine-card">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6 text-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
            <div className="text-lg sm:text-2xl font-bold">{stats.completed}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="vine-card">
          <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6 text-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
            <div className="text-lg sm:text-2xl font-bold">{stats.totalSlides}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Slides Read</div>
          </CardContent>
        </Card>
      </div>

      {/* Library Content */}
      {loading ? (
        <div className="text-center py-8">Loading library...</div>
      ) : filteredLibrary.length === 0 ? (
        <Card className="vine-card">
          <CardContent className="text-center py-12">
            <Library className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {library.length === 0 ? "No Saved Stories" : "No Stories Found"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {library.length === 0 
                ? "Start building your library by saving stories you love"
                : "Try adjusting your search terms"
              }
            </p>
            {library.length === 0 && (
              <Button 
                className="vine-button-hero" 
                onClick={() => onNavigate("discover")}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Discover Stories
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredLibrary.map((item) => {
            const story = item.stories
            if (!story) return null

            return (
              <Card key={item.id} className="vine-card cursor-pointer hover:shadow-lg transition-shadow">
                <div 
                  onClick={() => onNavigate("reader", story)}
                  className="cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-muted/30 rounded-t-lg mb-3 sm:mb-4 flex items-center justify-center">
                    {story.cover_image_url ? (
                      <img 
                        src={story.cover_image_url} 
                        alt={story.title} 
                        className="w-full h-full object-cover rounded-t-lg" 
                      />
                    ) : (
                      <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <CardContent className="pt-0 p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2">
                    {story.genre && (
                      <Badge variant="outline" className="text-xs">{story.genre}</Badge>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(story.id)
                      }}
                      className="text-destructive hover:text-destructive h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-sm sm:text-lg mb-1 line-clamp-2">{story.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">
                    by {story.profiles?.display_name || story.profiles?.username || "Anonymous"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 hidden sm:block">
                    {story.description || "No description available"}
                  </p>
                  
                  <div className="text-xs text-muted-foreground mb-3 sm:mb-4">
                    <span className="hidden sm:inline">Added {new Date(item.created_at).toLocaleDateString()}</span>
                    {(() => {
                      const progress = getReadingProgress(story.id)
                      if (progress && !Array.isArray(progress)) {
                        return (
                          <div className="mt-1">
                            <div className="text-xs">Progress: {Math.round(progress.progress || 0)}%</div>
                            <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2 mt-1">
                              <div 
                                className="bg-primary h-1.5 sm:h-2 rounded-full" 
                                style={{ width: `${Math.min(100, progress.progress || 0)}%` }}
                              />
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>

                  <Button 
                    className="w-full vine-button-hero text-xs sm:text-sm h-7 sm:h-9"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigate("reader", story)
                    }}
                  >
                    Start Reading
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}