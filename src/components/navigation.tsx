import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { PenTool, BookOpen, Shield, Menu, X, LogOut, User } from "lucide-react"
import { useUser } from "@/components/user-context"

interface NavigationProps {
  currentPanel: "home" | "writer" | "reader" | "admin"
  onPanelChange: (panel: "home" | "writer" | "reader" | "admin") => void
}

export function Navigation({ currentPanel, onPanelChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useUser()

  // Filter nav items based on user role
  const allNavItems = [
    { id: "reader" as const, label: "Reader Panel", icon: BookOpen, roles: ["reader", "admin"] },
    { id: "writer" as const, label: "Writer Panel", icon: PenTool, roles: ["writer", "admin"] },
    { id: "admin" as const, label: "Admin Panel", icon: Shield, roles: ["admin"] },
  ]

  const navItems = user?.profile 
    ? allNavItems.filter(item => item.roles.includes(user.profile!.role))
    : []

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
            {navItems.map((item) => {
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
                        ({user.profile.role})
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut} className="h-10">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t bg-background/98 backdrop-blur-xl animate-in slide-in-from-top-1 duration-200 shadow-xl"
        >
          <div className="container-system py-6 space-y-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentPanel === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onPanelChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-12 text-sm font-medium"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>

            {/* User Actions for Mobile */}
            {user?.profile && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {user.profile.display_name || user.profile.username || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.profile.role}
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