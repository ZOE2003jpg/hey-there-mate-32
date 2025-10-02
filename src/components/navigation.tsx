import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { PenTool, BookOpen, Shield, Menu, X, LogOut, User, Compass, TrendingUp, Star, Library, Info } from "lucide-react"
import { useUser } from "@/components/user-context"
import { Link } from "react-router-dom"

interface NavigationProps {
  currentPanel: "home" | "writer" | "reader" | "admin"
  onPanelChange: (panel: "home" | "writer" | "reader" | "admin") => void
}

export function Navigation({ currentPanel, onPanelChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useUser()

  // Public navigation items (always visible)
  const publicNavItems = [
    { id: "home", label: "Home", icon: Compass, path: "/" },
    { id: "discover", label: "Discover", icon: Compass, action: () => onPanelChange("reader") },
    { id: "featured", label: "Featured", icon: Star, action: () => onPanelChange("reader") },
    { id: "trending", label: "Trending", icon: TrendingUp, action: () => onPanelChange("reader") },
    { id: "library", label: "Library", icon: Library, action: () => onPanelChange("reader") },
  ]

  // User panel items (only visible when logged in)
  const userRoles = user?.roles || []
  const userPanelItems = user ? [
    { id: "reader" as const, label: "Reader Panel", icon: BookOpen, roles: ["reader" as const, "admin" as const] },
    { id: "writer" as const, label: "Writer Panel", icon: PenTool, roles: ["writer" as const, "admin" as const] },
    { id: "admin" as const, label: "Admin Panel", icon: Shield, roles: ["admin" as const] },
  ].filter(item => item.roles.some((role) => userRoles.includes(role))) : []

  return (
    <header className="app-header">
      <div className="container-system">
        <div className="header-content">
          {/* Left: Logo */}
          <div className="header-section header-logo">
            <button
              onClick={() => onPanelChange("home")}
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              <span className="text-primary-foreground font-bold text-base">VN</span>
            </button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-primary">VineNovel</h1>
              <p className="text-xs text-muted-foreground">Visual Storytelling</p>
            </div>
          </div>

          {/* Center: Navigation (Desktop) */}
          <div className="header-nav">
            {/* Public Navigation */}
            {publicNavItems.map((item) => {
              const Icon = item.icon
              if (item.path) {
                return (
                  <Link key={item.id} to={item.path}>
                <Button
              variant="ghost"
              className="h-12 px-4 flex items-center space-x-2 font-medium hover:bg-primary/10"
            >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
                  </Link>
                )
              }
              return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={item.action}
                className="h-12 px-4 flex items-center space-x-2 font-medium hover:bg-primary/10"
              >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
            
            {/* About Link */}
            <Link to="/about">
              <Button variant="ghost" className="h-12 px-4 flex items-center space-x-2 font-medium hover:bg-primary/10">
                <Info className="h-4 w-4" />
                <span>About</span>
              </Button>
            </Link>

            {/* User Panel Items (when logged in) */}
            {userPanelItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentPanel === item.id ? "default" : "ghost"}
                  onClick={() => onPanelChange(item.id)}
                  className="h-12 px-4 flex items-center space-x-2 font-medium"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Right: User Controls */}
          <div className="header-section header-controls">
            {/* Desktop User Info */}
            <div className="hidden md:flex items-center space-x-3">
              {user?.profile && (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <span className="font-medium">
                        {user.profile.display_name || user.profile.username || "User"}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({userRoles.join(", ")})
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut} className="h-10">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
              {!user?.profile && (
                <>
                  <Link to="/writer/login">
                    <Button variant="outline" size="sm" className="h-10">
                      Writer Login
                    </Button>
                  </Link>
                </>
              )}
              <ThemeToggle />
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center space-x-2">
              {user?.profile && (
                <div className="flex items-center space-x-2 px-2 py-1 bg-muted/30 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {user.profile.display_name || user.profile.username || "User"}
                  </span>
                </div>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay - Full Screen */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="mobile-nav-overlay"
        >
          {/* Close button fixed at top */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
            <div className="container-system flex items-center justify-between h-16 px-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="container-system py-6 space-y-4 mobile-nav-content">
            <div className="space-y-2">
              {/* Public Navigation */}
              {publicNavItems.map((item) => {
                const Icon = item.icon
                if (item.path) {
                  return (
                  <Link key={item.id} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 text-sm font-medium mobile-nav-item hover:bg-accent"
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  )
                }
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => {
                      item.action?.()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-12 text-sm font-medium mobile-nav-item hover:bg-accent"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
              
              {/* About Link */}
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium mobile-nav-item hover:bg-accent">
                  <Info className="h-4 w-4 mr-3" />
                  <span>About</span>
                </Button>
              </Link>

              {/* Login Links (when logged out) */}
              {!user?.profile && (
                <div className="space-y-2">
                  <Link to="/writer/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium mobile-nav-item hover:bg-accent">
                      <PenTool className="h-4 w-4 mr-3" />
                      <span>Writer Login</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* User Panel Items (when logged in) */}
              {userPanelItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentPanel === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onPanelChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-12 text-sm font-medium mobile-nav-item"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}

              {/* Legal Links */}
              <div className="border-t border-border pt-4 space-y-2">
                <p className="text-xs text-muted-foreground px-3 mb-2">Legal</p>
                <Link to="/privacy" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start h-10 text-sm mobile-nav-item hover:bg-accent">
                    Privacy Policy
                  </Button>
                </Link>
                <Link to="/terms" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start h-10 text-sm mobile-nav-item hover:bg-accent">
                    Terms & Conditions
                  </Button>
                </Link>
              </div>
            </div>

            {/* User Actions for Mobile */}
            {user?.profile && (
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {user.profile.display_name || user.profile.username || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {userRoles.join(", ")}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="h-10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}