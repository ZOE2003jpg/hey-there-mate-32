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
      <div className="container flex h-16 items-center">
        <button
          onClick={() => onPanelChange("home")}
          className="flex items-center space-x-2 mr-6"
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">VN</span>
          </div>
          <span className="font-bold vine-text-gradient">
            VineNovel
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-6">
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
                  <span>{item.label}</span>
                </Button>
              )
            })}
            
            {/* Mode switching for admin users */}
            {user?.profile?.role === 'admin' && (
              <div className="flex items-center space-x-2 border-l pl-4 ml-2">
                <span className="text-xs text-muted-foreground">Mode:</span>
                <Button
                  size="sm"
                  variant={currentPanel === 'reader' ? "default" : "ghost"}
                  onClick={() => onPanelChange('reader')}
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Reader
                </Button>
                <Button
                  size="sm"
                  variant={currentPanel === 'writer' ? "default" : "ghost"}
                  onClick={() => onPanelChange('writer')}
                >
                  <PenTool className="h-3 w-3 mr-1" />
                  Writer
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {user?.profile && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{user.profile.display_name || user.profile.username || user.email}</span>
                  <span className="text-muted-foreground">({user.profile.role})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden flex-1 items-center justify-end space-x-1">
          {user?.profile && (
            <div className="flex items-center space-x-1 text-xs mr-1 min-w-0 max-w-[140px] sm:max-w-none">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate text-xs">{user.profile.display_name || user.profile.username || user.email}</span>
              <span className="text-muted-foreground text-xs hidden sm:inline">({user.profile.role})</span>
            </div>
          )}
          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="h-8 px-2 text-xs flex-shrink-0">
              <LogOut className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-8 w-8 flex-shrink-0"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-2">
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
                  className="w-full justify-start flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
            
            {/* Mode switching for users with multiple roles */}
            {user?.profile?.role === 'admin' && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-muted-foreground mb-2 px-3">Switch Mode:</p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onPanelChange('reader')
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full justify-start flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Reader Mode</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onPanelChange('writer')
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full justify-start flex items-center space-x-2"
                >
                  <PenTool className="h-4 w-4" />
                  <span>Writer Mode</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}