import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface ReaderAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: string
}

export function ReaderAuthModal({ 
  open, 
  onOpenChange, 
  feature = "continue" 
}: ReaderAuthModalProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignIn = () => {
    onOpenChange(false)
    navigate(`/reader/login?returnTo=${encodeURIComponent(location.pathname)}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="vine-card sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 p-4 rounded-full">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Join VineNovel
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Sign up to {feature} and unlock your personalized reading experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-4">
          <Button
            onClick={handleSignIn}
            className="vine-button-hero w-full h-12 text-base"
            size="lg"
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Sign In to Continue
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
