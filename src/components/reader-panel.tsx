import { useState } from "react"
import { DiscoverPage } from "@/components/reader/discover-page"
import { SlideReader } from "@/components/reader/slide-reader"
import { LibraryPage } from "@/components/reader/library-page"
import { SearchPage } from "@/components/reader/search-page"
import { SettingsPage } from "@/components/reader/settings-page"
import { StoryChapters } from "@/components/reader/story-chapters"
import { PreviewReader } from "@/components/reader/preview-reader"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  Compass, 
  BookOpen, 
  Library, 
  Search, 
  Settings as SettingsIcon 
} from "lucide-react"

export function ReaderPanel() {
  const [currentPage, setCurrentPage] = useState("discover")
  const [currentStory, setCurrentStory] = useState(null)
  const isMobile = useIsMobile()

  const handleNavigate = (page: string, data?: any) => {
    if (data) {
      setCurrentStory(data)
    }
    setCurrentPage(page)
  }

  const navigationItems = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "library", label: "My Library", icon: Library },
    { id: "search", label: "Search", icon: Search },
    { id: "settings", label: "Settings", icon: SettingsIcon }
  ]

  const renderPage = () => {
    switch (currentPage) {
      case "discover":
        return <DiscoverPage onNavigate={handleNavigate} />
      case "details":
        return <StoryChapters story={currentStory} onNavigate={handleNavigate} />
      case "story-chapters":
        return <StoryChapters story={currentStory} onNavigate={handleNavigate} />
      case "reader":
        return <SlideReader story={currentStory?.story || currentStory} chapter={currentStory?.chapter} onNavigate={handleNavigate} />
      case "preview":
        return <PreviewReader chapter={currentStory?.chapter || currentStory} onNavigate={handleNavigate} />
      case "library":
        return <LibraryPage onNavigate={handleNavigate} />
      case "search":
        return <SearchPage onNavigate={handleNavigate} />
      case "settings":
        return <SettingsPage onNavigate={handleNavigate} />
      default:
        return <DiscoverPage onNavigate={handleNavigate} />
    }
  }

  // If we're in reader mode, show full screen reader
  if (currentPage === "reader") {
    return <SlideReader story={currentStory?.story || currentStory} chapter={currentStory?.chapter} onNavigate={handleNavigate} />
  }

  // If we're in preview mode, show full screen preview
  if (currentPage === "preview") {
    return <PreviewReader chapter={currentStory?.chapter || currentStory} onNavigate={handleNavigate} />
  }

  // Also show story chapters page without sidebar for details and story-chapters
  if (currentPage === "story-chapters" || currentPage === "details") {
    return (
      <div className="min-h-screen p-8">
        <StoryChapters story={currentStory} onNavigate={handleNavigate} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar Navigation */}
      {!isMobile && (
        <div className="w-64 bg-card border-r border-border p-6">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">Reader Panel</h1>
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
              <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">Reader Panel</h1>
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