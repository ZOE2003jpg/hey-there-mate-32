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
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl vine-card shadow-2xl animate-in zoom-in-95 duration-300">
          <CardContent className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold">Welcome to VineNovel! 📖</h2>
              <p className="text-muted-foreground">
                Let's quickly show you how to enjoy your reading experience
              </p>
            </div>

            {/* Instructions Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Audio Controls */}
              <Card className="bg-muted/30 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Audio Controls</h3>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-4 w-4" />
                      <span>Mute / Unmute sound</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span>Adjust volume level</span>
                    </div>
                    <p className="text-xs mt-2">Find these controls at the top of the reader</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Navigation */}
              <Card className="bg-muted/30 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Navigation</h3>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded">📱</span>
                      <span>Scroll up to finish slide</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span>Tap right → next slide</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      <span>Tap left → previous slide</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chapter Navigation */}
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">Chapter Navigation</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the navigation bar below to switch between chapters easily
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-center">
                <span className="font-semibold">💡 Pro Tip:</span> Your reading progress is automatically saved!
              </p>
            </div>

            {/* Got it Button */}
            <Button 
              onClick={handleDismiss}
              className="w-full vine-button-hero h-12 text-lg"
            >
              Got it! Let's Start Reading
            </Button>

            {/* Skip option */}
            <button
              onClick={handleDismiss}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tutorial
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
