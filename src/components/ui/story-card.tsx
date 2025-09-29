import { 
  BookOpen, 
  Eye, 
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
  return (
    <article className="story-card">
      {/* Cover Image - 2:3 Aspect Ratio */}
      <div className="story-cover">
        {story.cover_image_url ? (
          <img 
            src={story.cover_image_url} 
            alt={`Cover image for ${story.title}`} 
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* Story Content */}
      <div className="story-content">
        {/* Genre Pill */}
        {story.genre && (
          <div className="story-genre">
            {story.genre}
          </div>
        )}
        
        {/* Title */}
        <h3 className="story-title">{story.title}</h3>
        
        {/* Author */}
        {story.author && (
          <p className="story-author">by {story.author}</p>
        )}
        
        {/* Story Stats Row */}
        <div className="story-stats">
          <div className="story-stat">
            <Eye className="h-4 w-4" />
            <span>{story.view_count || 0}</span>
          </div>
          <div className="story-stat">
            <Heart className="h-4 w-4" />
            <span>{story.like_count || 0}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="story-actions">
          <button 
            className="story-read-btn"
            onClick={onRead}
          >
            <Play className="h-4 w-4" />
            <span>Read</span>
          </button>
          <button 
            className="story-bookmark-btn"
            onClick={onBookmark}
            title="Save to Library"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}