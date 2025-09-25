import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, BarChart3, BookOpen, TrendingUp, DollarSign, Bell, User, Settings as SettingsIcon, Music } from "lucide-react"

interface WriterMobileNavProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function WriterMobileNav({ currentPage, onNavigate }: WriterMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "manage-stories", label: "My Stories", icon: BookOpen },
    { id: "sound-library", label: "Sound Library", icon: Music },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: SettingsIcon }
  ]

  const handleNavigation = (page: string) => {
    onNavigate(page)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 sm:w-80 p-0 bg-background/98">
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-muted/20">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Writer Menu</h2>
            </div>
            <ThemeToggle />
          </div>
          <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div className="space-y-1 sm:space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className="w-full justify-start h-11 sm:h-12 text-sm sm:text-base transition-all duration-200"
                  onClick={() => handleNavigation(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </nav>
          <div className="p-3 sm:p-4 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground text-center">Writer Panel Navigation</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}