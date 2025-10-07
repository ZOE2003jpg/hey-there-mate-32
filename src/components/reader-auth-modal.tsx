import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/user-context"
import { BookOpen } from "lucide-react"
import { toast } from "sonner"

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
  const { signInWithGoogle } = useUser()

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        console.error('Google sign-in error:', error)
        toast.error('Failed to sign in with Google')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred')
    }
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
            onClick={handleGoogleSignIn}
            className="vine-button-hero w-full h-12 text-base"
            size="lg"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
