import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoginModal } from "@/components/login-modal"
import { useUser } from "@/components/user-context"
import { useStories } from "@/hooks/useStories"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  BookOpen, 
  Star, 
  Eye,
  Heart,
  Play,
  TrendingUp,
  Database
} from "lucide-react"
import heroImage from "@/assets/hero-books.jpg"

interface HomePageProps {
  onPanelChange: (panel: "home" | "reader" | "writer" | "admin") => void
}

export function HomePage({ onPanelChange }: HomePageProps) {
  const { user } = useUser()
  const { stories } = useStories()
  const [showLogin, setShowLogin] = useState(false)
  const [creatingTestUsers, setCreatingTestUsers] = useState(false)
  const { toast } = useToast()

  const handleGetStarted = () => {
    if (user) {
      // Redirect to appropriate panel based on user role
      const userRole = user.profile?.role
      if (userRole === "reader") {
        onPanelChange('reader')
      } else if (userRole === "writer") {
        onPanelChange('writer')
      } else if (userRole === "admin") {
        onPanelChange('admin')
      } else {
        onPanelChange('reader') // default to reader
      }
    } else {
      setShowLogin(true)
    }
  }

  const createTestUsers = async () => {
    setCreatingTestUsers(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-test-users')
      
      if (error) {
        console.error('Error creating test users:', error)
        toast({
          title: "Error",
          description: "Failed to create test users. Check console for details.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success!",
          description: "Test users created! You can now login with: testwriter@example.com, testreader@example.com, or testadmin@example.com (password: password123)"
        })
      }
    } catch (err) {
      console.error('Error:', err)
      toast({
        title: "Error", 
        description: "Failed to create test users.",
        variant: "destructive"
      })
    } finally {
      setCreatingTestUsers(false)
    }
  }

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-background to-secondary/20 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl lg:text-6xl font-bold">
                Stories That Come
                <span className="text-primary"> Alive</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Experience reading like never before with VineNovel's slide-based storytelling platform.
              </p>
              
              <div className="flex gap-4">
                <Button size="lg" className="vine-button-hero" onClick={handleGetStarted}>
                  <Play className="h-5 w-5 mr-2" />
                  Start Reading
                </Button>
                <Button size="lg" variant="outline" onClick={() => user ? onPanelChange('writer') : setShowLogin(true)}>
                  <BookOpen className="h-5 w-5 mr-2" />
                  Start Writing
                </Button>
              </div>

              {/* Temporary Test Users Button */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Need test accounts? Create them first:</p>
                <Button 
                  variant="secondary" 
                  onClick={createTestUsers}
                  disabled={creatingTestUsers}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {creatingTestUsers ? "Creating..." : "Create Test Users"}
                </Button>
              </div>
            </div>

            <div className="relative">
              <img src={heroImage} alt="VineNovel" className="w-full rounded-xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {stories.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12">Trending Stories</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {stories.slice(0, 8).map((story) => (
                <Card key={story.id} className="vine-card hover-scale cursor-pointer">
                  <CardContent className="p-3 sm:p-4">
                    <div className="aspect-[3/4] bg-secondary/30 rounded-lg mb-3 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <Badge variant="outline" className="mb-2 text-xs">{story.genre}</Badge>
                    <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2">{story.title}</h3>
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span className="hidden xs:inline">{story.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span className="hidden xs:inline">{story.like_count}</span>
                        </div>
                      </div>
                      <Button size="sm" className="h-6 px-2 text-xs vine-button-hero">Read</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </div>
  )
}