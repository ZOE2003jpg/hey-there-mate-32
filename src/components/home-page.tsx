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
    <div className="main-layout">
      <section className="section-spacing bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="container-spacing">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto">
              <div className="content-spacing">
                <h1 className="heading-xl leading-tight">
                  Stories That Come
                  <span className="text-primary block sm:inline"> Alive</span>
                </h1>
                <p className="body-lg text-muted-foreground max-w-xl">
                  Experience reading like never before with VineNovel's immersive slide-based storytelling platform. Where every story comes to life.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="btn-hero" onClick={handleGetStarted}>
                    <Play className="h-5 w-5 mr-2" />
                    Start Reading
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => user ? onPanelChange('writer') : setShowLogin(true)} className="border-2">
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
                    size="sm"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {creatingTestUsers ? "Creating..." : "Create Test Users"}
                  </Button>
                </div>
              </div>

            <div className="relative lg:pl-8">
              <div className="relative">
                <img src={heroImage} alt="VineNovel Platform" className="w-full rounded-2xl shadow-2xl border border-border/20" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {stories.length > 0 && (
        <section className="section-spacing bg-secondary/5">
          <div className="container-spacing">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="heading-lg mb-4">Trending Stories</h2>
              <p className="body-md text-muted-foreground max-w-2xl mx-auto">
                Discover the most popular stories on VineNovel, loved by readers worldwide
              </p>
            </div>
            {/* Professional Responsive Story Grid */}
            <div className="responsive-grid">
              {stories.slice(0, 12).map((story) => (
                <Card key={story.id} className="vine-card-standard hover-scale cursor-pointer group">
                  <CardContent className="p-0 h-full">
                    {/* Cover Image */}
                    <div className="aspect-[4/5] bg-secondary/20 rounded-t-lg mb-4 overflow-hidden group-hover:bg-secondary/30 transition-colors">
                      {story.cover_image_url ? (
                        <img 
                          src={story.cover_image_url} 
                          alt={story.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="px-4 pb-4 space-y-3">
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs font-medium">{story.genre}</Badge>
                        <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] leading-tight">
                          {story.title}
                        </h3>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{story.view_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{story.like_count}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-primary">Popular</span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <Button size="sm" className="w-full btn-hero text-sm">
                        <Play className="h-4 w-4 mr-2" />
                        Read Story
                      </Button>
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