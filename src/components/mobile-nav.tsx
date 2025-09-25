import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, BookOpen, Library, Search, Settings, Compass } from "lucide-react"

interface MobileNavProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "library", label: "My Library", icon: Library },
    { id: "search", label: "Search", icon: Search },
    { id: "settings", label: "Settings", icon: Settings },
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
      <SheetContent side="left" className="w-72 sm:w-80 p-0 bg-background/95 backdrop-blur-sm border-r shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-card/50">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Reader Menu</h2>
            </div>
            <ThemeToggle />
          </div>
          <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div className="space-y-1 sm:space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className="w-full justify-start h-11 sm:h-12 text-sm sm:text-base transition-all duration-200 hover:bg-accent"
                  onClick={() => handleNavigation(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </nav>
          <div className="p-3 sm:p-4 border-t bg-card/30">
            <p className="text-xs text-muted-foreground text-center">Reader Panel Navigation</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}