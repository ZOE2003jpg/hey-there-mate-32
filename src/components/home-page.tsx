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
      <section className="relative bg-gradient-to-br from-background to-secondary/20 py-12 sm:py-20">
        <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold">
                  Stories That Come
                  <span className="text-primary"> Alive</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground">
                  Experience reading like never before with VineNovel's slide-based storytelling platform.
                </p>
                
                <div className="flex flex-col xs:flex-row gap-4">
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
                    size="sm"
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
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12">Trending Stories</h2>
            {/* Responsive Story Grid */}
            <div>
              {/* Desktop: Grid layout with image on top */}
              <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {stories.slice(0, 8).map((story) => (
                  <Card key={story.id} className="vine-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="aspect-[3/4] bg-secondary/30 rounded-lg mb-3 flex items-center justify-center group-hover:bg-secondary/50 transition-colors">
                        {story.cover_image_url ? (
                          <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <BookOpen className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <Badge variant="outline" className="mb-2 text-xs w-fit">{story.genre}</Badge>
                      <h3 className="font-semibold text-base mb-2 line-clamp-2 flex-1">{story.title}</h3>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-xs mb-3">
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
                        </div>
                        <Button size="sm" className="w-full h-8 text-xs vine-button-hero">Read Story</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tablet: Two-column layout */}
              <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-4">
                {stories.slice(0, 8).map((story) => (
                  <Card key={story.id} className="vine-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="aspect-[2/3] w-20 bg-secondary/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/50 transition-colors">
                          {story.cover_image_url ? (
                            <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <BookOpen className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <Badge variant="outline" className="mb-2 text-xs w-fit">{story.genre}</Badge>
                          <h3 className="font-semibold text-sm mb-2 line-clamp-2 flex-1">{story.title}</h3>
                          <div className="mt-auto">
                            <div className="flex items-center justify-between text-xs mb-3">
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
                            </div>
                            <Button size="sm" className="w-full h-7 text-xs vine-button-hero">Read</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mobile: Compact horizontal layout */}
              <div className="grid md:hidden grid-cols-1 gap-3">
                {stories.slice(0, 8).map((story) => (
                  <Card key={story.id} className="vine-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Thumbnail left */}
                        <div className="aspect-[2/3] w-16 bg-secondary/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/50 transition-colors">
                          {story.cover_image_url ? (
                            <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        
                        {/* Title + author right */}
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="mb-1 text-xs w-fit">{story.genre}</Badge>
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{story.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{story.view_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{story.like_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action button below */}
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <Button size="sm" className="w-full h-7 text-xs vine-button-hero">Read Story</Button>
                      </div>
                    </CardContent>
                  </Card>
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