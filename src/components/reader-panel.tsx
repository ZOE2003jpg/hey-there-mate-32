import { useState } from "react"
import { DiscoverPage } from "@/components/reader/discover-page"
import { SlideReader } from "@/components/reader/slide-reader"
import { LibraryPage } from "@/components/reader/library-page"
import { SearchPage } from "@/components/reader/search-page"
import { SettingsPage } from "@/components/reader/settings-page"
import { StoryChapters } from "@/components/reader/story-chapters"
import { Button } from "@/components/ui/button"
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
      case "story-chapters":
        return <StoryChapters story={currentStory} onNavigate={handleNavigate} />
      case "reader":
        return <SlideReader story={currentStory} onNavigate={handleNavigate} />
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
    return <SlideReader story={currentStory} onNavigate={handleNavigate} />
  }

  // Also show story chapters page without sidebar
  if (currentPage === "story-chapters") {
    return (
      <div className="min-h-screen p-8">
        <StoryChapters story={currentStory} onNavigate={handleNavigate} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {renderPage()}
      </div>
    </div>
  )
}