import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { HomePage } from "@/components/home-page"
import { WriterPanel } from "@/components/writer-panel"
import { ReaderPanel } from "@/components/reader-panel"
import { AdminPanel } from "@/components/admin-panel"
import { SplashScreen } from "@/components/splash-screen"
import { Footer } from "@/components/footer"
import { useUser } from "@/components/user-context"

const Index = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [currentPanel, setCurrentPanel] = useState<"home" | "writer" | "reader" | "admin">("home")
  const { user, loading } = useUser()

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Handle panel access with optional login
  useEffect(() => {
    if (loading) return

    // Only check access for protected panels when user is trying to access them
    if (user && currentPanel !== "home") {
      const userRoles = user.roles || []
      const hasAccess = 
        (currentPanel === "reader" && (userRoles.includes("reader") || userRoles.includes("admin"))) ||
        (currentPanel === "writer" && (userRoles.includes("writer") || userRoles.includes("admin"))) ||
        (currentPanel === "admin" && userRoles.includes("admin"))
      
      if (!hasAccess) {
        // Redirect to appropriate panel based on role
        if (userRoles.includes("admin")) {
          setCurrentPanel("admin")
        } else if (userRoles.includes("writer")) {
          setCurrentPanel("writer")  
        } else if (userRoles.includes("reader")) {
          setCurrentPanel("reader")
        } else {
          setCurrentPanel("home")
        }
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

    // Allow browsing without login, show reader panel for discovery
    if (!user && (currentPanel === "reader" || currentPanel === "writer" || currentPanel === "admin")) {
      // For reader panel, allow browsing without login
      if (currentPanel === "reader") {
        return <ReaderPanel />
      }
      // For writer/admin panels, redirect to home if not logged in
      return <HomePage onPanelChange={setCurrentPanel} />
    }

    if (user && currentPanel !== "home") {
      const userRoles = user.roles || []
      const hasAccess = 
        (currentPanel === "reader" && (userRoles.includes("reader") || userRoles.includes("admin"))) ||
        (currentPanel === "writer" && (userRoles.includes("writer") || userRoles.includes("admin"))) ||
        (currentPanel === "admin" && userRoles.includes("admin"))
      
      if (!hasAccess) {
        // Redirect to appropriate panel based on role
        if (userRoles.includes("admin")) {
          return <AdminPanel />
        } else if (userRoles.includes("writer")) {
          return <WriterPanel />
        } else if (userRoles.includes("reader")) {
          return <ReaderPanel />
        } else {
          return <HomePage onPanelChange={setCurrentPanel} />
        }
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
    <div className="app-layout">
      <Navigation currentPanel={currentPanel} onPanelChange={setCurrentPanel} />
      <main className="app-main">
        {renderPanel()}
      </main>
      <Footer />
    </div>
  )
};

export default Index;
