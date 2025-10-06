import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useUser, UserRole } from "@/components/user-context"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, LogIn, UserPlus, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { z } from "zod"

const authSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email is too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password is too long")
})

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("reader")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const { signIn, signUp } = useUser()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate input with Zod
      const validated = authSchema.parse({ email, password })
      
      let result
      if (mode === "signin") {
        result = await signIn(validated.email, validated.password)
      } else {
        result = await signUp(validated.email, validated.password, role)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        onOpenChange(false)
        setEmail("")
        setPassword("")
        if (mode === "signup") {
          toast.success("Account created! You can now sign in.")
        } else {
          toast.success("Welcome back!")
        }
      }
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        // Zod validation error
        setError(err.errors[0]?.message || "Validation error")
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {mode === "signin" ? <LogIn className="h-4 w-4 sm:h-5 sm:w-5" /> : <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />}
            {mode === "signin" ? "Welcome Back" : "Join VineNovel"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {mode === "signin" 
              ? "Sign in to access your personalized storytelling experience" 
              : "Create your account to start your storytelling journey"
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as "signin" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4 sm:mt-6">
            <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm sm:text-base">Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    <span className="text-sm sm:text-base">Sign In</span>
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4 sm:mt-6">
            <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
              {error && (
                <Alert variant={error.includes("Check your email") ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 characters)"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role">I want to join as</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reader">Reader - Discover amazing stories</SelectItem>
                    <SelectItem value="writer">Writer - Create and publish stories</SelectItem>
                    <SelectItem value="admin">Admin - Manage the platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm sm:text-base">Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span className="text-sm sm:text-base">Create Account</span>
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}