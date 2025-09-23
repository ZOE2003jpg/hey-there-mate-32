import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { HomePage } from "@/components/home-page"
import { WriterPanel } from "@/components/writer-panel"
import { ReaderPanel } from "@/components/reader-panel"
import { AdminPanel } from "@/components/admin-panel"
import { SplashScreen } from "@/components/splash-screen"
import { useUser } from "@/components/user-context"

const Index = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [currentPanel, setCurrentPanel] = useState<"home" | "writer" | "reader" | "admin">("home")
  const { user, loading } = useUser()

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Redirect to home if user doesn't have access to current panel
  useEffect(() => {
    if (loading) return

    if (!user && currentPanel !== "home") {
      setCurrentPanel("home")
      return
    }

    if (user?.profile && currentPanel !== "home") {
      const userRole = user.profile.role
      const hasAccess = 
        (currentPanel === "reader" && (userRole === "reader" || userRole === "admin")) ||
        (currentPanel === "writer" && (userRole === "writer" || userRole === "admin")) ||
        (currentPanel === "admin" && userRole === "admin")
      
      if (!hasAccess) {
        setCurrentPanel("home")
      }
    }
  }, [user, currentPanel, loading])

  const renderPanel = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    // Additional security check
    if (!user && currentPanel !== "home") {
      return <HomePage onPanelChange={setCurrentPanel} />
    }

    if (user?.profile && currentPanel !== "home") {
      const userRole = user.profile.role
      const hasAccess = 
        (currentPanel === "reader" && (userRole === "reader" || userRole === "admin")) ||
        (currentPanel === "writer" && (userRole === "writer" || userRole === "admin")) ||
        (currentPanel === "admin" && userRole === "admin")
      
      if (!hasAccess) {
        return <HomePage onPanelChange={setCurrentPanel} />
      }
    }

    switch (currentPanel) {
      case "writer":
        return <WriterPanel />
      case "reader":
        return <ReaderPanel />
      case "admin":
        return <AdminPanel />
      default:
        return <HomePage onPanelChange={setCurrentPanel} />
    }
  }

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPanel={currentPanel} onPanelChange={setCurrentPanel} />
      {renderPanel()}
    </div>
  )
};

export default Index;
