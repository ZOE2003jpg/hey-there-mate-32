import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft,
  ChevronRight,
  Menu,
  Heart,
  MessageCircle,
  Share,
  X,
  Play,
  SkipForward
} from "lucide-react"
import { useSlides } from "@/hooks/useSlides"
import { useReads } from "@/hooks/useReads"
import { useLikes } from "@/hooks/useLikes"
import { useAds } from "@/hooks/useAds"
import { useUser } from "@/components/user-context"
import { toast } from "sonner"

interface SlideReaderProps {
  story: any
  onNavigate: (page: string, data?: any) => void
}

export function SlideReader({ story, onNavigate }: SlideReaderProps) {
  const { user } = useUser()
  const [currentSlide, setCurrentSlide] = useState(1)
  const [showMenu, setShowMenu] = useState(false)
  const [showAd, setShowAd] = useState(false)
  const [adCountdown, setAdCountdown] = useState(5)
  const [currentAd, setCurrentAd] = useState<any>(null)
  const [allSlides, setAllSlides] = useState<any[]>([])
  const [currentChapter, setCurrentChapter] = useState<string | null>(null)
  
  const { getSlidesWithAds } = useSlides()
  const { trackProgress, getReadingProgress } = useReads(user?.id)
  const { toggleLike, isLiked } = useLikes(user?.id)
  const { incrementImpressions, incrementClicks } = useAds()

  const totalSlides = allSlides.length
  const progress = totalSlides > 0 ? Math.round((currentSlide / totalSlides) * 100) : 0

  // Load slides with ads when story/chapter changes
  useEffect(() => {
    const loadSlidesWithAds = async () => {
      if (!story?.id) return
      
      // Get the first available chapter with content
      let firstChapter = null
      if (story.chapters && story.chapters.length > 0) {
        firstChapter = story.chapters.find(ch => ch.content && ch.content.trim()) || story.chapters[0]
      }
      
      if (!firstChapter) {
        // No chapters available - show error message
        setAllSlides([{
          content: 'No chapters available to read. Please check back later.',
          type: 'content',
          slide_number: 1
        }])
        return
      }

      setCurrentChapter(firstChapter.id)
      
      try {
        const slidesData = await getSlidesWithAds(firstChapter.id, user?.id)
        if (slidesData.slides && slidesData.slides.length > 0) {
          setAllSlides(slidesData.slides)
        } else {
          // If no slides exist, create them from chapter content
          if (firstChapter.content) {
            const words = firstChapter.content.split(/\s+/)
            const wordsPerSlide = 400
            const slides = []
            
            for (let i = 0; i < words.length; i += wordsPerSlide) {
              const slideWords = words.slice(i, i + wordsPerSlide)
              slides.push({
                content: slideWords.join(" "),
                type: 'content',
                slide_number: slides.length + 1
              })
            }
            
            setAllSlides(slides)
          }
        }
      } catch (error) {
        console.error('Failed to load slides:', error)
        // Fallback: create slides from chapter content
        if (firstChapter?.content) {
          const words = firstChapter.content.split(/\s+/)
          const wordsPerSlide = 400
          const slides = []
          
          for (let i = 0; i < words.length; i += wordsPerSlide) {
            const slideWords = words.slice(i, i + wordsPerSlide)
            slides.push({
              content: slideWords.join(" "),
              type: 'content',
              slide_number: slides.length + 1
            })
          }
          
          setAllSlides(slides)
        }
      }
    }

    loadSlidesWithAds()
  }, [story, user?.id])

  // Track reading progress
  useEffect(() => {
    if (!user?.id || !story?.id || !currentChapter || totalSlides === 0) return

    const trackCurrentProgress = async () => {
      try {
        const isCompleted = currentSlide === totalSlides
        await trackProgress(user.id, story.id, currentChapter, currentSlide.toString(), progress)
      } catch (error) {
        console.error('Failed to track progress:', error)
      }
    }

    const timeoutId = setTimeout(trackCurrentProgress, 2000) // Track after 2 seconds on slide
    return () => clearTimeout(timeoutId)
  }, [currentSlide, user?.id, story?.id, currentChapter, totalSlides])

  // Handle ad display
  useEffect(() => {
    const currentSlideData = allSlides[currentSlide - 1]
    if (currentSlideData && currentSlideData.type === 'ad') {
      setCurrentAd(currentSlideData.ad)
      setShowAd(true)
      setAdCountdown(5)
      
      // Track ad impression
      if (currentSlideData.ad?.id) {
        incrementImpressions(currentSlideData.ad.id)
      }
    }
  }, [currentSlide, allSlides])

  // Ad countdown
  useEffect(() => {
    if (showAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [showAd, adCountdown])

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const skipAd = () => {
    setShowAd(false)
    setAdCountdown(5)
    setCurrentAd(null)
  }

  const handleAdClick = () => {
    if (currentAd?.id) {
      incrementClicks(currentAd.id)
    }
    // Handle ad click action
    toast.info('Ad clicked!')
  }

  const handleLikeToggle = async () => {
    if (!user?.id || !story?.id) {
      toast.error('Please login to like stories')
      return
    }

    try {
      await toggleLike(story.id, user.id)
      toast.success(isLiked(story.id) ? 'Story liked!' : 'Like removed')
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const handleSlideNavigation = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    
    if (x > width * 0.7) {
      nextSlide() // Right 30% - next slide
    } else if (x < width * 0.3) {
      prevSlide() // Left 30% - previous slide
    } else {
      setShowMenu(!showMenu) // Center 40% - toggle menu
    }
  }

  if (showAd) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="relative max-w-2xl w-full mx-4">
          <div className="bg-background border rounded-lg p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Play className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Advertisement</h3>
              <p className="text-muted-foreground">
                Supporting VineNovel with a short message
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-6">
              {currentAd ? (
                <>
                  <p className="text-lg font-medium">{currentAd.title || 'Advertisement'}</p>
                  <p className="text-muted-foreground mt-2">{currentAd.description || 'Sponsored content'}</p>
                  {currentAd.video_url && (
                    <video 
                      src={currentAd.video_url} 
                      className="w-full h-32 object-cover rounded mt-4"
                      controls
                    />
                  )}
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">Discover amazing stories on VineNovel Premium</p>
                  <p className="text-muted-foreground mt-2">Ad-free reading experience with exclusive content</p>
                </>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={skipAd}
                disabled={adCountdown > 0}
                className="min-w-32"
              >
                {adCountdown > 0 ? (
                  <>Skip in {adCountdown}s</>
                ) : (
                  <>
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip Ad
                  </>
                )}
              </Button>
              <Button className="vine-button-hero" onClick={handleAdClick}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background z-40 w-full h-full">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Menu Overlay */}
      {showMenu && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="max-w-md w-full mx-4 px-2 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{story?.title || "The Digital Awakening"}</h2>
              <p className="text-muted-foreground">by {story?.author || "Sarah Chen"}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Slide {currentSlide} of {totalSlides} • {progress}% complete
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => onNavigate("library")}
                className="h-16 flex-col gap-2"
              >
                <MessageCircle className="h-6 w-6" />
                Library
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate("settings")}
                className="h-16 flex-col gap-2"
              >
                <Menu className="h-6 w-6" />
                Settings
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                size="sm"
                variant={story?.id && isLiked(story.id) ? "default" : "outline"}
                onClick={handleLikeToggle}
              >
                <Heart className={`h-4 w-4 mr-2 ${story?.id && isLiked(story.id) ? 'fill-current' : ''}`} />
                {story?.id && isLiked(story.id) ? 'Liked' : 'Like'}
              </Button>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comment
              </Button>
              <Button size="sm" variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowMenu(false)}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Close Menu
            </Button>
          </div>
        </div>
      )}

      {/* Main Reading Area */}
      <div 
        className="h-full w-full flex items-center justify-center cursor-pointer select-none px-4 sm:px-6 lg:px-8 py-8"
        onClick={handleSlideNavigation}
      >
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="vine-slide-reader">
            <div className="vine-slide-content">
              <div className="prose prose-lg sm:prose-xl lg:prose-2xl max-w-none text-center">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium">
                  {allSlides[currentSlide - 1]?.content || 'Loading slide content...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Hints */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          <span>Tap left</span>
        </div>
        <div className="w-px h-4 bg-border"></div>
        <div className="flex items-center gap-2">
          <Menu className="h-4 w-4" />
          <span>Tap center</span>
        </div>
        <div className="w-px h-4 bg-border"></div>
        <div className="flex items-center gap-2">
          <span>Tap right</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Exit Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("discover")}
        className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10"
      >
        <X className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Exit</span>
      </Button>

      {/* Slide Counter */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-background/80 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm">
        {currentSlide} / {totalSlides}
      </div>
    </div>
  )
}