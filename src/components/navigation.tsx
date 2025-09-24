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
        <div className="flex md:hidden flex-1 items-center justify-end space-x-2">
          {user?.profile && (
            <div className="flex items-center space-x-1 text-xs mr-2">
              <User className="h-3 w-3" />
              <span className="truncate max-w-20">{user.profile.display_name || user.profile.username || user.email}</span>
            </div>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
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
            {user && (
              <Button
                variant="ghost"
                onClick={() => {
                  signOut()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full justify-start flex items-center space-x-2 text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}