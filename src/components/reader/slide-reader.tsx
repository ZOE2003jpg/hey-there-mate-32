import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { ReactionBar } from "@/components/reader/reaction-bar"
import { FloatingEmoji } from "@/components/reader/floating-emoji"
import { EngagementBadge } from "@/components/reader/engagement-badge"
import { SlideComments } from "@/components/reader/slide-comments"
import { LiveCommentsOverlay } from "@/components/reader/live-comments-overlay"
import { 
  ChevronLeft,
  ChevronRight,
  Menu,
  Heart,
  MessageCircle,
  Share,
  X,
  Play,
  SkipForward,
  Type,
  Plus,
  Minus,
  BookOpen,
  Volume2,
  VolumeX,
  Bookmark,
  ArrowLeft,
  MoreVertical,
  Settings
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSlides } from "@/hooks/useSlides"
import { useReads } from "@/hooks/useReads"
import { useChapters } from "@/hooks/useChapters"
import { useRealtimeLikes } from "@/hooks/useRealtimeLikes"
import { useLibrary } from "@/hooks/useLibrary"
import { useBackgroundSound } from "@/hooks/useBackgroundSound"
import { useSoundsLibrary } from "@/hooks/useSoundsLibrary"
import { useRealtimeReactions } from "@/hooks/useRealtimeReactions"
import { useUser } from "@/components/user-context"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { OnboardingTutorial } from "@/components/onboarding-tutorial"
import { getReadingProgress as getLocalProgress } from "@/lib/localStorage"

interface SlideReaderProps {
  story: any
  chapter?: any
  onNavigate: (page: string, data?: any) => void
}

export function SlideReader({ story, chapter, onNavigate }: SlideReaderProps) {
  const { user } = useUser()
  const [currentSlide, setCurrentSlide] = useState(1)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showFontControls, setShowFontControls] = useState(false)
  const [showVolumeControls, setShowVolumeControls] = useState(false)
  const [showBottomControls, setShowBottomControls] = useState(false)
  const [allSlides, setAllSlides] = useState<any[]>([])
  const [currentChapter, setCurrentChapter] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('readerFontSize') || '16')
    }
    return 16
  })
  const [fontFamily, setFontFamily] = useState('serif')
  const [chaptersList, setChaptersList] = useState<any[]>([])
  const [nextChapterId, setNextChapterId] = useState<string | null>(null)
  const [showSoundMenu, setShowSoundMenu] = useState(false)
  const [chapterAudio, setChapterAudio] = useState<HTMLAudioElement | null>(null)
  const [isAtChapterEnd, setIsAtChapterEnd] = useState(false)
  const [audioVolume, setAudioVolume] = useState(0.5)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeoutId, setControlsTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [startX, setStartX] = useState<number | null>(null)
  const [showComments, setShowComments] = useState(false)
  
  // Unlock flag for autoplay policies
  const audioUnlockNeededRef = useRef(false)
  const removeAudioUnlockListenersRef = useRef<(() => void) | null>(null)

  const { slides, loading } = useSlides(chapter?.id)
  const { trackProgress, reads, getReadingProgress } = useReads(user?.id)
  const { chapters } = useChapters(story?.id)
  
  // Get all reading progress for chapter navigation
  const readingProgress = reads || []
  const { toggleLike, isLiked } = useRealtimeLikes(user?.id)
  const { addToLibrary, isInLibrary } = useLibrary(user?.id)
  const { currentSound, isPlaying, volume, defaultSounds, playSound, pauseSound, changeVolume } = useBackgroundSound()
  const { getChapterSounds } = useSoundsLibrary()
  
  // Get current slide ID for reactions
  const currentSlideData = allSlides[currentSlide - 1]
  const currentSlideId = currentSlideData?.id || `${currentChapter}-${currentSlide}`
  const { floatingReactions, removeReaction } = useRealtimeReactions(currentSlideId, user?.id)

  const totalSlides = allSlides.length
  const progress = totalSlides > 0 ? Math.round((currentSlide / totalSlides) * 100) : 0

  // Load slides when story/chapter changes
  useEffect(() => {
    const loadSlides = async (targetChapter?: any) => {
      if (!story?.id) return
      
      // Determine selected chapter and chapters list
      let selectedChapter = targetChapter || chapter
      let chaptersArr: any[] = []
      
      if (!selectedChapter && story.chapters && story.chapters.length > 0) {
        chaptersArr = story.chapters.filter((ch: any) => ch && typeof ch === 'object')
        selectedChapter = chaptersArr.find((ch: any) => ch.content && ch.content.trim()) || chaptersArr[0]
      }
      
      // If still no chapter, fetch from database
      if (!selectedChapter && story?.id) {
        console.log('No chapters in story data, fetching from database for story:', story.id)
        try {
          const { data: fetchedChapters } = await supabase
            .from('chapters')
            .select('*')
            .eq('story_id', story.id)
            .eq('status', 'published')
            .order('chapter_number', { ascending: true })
          
          chaptersArr = fetchedChapters || []
          if (chaptersArr.length > 0) {
            selectedChapter = chaptersArr[0]
            console.log('Found chapter from database:', selectedChapter)
          }
        } catch (error) {
          console.error('Failed to fetch chapters:', error)
        }
      }
      
      if (!selectedChapter) {
        // No chapters available - show error message
        setAllSlides([{ content: 'No chapters available to read. Please check back later.', type: 'content', slide_number: 1 }])
        return
      }

      // Maintain chapters list and compute nextChapterId
      try {
        if (!chaptersArr || chaptersArr.length === 0) {
          chaptersArr = (story?.chapters || []) as any[]
        }
        if (chaptersArr && chaptersArr.length > 0) {
          const ordered = [...chaptersArr].sort((a: any, b: any) => (a.chapter_number || 0) - (b.chapter_number || 0))
          setChaptersList(ordered)
          const idx = ordered.findIndex(c => c.id === selectedChapter.id)
          setNextChapterId(idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1].id : null)
        } else {
          setChaptersList([])
          setNextChapterId(null)
        }
      } catch (e) {
        console.warn('Unable to compute next chapter:', e)
      }

      setCurrentChapter(selectedChapter.id)
      setCurrentSlide(1)
      setIsAtChapterEnd(false)
      
      // Load chapter audio
      loadChapterAudio(selectedChapter.id)
      
      // Build slides locally from chapter content
      try {
        if (selectedChapter.content) {
          const words = selectedChapter.content.split(/\s+/).filter(word => word.trim())
          const wordsPerSlide = 400
          const slides: any[] = []
          
          for (let i = 0; i < words.length; i += wordsPerSlide) {
            const slideWords = words.slice(i, i + wordsPerSlide)
            slides.push({
              content: slideWords.join(' '),
              type: 'content',
              slide_number: slides.length + 1,
              chapter_title: selectedChapter.title
            })
          }
          
          // Add next chapter button slide if there's a next chapter
          if (nextChapterId) {
            slides.push({
              content: 'Chapter Complete!',
              type: 'chapter_end',
              slide_number: slides.length + 1,
              chapter_title: selectedChapter.title
            })
          }
          
          console.log('Created slides from chapter content:', slides)
          setAllSlides(slides)
        } else {
          console.log('No chapter content available')
          setAllSlides([{ content: 'Chapter content is not available.', type: 'content', slide_number: 1 }])
        }
      } catch (error) {
        console.error('Failed to load slides:', error)
        setAllSlides([{ content: 'Unable to load chapter content.', type: 'content', slide_number: 1 }])
      }
    }

    loadSlides()
  }, [story, chapter])

  // Helpers to unlock audio playback on user interaction
  const attachAudioUnlockListeners = (audio: HTMLAudioElement) => {
    const attempt = () => {
      audio.play().then(() => {
        removeAudioUnlockListeners()
      }).catch(() => {})
    }
    const onFirstInteraction = () => attempt()
    document.addEventListener('pointerdown', onFirstInteraction, { once: true })
    document.addEventListener('touchend', onFirstInteraction, { once: true })
    document.addEventListener('click', onFirstInteraction, { once: true })
    removeAudioUnlockListenersRef.current = () => {
      document.removeEventListener('pointerdown', onFirstInteraction)
      document.removeEventListener('touchend', onFirstInteraction)
      document.removeEventListener('click', onFirstInteraction)
    }
    audioUnlockNeededRef.current = true
  }

  const removeAudioUnlockListeners = () => {
    if (removeAudioUnlockListenersRef.current) {
      removeAudioUnlockListenersRef.current()
      removeAudioUnlockListenersRef.current = null
    }
    audioUnlockNeededRef.current = false
  }

  // Load chapter audio
  const loadChapterAudio = async (chapterId: string) => {
    try {
      const chapterSounds = await getChapterSounds(chapterId)
      if (chapterSounds.length > 0) {
        // Stop current audio
        if (chapterAudio) {
          chapterAudio.pause()
          chapterAudio.currentTime = 0
        }

        // Load first sound (could be enhanced to support multiple sounds)
        const sound = chapterSounds[0]
        if (sound.sound?.file_url) {
          const audio = new Audio(sound.sound.file_url)
          audio.preload = 'auto'
          const startingVolume = typeof sound.volume === 'number' ? Math.max(0, Math.min(1, sound.volume)) : 0.5
          audio.volume = startingVolume
          audio.loop = sound.loop_sound
          setChapterAudio(audio)
          setAudioVolume(startingVolume)

          // Add event listeners
          audio.onplay = () => {
            setIsAudioPlaying(true)
            // Once playing, no need for unlock listeners
            removeAudioUnlockListeners()
          }
          audio.onpause = () => setIsAudioPlaying(false)
          audio.onended = () => setIsAudioPlaying(false)

          // Try to play immediately (required behavior)
          audio.play().catch((_err) => {
            // Likely blocked by autoplay policy - resume on first user interaction
            attachAudioUnlockListeners(audio)
          })
        }
      } else {
        setChapterAudio(null)
      }
    } catch (error) {
      console.error('Failed to load chapter audio:', error)
    }
  }

  // Check if at chapter end
  useEffect(() => {
    const currentSlideData = allSlides[currentSlide - 1]
    setIsAtChapterEnd(currentSlideData?.type === 'chapter_end')
  }, [currentSlide, allSlides])

  // Cleanup audio when component unmounts or navigating away
  useEffect(() => {
    return () => {
      // Clean unlock listeners if any
      removeAudioUnlockListeners()
      if (chapterAudio) {
        chapterAudio.pause()
        chapterAudio.currentTime = 0
      }
    }
  }, [chapterAudio])

  const handleNavigateWithCleanup = (page: string, data?: any) => {
    // Stop music and clean up audio when navigating away
    if (chapterAudio) {
      chapterAudio.pause()
      chapterAudio.currentTime = 0
    }
    onNavigate(page, data)
  }

  // Get all chapters for navigation
  const allChapters = chapters.filter(chapter => chapter.status === 'published').sort((a, b) => a.chapter_number - b.chapter_number)
  
  // Find current chapter index and next chapter
  const currentChapterIndex = allChapters.findIndex(ch => ch.id === currentChapter)
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null
  
  const handleChapterNavigation = (targetChapter: any) => {
    handleNavigateWithCleanup('reader', { story, chapter: targetChapter })
  }

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

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const loadNextChapter = async () => {
    if (!nextChapterId) return
    
    // Stop current chapter audio
    if (chapterAudio) {
      chapterAudio.pause()
      chapterAudio.currentTime = 0
    }
    
    try {
      const { data: nextChapter } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', nextChapterId)
        .single()
      
      if (nextChapter) {
        // Load slides for next chapter  
        const loadSlides = async (targetChapter: any) => {
          setCurrentChapter(targetChapter.id)
          setCurrentSlide(1)
          
          // Load audio for new chapter
          loadChapterAudio(targetChapter.id)
          
          if (targetChapter.content) {
            const words = targetChapter.content.split(/\s+/).filter((word: string) => word.trim())
            const wordsPerSlide = 400
            const slides: any[] = []
            
            for (let i = 0; i < words.length; i += wordsPerSlide) {
              const slideWords = words.slice(i, i + wordsPerSlide)
              slides.push({
                content: slideWords.join(' '),
                type: 'content',
                slide_number: slides.length + 1,
                chapter_title: targetChapter.title
              })
            }
            
            setAllSlides(slides)
            
            // Update next chapter ID
            const currentIndex = chaptersList.findIndex(c => c.id === targetChapter.id)
            setNextChapterId(currentIndex >= 0 && currentIndex < chaptersList.length - 1 ? chaptersList[currentIndex + 1].id : null)
          }
        }
        
        await loadSlides(nextChapter)
        toast.success(`Now reading: ${nextChapter.title}`)
      }
    } catch (error) {
      console.error('Failed to load next chapter:', error)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1)
    }
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

  const handleAddToLibrary = async () => {
    if (!user?.id || !story?.id) {
      toast.error('Please login to add to library')
      return
    }

    if (isInLibrary(story.id)) {
      toast.info("Story is already in your library")
      return
    }

    try {
      await addToLibrary(story.id, user.id)
      toast.success('Added to library!')
    } catch (error) {
      console.error("Library error:", error)
      toast.error(error instanceof Error ? error.message : 'Failed to add to library')
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    const volume = newVolume[0] / 100
    setAudioVolume(volume)
    if (chapterAudio) {
      chapterAudio.volume = volume
    }
    // Persist volume only within current chapter (no localStorage)
  }

  const increaseVolume = () => {
    const newVolume = Math.min(1, audioVolume + 0.1)
    setAudioVolume(newVolume)
    if (chapterAudio) {
      chapterAudio.volume = newVolume
    }
  }

  const decreaseVolume = () => {
    const newVolume = Math.max(0, audioVolume - 0.1)
    setAudioVolume(newVolume)
    if (chapterAudio) {
      chapterAudio.volume = newVolume
    }
  }

  const toggleAudioPlayback = () => {
    if (chapterAudio) {
      if (isAudioPlaying) {
        chapterAudio.pause()
      } else {
        chapterAudio.play().catch(console.error)
      }
    }
  }

  const handleSlideNavigation = (e: React.MouseEvent) => {
    // Any tap/click should try to resume audio if blocked
    if (chapterAudio && chapterAudio.paused) {
      chapterAudio.play().then(() => removeAudioUnlockListeners()).catch(() => {})
    }

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
    
    // Show controls on interaction
    showControlsTemporarily()
  }

  // Auto-hide controls functionality
  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutId) {
      clearTimeout(controlsTimeoutId)
    }
    const newTimeoutId = setTimeout(() => {
      setShowControls(false)
    }, 3000)
    setControlsTimeoutId(newTimeoutId)
  }

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    showControlsTemporarily()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX) return
    
    const endX = e.changedTouches[0].clientX
    const diff = startX - endX
    const threshold = 50 // minimum distance for swipe
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide() // Swipe left - next slide
      } else {
        prevSlide() // Swipe right - previous slide
      }
    }
    
    setStartX(null)
  }

  // Font size handlers with persistence and smooth animations
  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta))
    setFontSize(newSize)
    localStorage.setItem('readerFontSize', newSize.toString())
  }

  // Volume control handlers with smooth changes
  const handleVolumeToggle = () => {
    const newVolume = audioVolume > 0 ? 0 : 0.5
    setAudioVolume(newVolume)
    if (chapterAudio) {
      chapterAudio.volume = newVolume
    }
    // Persist volume only within current chapter (no localStorage)
  }

  // Auto-hide bottom controls after 5 seconds
  useEffect(() => {
    if (showBottomControls) {
      const timer = setTimeout(() => {
        setShowBottomControls(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showBottomControls])

  // Auto-hide volume control after 3 seconds
  useEffect(() => {
    if (showVolumeControl) {
      const timer = setTimeout(() => {
        setShowVolumeControl(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showVolumeControl])

  return (
    <div 
      className="fixed inset-0 bg-background z-40 w-full h-full select-none"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        pointerEvents: 'auto'
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header with Back Button and Menu */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleNavigateWithCleanup('story-chapters', story)}
          className="h-10 w-10 p-0 rounded-full shadow-lg hover:bg-background/90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {/* Kebab Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-10 w-10 p-0 rounded-full shadow-lg hover:bg-background/90"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setShowBottomControls(!showBottomControls)}>
              <Settings className="h-4 w-4 mr-2" />
              Reading Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLikeToggle}>
              <Heart className={`h-4 w-4 mr-2 ${story?.id && isLiked(story.id) ? 'fill-current' : ''}`} />
              {story?.id && isLiked(story.id) ? 'Unlike' : 'Like Story'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddToLibrary} disabled={story?.id && isInLibrary(story.id)}>
              <Bookmark className="h-4 w-4 mr-2" />
              {story?.id && isInLibrary(story.id) ? 'In Library' : 'Add to Library'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="h-4 w-4 mr-2" />
              Share Story
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowComments(true)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Floating Volume Control - Bottom Right */}
      <div className="absolute bottom-24 right-4 z-50">
        <div className="flex flex-col items-center gap-2">
          {showVolumeControl && (
            <div className="bg-background/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-border/50 animate-in slide-in-from-bottom-2">
              <div className="flex flex-col items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={increaseVolume}
                  className="h-8 w-8 p-0 rounded-full hover:bg-accent"
                >
                  <span className="text-sm font-bold">+</span>
                </Button>
                <div className="text-xs text-center font-medium px-2">
                  {Math.round(audioVolume * 100)}%
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={decreaseVolume}
                  className="h-8 w-8 p-0 rounded-full hover:bg-accent"
                >
                  <span className="text-sm font-bold">−</span>
                </Button>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (showVolumeControl) {
                toggleAudioPlayback()
              } else {
                setShowVolumeControl(!showVolumeControl)
                setTimeout(() => setShowVolumeControl(false), 3000)
              }
            }}
            className="h-12 w-12 p-0 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-background/90"
          >
            {isAudioPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Progress Bar - Left Side */}
      <div className="absolute top-20 left-2 bottom-20 z-50 w-2 hidden md:block">
        <div className="h-full bg-muted/20 rounded-full relative">
          <div 
            className="absolute bottom-0 left-0 w-full bg-primary rounded-full transition-all duration-300 ease-in-out"
            style={{ height: `${progress}%` }}
          />
        </div>
      </div>

      <OnboardingTutorial onComplete={() => setShowTutorial(false)} />

      {/* Mobile Progress Bar - Top */}
      <div className="absolute top-20 left-4 right-4 z-50 md:hidden">
        <div className="h-1 bg-muted/20 rounded-full relative">
          <div 
            className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Controls Bar */}
      {showBottomControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <div className="bg-background/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-border/50 min-w-80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">Reading Controls</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowBottomControls(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Font Controls */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Font Size</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFontSizeChange(-2)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm min-w-[4ch] text-center">{fontSize}px</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFontSizeChange(2)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontFamily(prev => prev === 'serif' ? 'sans-serif' : prev === 'sans-serif' ? 'mono' : 'serif')}
                    className="h-8 px-3"
                  >
                    <Type className="h-3 w-3 mr-1" />
                    {fontFamily === 'serif' ? 'Serif' : fontFamily === 'sans-serif' ? 'Sans' : 'Mono'}
                  </Button>
                </div>
              </div>
              
              {/* Volume Controls */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Audio Volume</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseVolume}
                    className="h-8 w-8 p-0"
                  >
                    <span className="text-sm font-bold">−</span>
                  </Button>
                  <span className="text-sm min-w-[4ch] text-center">{Math.round(audioVolume * 100)}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseVolume}
                    className="h-8 w-8 p-0"
                  >
                    <span className="text-sm font-bold">+</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudioPlayback}
                    className="h-8 px-3"
                  >
                    {isAudioPlaying ? (
                      <>
                        <Volume2 className="h-3 w-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <VolumeX className="h-3 w-3 mr-1" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Menu Overlay */}
      {showMenu && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="max-w-md w-full mx-4 px-2 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{story?.title || "The Digital Awakening"}</h2>
              <p className="text-muted-foreground">by {story?.profiles?.display_name || story?.profiles?.username || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Slide {currentSlide} of {totalSlides} • {progress}% complete
              </p>
              {chapterAudio && (
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Volume2 className="h-3 w-3" />
                  <span>Background music {isAudioPlaying ? 'playing' : 'paused'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleNavigateWithCleanup("library")}
                className="h-16 flex-col gap-2"
              >
                <MessageCircle className="h-6 w-6" />
                Library
              </Button>
              <Button
                variant="outline"
                onClick={() => handleNavigateWithCleanup("settings")}
                className="h-16 flex-col gap-2"
              >
                <Menu className="h-6 w-6" />
                Settings
              </Button>
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={story?.id && isLiked(story.id) ? "default" : "outline"}
                onClick={handleLikeToggle}
              >
                <Heart className={`h-4 w-4 mr-2 ${story?.id && isLiked(story.id) ? 'fill-current' : ''}`} />
                {story?.id && isLiked(story.id) ? 'Liked' : 'Like'}
              </Button>
              <Button 
                size="sm" 
                variant={story?.id && isInLibrary(story.id) ? "default" : "outline"}
                onClick={handleAddToLibrary}
                disabled={story?.id && isInLibrary(story.id)}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                {story?.id && isInLibrary(story.id) ? 'In Library' : 'Add to Library'}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setShowComments(!showComments)
                  setShowMenu(false)
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Comment
              </Button>
              <Button size="sm" variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Background Sound Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Sound</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSoundMenu(!showSoundMenu)}
                >
                  {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
              
              {showSoundMenu && (
                <div className="space-y-3 p-3 border rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    {defaultSounds.map((sound) => (
                      <Button
                        key={sound.id}
                        size="sm"
                        variant={currentSound?.id === sound.id ? "default" : "outline"}
                        onClick={() => playSound(sound)}
                        className="text-xs"
                      >
                        {sound.name}
                      </Button>
                    ))}
                  </div>
                  
                  {currentSound && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={isPlaying ? pauseSound : () => playSound(currentSound)}
                        >
                          {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                        <span className="text-xs text-muted-foreground">Volume: {Math.round(volume * 100)}%</span>
                      </div>
                      <Slider
                        value={[volume]}
                        onValueChange={([newVolume]) => changeVolume(newVolume)}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
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

      {/* Font Controls */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-2 bg-background/80 rounded-lg p-2 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFontFamily(prev => prev === 'serif' ? 'sans-serif' : prev === 'sans-serif' ? 'mono' : 'serif')}
          className="h-8 w-8 p-0"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Reading Area */}
      <div 
        className="h-full w-full flex items-center justify-center cursor-pointer select-none px-4 sm:px-8 lg:px-12 py-24 pb-32 md:pb-24 overflow-y-auto relative"
        onClick={handleSlideNavigation}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Engagement Badge */}
        {currentSlideId && <EngagementBadge slideId={currentSlideId} />}
        
        {/* Floating Reactions */}
        {floatingReactions.map((reaction) => (
          <FloatingEmoji
            key={reaction.id}
            emoji={reaction.emoji}
            id={reaction.id}
            onComplete={removeReaction}
          />
        ))}
        
        <div className="w-full max-w-7xl mx-auto px-1 sm:px-4 lg:px-6">
          <div className="vine-slide-reader border-2 border-primary/20 rounded-lg p-3 sm:p-8 bg-card/50 backdrop-blur-sm min-h-[60vh] md:min-h-[70vh] flex flex-col mt-12 md:mt-0">
            
            {/* Chapter Title */}
            {allSlides[currentSlide - 1]?.chapter_title && (
              <div className="mb-4 text-center">
                <h2 className="text-lg sm:text-xl font-bold text-orange-500 mb-2">
                  {allSlides[currentSlide - 1]?.chapter_title}
                </h2>
                <div className="w-16 h-0.5 bg-orange-500/50 mx-auto"></div>
              </div>
            )}
            
            <div className="vine-slide-content flex-1 flex items-center">
              {isAtChapterEnd ? (
                <div className="w-full max-w-4xl mx-auto text-center space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary">Chapter Complete!</h3>
                    <p className="text-muted-foreground">You've finished this chapter.</p>
                    <div className="w-20 h-1 bg-primary/50 mx-auto rounded-full"></div>
                  </div>
                  
                  {nextChapterId ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Ready for the next chapter?</p>
                      <Button
                        onClick={loadNextChapter}
                        className="vine-button-hero px-8 py-3 text-lg"
                      >
                        <BookOpen className="h-5 w-5 mr-2" />
                        Continue to Next Chapter
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">You've reached the end of available chapters.</p>
                      <Button
                        onClick={() => handleNavigateWithCleanup("story-chapters", story)}
                        variant="outline"
                        className="px-6 py-2"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Back to Chapters
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose max-w-none text-justify w-full">
                  <div 
                    className="leading-relaxed font-medium w-full overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent px-1"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'sans-serif' ? 'Arial, sans-serif' : 'Courier, monospace'
                    }}
                  >
                    {allSlides[currentSlide - 1]?.content || 'Loading slide content...'}
                  </div>
                  
                  {/* Reaction Bar */}
                  <div className="mt-6">
                    <ReactionBar slideId={currentSlideId} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Navigation at Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[90vw] overflow-hidden">
        <div className="flex items-center gap-2 max-w-xs overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20">
          {allChapters.map((chapterItem, index) => {
            const isCurrentChapter = chapterItem.id === currentChapter
            const hasBeenRead = readingProgress.some(r => r.chapter_id === chapterItem.id && (r.progress || 0) > 80)
            return (
              <Button
                key={chapterItem.id}
                size="sm"
                variant={isCurrentChapter ? "default" : hasBeenRead ? "secondary" : "outline"}
                onClick={() => handleChapterNavigation(chapterItem)}
                className="h-8 w-8 p-0 flex-shrink-0 text-xs"
                title={`Chapter ${chapterItem.chapter_number}: ${chapterItem.title}`}
              >
                {chapterItem.chapter_number}
              </Button>
            )
          })}
        </div>
        
        {/* Next Chapter Button */}
        {currentSlide === totalSlides && nextChapter && (
          <div className="border-l pl-4 ml-2">
            <Button
              onClick={() => handleChapterNavigation(nextChapter)}
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              Next Chapter
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </div>

      {/* Remove duplicate back button */}

      {/* Slide Counter */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-background/80 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm md:block hidden">
        {currentSlide} / {totalSlides}
      </div>

      {/* Mobile Slide Counter */}
      <div className="absolute top-16 right-4 z-10 bg-background/80 rounded-full px-2 py-1 text-xs md:hidden">
        {currentSlide} / {totalSlides}
      </div>

      {/* Live Comments Overlay (YouTube-style) */}
      {currentChapter && story?.id && (
        <LiveCommentsOverlay
          slideId={currentChapter}
          storyId={story.id}
        />
      )}

      {/* Slide Comments */}
      {currentChapter && story?.id && (
        <SlideComments
          slideId={currentChapter}
          storyId={story.id}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  )
}