import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStories } from "@/hooks/useStories"
import { 
  Search,
  Filter,
  BookOpen,
  Star,
  Eye,
  Clock,
  TrendingUp,
  X,
  Heart,
  Bookmark
} from "lucide-react"

interface SearchPageProps {
  onNavigate: (page: string, data?: any) => void
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [query, setQuery] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)
  const { stories, loading } = useStories()

  const genres = [
    "Sci-Fi", "Romance", "Fantasy", "Thriller", "Drama", "Mystery", 
    "Horror", "Comedy", "Historical", "Adventure", "Crime", "Psychological"
  ]

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "popular", label: "Most Popular" },
    { value: "recent", label: "Recently Updated" },
    { value: "rating", label: "Highest Rated" },
    { value: "length", label: "Story Length" }
  ]

  // Filter and search through real stories
  const searchResults = stories.filter(story => {
    if (!query.trim()) return false
    
    const matchesQuery = story.title.toLowerCase().includes(query.toLowerCase()) ||
                        (story.description || "").toLowerCase().includes(query.toLowerCase()) ||
                        (story.profiles?.display_name || story.profiles?.username || "").toLowerCase().includes(query.toLowerCase())
    
    const matchesGenre = selectedGenres.length === 0 || 
                        (story.genre && selectedGenres.includes(story.genre)) ||
                        (story.story_tags && story.story_tags.some(tag => selectedGenres.includes(tag.tag)))
    
    return matchesQuery && matchesGenre && story.status === 'published'
  }).sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.view_count - a.view_count
      case "recent":
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case "rating":
        return b.like_count - a.like_count
      default:
        return 0
    }
  })

  const popularSearches = [
    "quantum", "romance", "AI", "thriller", "mystery", "space", "love", "adventure"
  ]

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const clearFilters = () => {
    setSelectedGenres([])
    setSortBy("relevance")
  }

  return (
    <div className="space-y-6 sm:space-y-8">
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
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Search Stories
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Find your next favorite read
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden xs:inline">Filters</span> {selectedGenres.length > 0 && `(${selectedGenres.length})`}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for stories, authors, or keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-10 sm:h-12 text-sm sm:text-lg"
        />
      </div>

      {/* Popular Searches */}
      {!query && (
        <Card className="vine-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(search)}
                  className="capitalize text-xs sm:text-sm"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card className="vine-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                  Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Genres */}
            <div>
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGenre(genre)}
                    className="text-xs sm:text-sm"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Sort By</h3>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(option.value)}
                    className="text-xs sm:text-sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">
              {searchResults.length} results for "{query}"
            </h2>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Sorted by {sortOptions.find(opt => opt.value === sortBy)?.label}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading stories...</div>
          ) : searchResults.length === 0 ? (
            <Card className="vine-card">
              <CardContent className="pt-6 pb-6 text-center">
                <Search className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No stories found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-6">
              {searchResults.map((story) => (
                <Card key={story.id} className="vine-card hover-scale cursor-pointer" onClick={() => onNavigate("details", story)}>
                  <CardContent className="pt-4 p-3 sm:pt-6 sm:p-6">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-16 h-20 sm:w-20 sm:h-28 bg-muted/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        {story.cover_image_url ? (
                          <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{story.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-1">
                              by {story.profiles?.display_name || story.profiles?.username || "Anonymous"}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
                              {story.description || "No description available"}
                            </p>
                          </div>
                          <Badge variant={story.status === "published" ? "default" : "secondary"} className="flex-shrink-0 text-xs">
                            {story.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="text-xs">{story.genre || "General"}</Badge>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span className="hidden xs:inline">{story.view_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-primary" />
                            <span className="hidden xs:inline">{story.like_count}</span>
                          </div>
                          <span className="text-muted-foreground hidden sm:inline">{story.comment_count} comments</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {e.stopPropagation(); /* handle library add */}}
                            className="h-7 px-2 text-xs"
                          >
                            <Bookmark className="h-3 w-3" />
                            <span className="hidden xs:inline ml-1">Save</span>
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-7 px-3 text-xs vine-button-hero" 
                            onClick={(e) => {e.stopPropagation(); onNavigate("story-chapters", story)}}
                          >
                            Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}