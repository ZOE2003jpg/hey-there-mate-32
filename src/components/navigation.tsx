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
    <nav className="vine-card sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-4">
        <button
          onClick={() => onPanelChange("home")}
          className="flex items-center space-x-2 mr-4 sm:mr-6 flex-shrink-0"
        >
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs sm:text-sm">VN</span>
          </div>
          <span className="font-bold vine-text-gradient text-sm sm:text-base hidden xs:inline">
            VineNovel
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentPanel === item.id ? "default" : "ghost"}
                  onClick={() => onPanelChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm lg:text-base">{item.label}</span>
                </Button>
              )
            })}
            
            {/* Mode switching for admin users */}
            {user?.profile?.role === 'admin' && (
              <div className="flex items-center space-x-2 border-l pl-3 ml-2 lg:pl-4 lg:ml-3">
                <span className="text-xs text-muted-foreground hidden lg:inline">Mode:</span>
                <Button
                  size="sm"
                  variant={currentPanel === 'reader' ? "default" : "ghost"}
                  onClick={() => onPanelChange('reader')}
                  className="text-xs lg:text-sm"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span className="hidden lg:inline">Reader</span>
                  <span className="lg:hidden">R</span>
                </Button>
                <Button
                  size="sm"
                  variant={currentPanel === 'writer' ? "default" : "ghost"}
                  onClick={() => onPanelChange('writer')}
                  className="text-xs lg:text-sm"
                >
                  <PenTool className="h-3 w-3 mr-1" />
                  <span className="hidden lg:inline">Writer</span>
                  <span className="lg:hidden">W</span>
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            {user?.profile && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">{user.profile.display_name || user.profile.username || user.email}</span>
                  <span className="text-muted-foreground text-xs lg:text-sm">({user.profile.role})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-xs lg:text-sm">
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden flex-1 items-center justify-end space-x-2">
          {user?.profile && (
            <div className="flex items-center space-x-2 text-xs min-w-0 max-w-[120px] sm:max-w-[160px]">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{user.profile.display_name || user.profile.username || user.email}</span>
            </div>
          )}
          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="h-9 px-3 text-xs flex-shrink-0">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-9 w-9 flex-shrink-0"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t bg-background/95 backdrop-blur-sm animate-in slide-in-from-top-1 duration-200 shadow-lg"
        >
          <div className="container py-4 px-3 sm:px-4 space-y-3">
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
                    className="w-full justify-start h-11 text-sm"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
            </div>
            
            {/* Mode switching for admin users on mobile */}
            {user?.profile?.role === 'admin' && (
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-muted-foreground mb-2 px-3 font-medium">Switch Mode:</p>
                <div className="space-y-2">
                  <Button
                    variant={currentPanel === 'reader' ? "default" : "ghost"}
                    onClick={() => {
                      onPanelChange('reader')
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-11 text-sm"
                  >
                    <BookOpen className="h-4 w-4 mr-3" />
                    <span>Reader Mode</span>
                  </Button>
                  <Button
                    variant={currentPanel === 'writer' ? "default" : "ghost"}
                    onClick={() => {
                      onPanelChange('writer')
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-11 text-sm"
                  >
                    <PenTool className="h-4 w-4 mr-3" />
                    <span>Writer Mode</span>
                  </Button>
                </div>
              </div>
            )}

            {/* User info section for mobile */}
            {user?.profile && (
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 min-w-0">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.profile.display_name || user.profile.username || user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.profile.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={signOut} className="flex-shrink-0">
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}