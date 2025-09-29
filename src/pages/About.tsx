import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { BackButton } from "@/components/back-button"
import { BookOpen, Users, Target, Heart } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container-system flex-1">
        <div className="content-container py-16">
          <BackButton />
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="typography-display mb-6">About VineNovel</h1>
            <p className="typography-body-lg text-muted-foreground max-w-3xl mx-auto">
              Where stories come alive through immersive, visual storytelling that transforms how we experience literature.
            </p>
          </div>

          {/* Brand Story */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="typography-h2 text-primary">Our Story</h2>
              <div className="space-y-4">
                <p className="typography-body text-muted-foreground">
                  VineNovel was born from a simple belief: stories should be more than just words on a page. 
                  In a world where visual media dominates, we reimagined how literature could evolve.
                </p>
                <p className="typography-body text-muted-foreground">
                  Our platform combines the depth of traditional storytelling with the engagement of modern, 
                  slide-based presentations. Every story becomes an immersive journey where readers don't just 
                  read—they experience.
                </p>
                <p className="typography-body text-muted-foreground">
                  From passionate writers crafting their next masterpiece to avid readers discovering new worlds, 
                  VineNovel is the bridge between imagination and innovation.
                </p>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <BookOpen className="h-16 w-16 text-primary mx-auto" />
                    <h3 className="typography-h3">Visual Storytelling</h3>
                    <p className="typography-body text-muted-foreground">
                      Transforming literature into immersive, slide-based experiences that captivate and engage.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardContent className="p-8">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="typography-h3 mb-4">Our Mission</h3>
                <p className="typography-body text-muted-foreground">
                  To revolutionize storytelling by creating an immersive platform where literature meets 
                  visual innovation, making stories more engaging and accessible.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="typography-h3 mb-4">Community First</h3>
                <p className="typography-body text-muted-foreground">
                  We believe in empowering both writers and readers, creating a thriving community where 
                  creativity flourishes and stories find their perfect audience.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="typography-h3 mb-4">Quality & Innovation</h3>
                <p className="typography-body text-muted-foreground">
                  Every feature we build focuses on enhancing the storytelling experience while maintaining 
                  the highest standards of quality and user experience.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-12">
                <h2 className="typography-h2 mb-4">Join Our Story</h2>
                <p className="typography-body-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Whether you're a writer ready to share your vision or a reader seeking your next great adventure, 
                  VineNovel is where your story begins.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Start Reading
                  </a>
                  <a 
                    href="/" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Start Reading
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}