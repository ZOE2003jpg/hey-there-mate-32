import { useState } from "react"
import { Dashboard } from "./writer/dashboard"
import { CreateStory } from "./writer/create-story"
import { AddChapter } from "./writer/add-chapter" 
import { StoryView } from "./writer/story-view"
import { ManageStories } from "./writer/manage-stories"
import { ManageChapters } from "./writer/manage-chapters"
import { Analytics } from "./writer/analytics"
import { Earnings } from "./writer/earnings"
import { Notifications } from "./writer/notifications"
import { Profile } from "./writer/profile"
import { SoundLibrary } from "./writer/sound-library"
import { PreviewReader } from "./reader/preview-reader"
import { WriterMobileNav } from "./writer-mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  BarChart3, 
  PlusSquare, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  Bell,
  User,
  Settings as SettingsIcon,
  Music
} from "lucide-react"

export function WriterPanel() {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [selectedData, setSelectedData] = useState(null)
  const isMobile = useIsMobile()

  const handleNavigate = (page: string, data?: any) => {
    if (data) {
      setSelectedData(data)
    }
    setCurrentPage(page)
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "manage-stories", label: "My Stories", icon: BookOpen },
    { id: "sound-library", label: "Sound Library", icon: Music },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: SettingsIcon }
  ]

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <Dashboard onNavigate={handleNavigate} />
      case "create-story": return <CreateStory onNavigate={handleNavigate} />
      case "add-chapter": return <AddChapter onNavigate={handleNavigate} editData={selectedData?.editData} />
      case "story-view": return <StoryView story={selectedData?.story} onNavigate={handleNavigate} />
      case "manage-stories": return <ManageStories onNavigate={handleNavigate} />
      case "manage-chapters": return <ManageChapters story={selectedData} onNavigate={handleNavigate} />
      case "sound-library": return <SoundLibrary onNavigate={handleNavigate} />
      case "analytics": return <Analytics onNavigate={handleNavigate} />
      case "earnings": return <Earnings onNavigate={handleNavigate} />
      case "notifications": return <Notifications onNavigate={handleNavigate} />
      case "profile": return <Profile onNavigate={handleNavigate} />
      case "preview-reader": return <PreviewReader chapter={selectedData?.chapter} onNavigate={handleNavigate} />
      default: return <Dashboard onNavigate={handleNavigate} />
    }
  }

  // If we're in preview mode, show full screen preview
  if (currentPage === "preview-reader") {
    return <PreviewReader chapter={selectedData?.chapter} onNavigate={handleNavigate} />
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar Navigation */}
      {!isMobile && (
        <div className="w-64 bg-card border-r border-border p-6">
          <div className="flex items-center gap-3 mb-8">
            <PlusSquare className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">Writer Panel</h1>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleNavigate(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Mobile Header with Navigation */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 h-16">
          <div className="flex items-center justify-between p-4 h-full">
            <div className="flex items-center gap-3">
              <WriterMobileNav currentPage={currentPage} onNavigate={handleNavigate} />
              <PlusSquare className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">Writer Panel</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        <div className="p-4 lg:p-8">
          {renderPage()}
        </div>
      </div>
    </div>
  )
}