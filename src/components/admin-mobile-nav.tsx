import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Menu, 
  BarChart3, 
  BookOpen, 
  Users, 
  Play, 
  Flag, 
  MessageSquare,
  Tag,
  Settings as SettingsIcon,
  UserCheck,
  FileText,
  Database
} from "lucide-react"

interface AdminMobileNavProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function AdminMobileNav({ currentPage, onNavigate }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "novels", label: "Novels", icon: BookOpen },
    { id: "chapters", label: "Chapters", icon: FileText },
    { id: "writers", label: "Writers", icon: Users },
    { id: "readers", label: "Readers", icon: Users },
    { id: "ads", label: "Ads", icon: Play },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "comments", label: "Comments", icon: MessageSquare },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "settings", label: "Settings", icon: SettingsIcon },
    { id: "admin-config", label: "Admin Config", icon: UserCheck },
    { id: "test-data", label: "Test Data Setup", icon: Database }
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
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <ThemeToggle />
          </div>
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleNavigation(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}