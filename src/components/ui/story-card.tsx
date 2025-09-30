import { 
  BookOpen, 
  Play
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
}

export function StoryCard({ story, onRead }: StoryCardProps) {
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
        
        {/* Action Button - Auto margin top to push to bottom */}
        <button 
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity mt-auto"
          onClick={onRead}
        >
          <Play className="h-4 w-4" />
          <span>Read</span>
        </button>
      </div>
    </article>
  )
}