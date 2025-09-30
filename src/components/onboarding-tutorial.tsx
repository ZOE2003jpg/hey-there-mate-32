import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Volume2, VolumeX, ChevronRight, ChevronLeft, Navigation, X } from 'lucide-react'
import { getTutorialSeen, setTutorialSeen } from '@/lib/localStorage'

interface OnboardingTutorialProps {
  onComplete?: () => void
}

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if tutorial has been seen
    const hasSeenTutorial = getTutorialSeen()
    if (!hasSeenTutorial) {
      // Show tutorial after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setTutorialSeen(true)
    setIsVisible(false)
    onComplete?.()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-center min-h-screen p-3 md:p-4">
        <Card className="w-full max-w-md md:max-w-2xl vine-card shadow-2xl animate-in zoom-in-95 duration-300">
          <CardContent className="p-4 md:p-8 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="text-center space-y-1 md:space-y-2">
              <h2 className="text-xl md:text-3xl font-bold">Welcome to VineNovel! 📖</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Let's quickly show you how to enjoy your reading experience
              </p>
            </div>

            {/* Instructions Grid */}
            <div className="grid gap-3 md:gap-4 md:grid-cols-2">
              {/* Audio Controls */}
              <Card className="bg-muted/30 border-primary/20">
                <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <h3 className="text-sm md:text-base font-semibold">Audio Controls</h3>
                  </div>
                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Mute / Unmute sound</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Adjust volume level</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Navigation */}
              <Card className="bg-muted/30 border-primary/20">
                <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <h3 className="text-sm md:text-base font-semibold">Navigation</h3>
                  </div>
                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Tap right → next slide</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Tap left → previous slide</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm text-center">
                <span className="font-semibold">💡 Pro Tip:</span> Your reading progress is automatically saved!
              </p>
            </div>

            {/* Got it Button */}
            <Button 
              onClick={handleDismiss}
              className="w-full vine-button-hero h-10 md:h-12 text-base md:text-lg"
            >
              Got it! Let's Start Reading
            </Button>

            {/* Skip option */}
            <button
              onClick={handleDismiss}
              className="w-full text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tutorial
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
