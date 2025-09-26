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
        <aside className="sidebar-nav">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">Reader Panel</h1>
            </div>
            
            <nav className="sidebar-menu">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="fixed top-20 left-4 z-40">
          <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}