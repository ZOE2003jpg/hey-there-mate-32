import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface LayoutProps {
  children: React.ReactNode
  currentPanel: "home" | "writer" | "reader" | "admin"
  onPanelChange: (panel: "home" | "writer" | "reader" | "admin") => void
  showBackButton?: boolean
}

export function Layout({ children, currentPanel, onPanelChange, showBackButton = false }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleBack = () => {
    if (location.pathname === "/" || location.pathname === "/home") {
      return
    }
    navigate(-1)
  }

  return (
    <div className="app-layout">
      <Navigation currentPanel={currentPanel} onPanelChange={onPanelChange} />
      
      <main className="app-main">
        <div className="main-content">
          {showBackButton && location.pathname !== "/" && (
            <div className="container-system py-4">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                className="mb-4 h-10 px-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}