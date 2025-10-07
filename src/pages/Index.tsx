import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Navigation } from "@/components/navigation"
import { HomePage } from "@/components/home-page"
import { WriterPanel } from "@/components/writer-panel"
import { ReaderPanel } from "@/components/reader-panel"
import { AdminPanel } from "@/components/admin-panel"
import { SplashScreen } from "@/components/splash-screen"
import { Footer } from "@/components/footer"
import { useUser } from "@/components/user-context"

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => window.location.pathname === '/' && !localStorage.getItem('splashShown'))
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useUser()
  const prevUserIdRef = useRef<string | null>(null)
  
  // Get current panel from URL
  const getCurrentPanel = (): "home" | "writer" | "reader" | "admin" => {
    const params = new URLSearchParams(location.search)
    const panel = params.get('panel')
    if (panel === 'writer' || panel === 'reader' || panel === 'admin') {
      return panel
    }
    return 'home'
  }
  
  const [currentPanel, setCurrentPanel] = useState<"home" | "writer" | "reader" | "admin">(getCurrentPanel())

  // Update URL when panel changes
  useEffect(() => {
    if (currentPanel === 'home') {
      navigate('/', { replace: true })
    } else {
      navigate(`/?panel=${currentPanel}`, { replace: true })
    }
  }, [currentPanel, navigate])
  
  // Update panel when URL changes
  useEffect(() => {
    const newPanel = getCurrentPanel()
    if (newPanel !== currentPanel) {
      setCurrentPanel(newPanel)
    }
  }, [location.search])

  // Handle splash screen completion
  const handleSplashComplete = () => {
    localStorage.setItem('splashShown', '1')
    setShowSplash(false)
  }

  // Redirect to login on logout
  useEffect(() => {
    const wasLoggedIn = !!prevUserIdRef.current
    const isLoggedIn = !!user?.id
    if (wasLoggedIn && !isLoggedIn && location.pathname !== '/reader/login') {
      navigate('/reader/login', { replace: true })
    }
    prevUserIdRef.current = user?.id ?? null
  }, [user, navigate, location.pathname])

  // Handle panel access with optional login
  useEffect(() => {
    if (loading) return

    // Reader panel is public for everyone (logged in or not)
    if (currentPanel === "reader") return

    // Enforce access only for protected panels
    if (user && currentPanel !== "home") {
      const userRoles = user.roles || []
      const hasAccess = 
        (currentPanel === "writer" && (userRoles.includes("writer") || userRoles.includes("admin"))) ||
        (currentPanel === "admin" && userRoles.includes("admin"))
      
      if (!hasAccess) {
        // Redirect to appropriate panel based on role
        if (userRoles.includes("admin")) {
          setCurrentPanel("admin")
        } else if (userRoles.includes("writer")) {
          setCurrentPanel("writer")  
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
        currentPanel === "reader" ||
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
