import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, BookOpen, Library, Search, Settings } from "lucide-react"

interface MobileNavProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: "discover", label: "Discover", icon: BookOpen },
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
      <SheetContent side="left" className="w-72 sm:w-80 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold">Navigation</h2>
            <ThemeToggle />
          </div>
          <nav className="flex-1 p-3 sm:p-4">
            <div className="space-y-1 sm:space-y-2">
              {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className="w-full justify-start h-10 sm:h-11"
                    onClick={() => handleNavigation(item.id)}
                  >
                    <item.icon className="mr-2 sm:mr-3 h-4 w-4" />
                    <span className="text-sm sm:text-base">{item.label}</span>
                  </Button>
              ))}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}