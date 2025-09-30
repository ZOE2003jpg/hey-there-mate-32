import { 
  BookOpen, 
  Heart, 
  Play,
  Bookmark
} from "lucide-react"

interface StoryCardProps {
  story: {
    id: string
    title: string
    author?: string
    genre?: string
    cover_image_url?: string
    view_count?: number
    like_count?: number
    description?: string
  }
  onRead?: () => void
  onLike?: (e?: any) => void
  onBookmark?: (e?: any) => void
}

export function StoryCard({ story, onRead, onLike, onBookmark }: StoryCardProps) {
  // Get author name from profiles or fallback to author field
  const authorName = (story as any)?.profiles?.display_name || 
                    (story as any)?.profiles?.username || 
                    story.author || 
                    'Anonymous'

  return (
    <article className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col h-full">
      {/* Cover Image Container - Square Aspect Ratio */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {story.cover_image_url ? (
          <img 
            src={story.cover_image_url} 
            alt={`Cover image for ${story.title}`} 
            loading="lazy"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* Story Content - Flex grow to fill space */}
      <div className="p-3 flex-1 flex flex-col space-y-2 text-center">
        {/* Genre Pill */}
        {story.genre && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full w-fit mx-auto">
            {story.genre}
          </span>
        )}
        
        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors break-words">
          {story.title}
        </h3>
        
        {/* Author */}
        <p className="text-xs text-muted-foreground break-words">
          by {authorName}
        </p>
        
        {/* Story Stats Row */}
        <div className="flex items-center justify-center space-x-3 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3" />
            <span>{story.like_count || 0}</span>
          </div>
        </div>
        
        {/* Action Buttons - Auto margin top to push to bottom */}
        <div className="flex items-center space-x-1 mt-auto pt-2">
          <button 
            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
            onClick={onRead}
          >
            <Play className="h-3 w-3" />
            <span>Read</span>
          </button>
          <button 
            className="flex items-center justify-center w-7 h-7 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            onClick={onBookmark}
            title="Save to Library"
          >
            <Bookmark className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  )
}