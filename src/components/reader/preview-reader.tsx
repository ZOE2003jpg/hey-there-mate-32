import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ArrowLeft
} from "lucide-react"

interface PreviewReaderProps {
  chapter: any
  onNavigate: (page: string, data?: any) => void
}

export function PreviewReader({ chapter, onNavigate }: PreviewReaderProps) {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [slides, setSlides] = useState<string[]>([])

  useEffect(() => {
    if (chapter?.content) {
      // Split content into slides (400 words per slide)
      const words = chapter.content.split(/\s+/)
      const wordsPerSlide = 400
      const newSlides = []
      
      for (let i = 0; i < words.length; i += wordsPerSlide) {
        const slideWords = words.slice(i, i + wordsPerSlide)
        newSlides.push(slideWords.join(" "))
      }
      
      setSlides(newSlides)
    }
  }, [chapter])

  const totalSlides = slides.length
  const progress = totalSlides > 0 ? Math.round((currentSlide / totalSlides) * 100) : 0

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

  const handleSlideNavigation = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    
    if (x > width * 0.7) {
      nextSlide() // Right 30% - next slide
    } else if (x < width * 0.3) {
      prevSlide() // Left 30% - previous slide
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-40 w-full h-full">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Preview Banner */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          Preview Mode
        </div>
      </div>

      {/* Main Reading Area */}
      <div 
        className="h-full w-full flex items-center justify-center cursor-pointer select-none px-4 sm:px-6 lg:px-8 py-8"
        onClick={handleSlideNavigation}
      >
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="vine-slide-reader">
            <div className="vine-slide-content">
              <div className="prose prose-lg sm:prose-xl lg:prose-2xl max-w-none text-center">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-8 text-primary">
                  {chapter?.title || 'Preview Chapter'}
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium">
                  {slides[currentSlide - 1] || 'Loading slide content...'}
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
          <span>Tap right</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Exit Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("add-chapter")}
        className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10"
      >
        <ArrowLeft className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Back to Editor</span>
      </Button>

      {/* Slide Counter */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-background/80 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm">
        {currentSlide} / {totalSlides}
      </div>
    </div>
  )
}