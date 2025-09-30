import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BookOpen } from "lucide-react"

interface SignupPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignup: () => void
  feature?: string
}

export function SignupPromptDialog({ 
  open, 
  onOpenChange, 
  onSignup,
  feature = "this feature" 
}: SignupPromptDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="vine-card">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Sign Up to Continue
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Create a free account to {feature} and unlock your personalized reading experience.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="sm:flex-1">Maybe Later</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onSignup}
            className="vine-button-hero sm:flex-1"
          >
            Sign Up Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
