import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
      {/* Cover Image */}
      <div className="story-cover">
        {story.cover_image_url ? (
          <img 
            src={story.cover_image_url} 
            alt={story.title} 
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
        <div className="space-y-2">
          {story.genre && (
            <Badge variant="secondary" className="story-genre">
              {story.genre}
            </Badge>
          )}
          <h3 className="story-title">{story.title}</h3>
          {story.author && (
            <p className="story-author">by {story.author}</p>
          )}
        </div>
        
        {/* Story Stats */}
        <div className="story-stats">
          <div className="flex items-center space-x-4">
            <div className="story-stat">
              <Eye className="h-3 w-3" />
              <span>{story.view_count || 0}</span>
            </div>
            <div className="story-stat">
              <Heart className="h-3 w-3" />
              <span>{story.like_count || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Story Actions */}
        <div className="story-actions">
          <Button 
            className="story-read-btn"
            onClick={onRead}
          >
            <Play className="h-4 w-4 mr-2" />
            Read Story
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="story-like-btn"
            onClick={onLike}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="story-bookmark-btn"
            onClick={onBookmark}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}