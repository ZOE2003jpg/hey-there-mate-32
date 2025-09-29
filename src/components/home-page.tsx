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
    // Always allow access to reader panel for browsing
    onPanelChange('reader')
  }

  const handleStartWriting = () => {
    if (user) {
      const userRole = user.profile?.role
      if (userRole === "writer" || userRole === "admin") {
        onPanelChange('writer')
      } else {
        onPanelChange('reader')
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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container-system">
          <div className="content-container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="typography-display">
                    Stories That Come
                    <span className="text-primary block"> Alive</span>
                  </h1>
                  <p className="typography-body-lg text-muted-foreground max-w-xl">
                    Experience reading like never before with VineNovel's immersive slide-based storytelling platform. Where every story comes to life.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="btn-primary" onClick={handleGetStarted}>
                    <Play className="h-5 w-5 mr-2" />
                    Start Reading
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={handleStartWriting} 
                    className="btn-secondary"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Start Writing
                  </Button>
                </div>

                {/* Test Users Section */}
                <div className="pt-6 border-t border-border">
                  <p className="typography-caption mb-3">Need test accounts? Create them first:</p>
                  <Button 
                    variant="secondary" 
                    onClick={createTestUsers}
                    disabled={creatingTestUsers}
                    size="sm"
                    className="btn-ghost"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {creatingTestUsers ? "Creating..." : "Create Test Users"}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="relative">
                  <img 
                    src={heroImage} 
                    alt="VineNovel Platform" 
                    className="w-full rounded-2xl shadow-2xl border border-border/20" 
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section */}
      {stories.length > 0 && (
        <section className="bg-muted/30">
          <div className="container-system">
            <div className="content-container">
              <div className="text-center mb-12">
                <h2 className="typography-h2 mb-4">Trending Stories</h2>
                <p className="typography-body text-muted-foreground max-w-2xl mx-auto">
                  Discover the most popular stories on VineNovel, loved by readers worldwide
                </p>
              </div>
              
              {/* Story Grid */}
              <div className="story-grid">
                {stories.slice(0, 12).map((story) => (
                  <article key={story.id} className="story-card">
                    {/* Cover Image */}
                    <div className="story-cover">
                      {story.cover_image_url ? (
                        <img 
                          src={story.cover_image_url} 
                          alt={story.title} 
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Story Content */}
                    <div className="story-content">
                      <div className="space-y-2">
                        <span className="story-genre">{story.genre}</span>
                        <h3 className="story-title">{story.title}</h3>
                      </div>
                      
                      {/* Story Stats */}
                      <div className="story-stats">
                        <div className="flex items-center space-x-4">
                          <div className="story-stat">
                            <Eye className="h-3 w-3" />
                            <span>{story.view_count}</span>
                          </div>
                          <div className="story-stat">
                            <Heart className="h-3 w-3" />
                            <span>{story.like_count}</span>
                          </div>
                        </div>
                        <div className="story-stat">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-primary font-medium">Popular</span>
                        </div>
                      </div>
                      
                      {/* Story Actions */}
                      <div className="story-actions">
                        <Button 
                          className="story-read-btn"
                          onClick={() => onPanelChange('reader')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Read Story
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="story-like-btn"
                          onClick={() => user ? null : setShowLogin(true)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="story-bookmark-btn"
                          onClick={() => user ? null : setShowLogin(true)}
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </div>
  )
}