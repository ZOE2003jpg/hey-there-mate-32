import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { DiscoverPage } from "@/components/reader/discover-page"
import { FeaturedPage } from "@/components/reader/featured-page"
import { TrendingPage } from "@/components/reader/trending-page"
import { SlideReader } from "@/components/reader/slide-reader"
import { LibraryPage } from "@/components/reader/library-page"
import { SearchPage } from "@/components/reader/search-page"
import { SettingsPage } from "@/components/reader/settings-page"
import { StoryChapters } from "@/components/reader/story-chapters"
import { PreviewReader } from "@/components/reader/preview-reader"
import { ProfilePage } from "@/components/reader/profile-page"
import { ClubsPage } from "@/components/reader/clubs-page"
import { ClubPage } from "@/components/reader/club-page"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  Compass, 
  BookOpen, 
  Library, 
  Search, 
  Settings as SettingsIcon,
  Star,
  TrendingUp,
  ArrowLeft,
  Users
} from "lucide-react"

export function ReaderPanel() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(() => searchParams.get('page') || "discover")
  const [currentStory, setCurrentStory] = useState(null)
  const isMobile = useIsMobile()

  // Update page when URL changes
  useEffect(() => {
    const page = searchParams.get('page')
    if (page && page !== currentPage) {
      setCurrentPage(page)
    }
  }, [searchParams])

  const handleNavigate = (page: string, data?: any) => {
    if (data) {
      setCurrentStory(data)
    }
    setCurrentPage(page)
    
    // Update URL
    const newParams = new URLSearchParams(searchParams)
    newParams.set('panel', 'reader')
    newParams.set('page', page)
    setSearchParams(newParams)
  }

  const navigationItems = [
    { id: "discover", label: "Discover", icon: Compass },
    { id: "featured", label: "Featured", icon: Star },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "library", label: "My Library", icon: Library },
    { id: "clubs", label: "Clubs", icon: Users },
    { id: "search", label: "Search", icon: Search },
    { id: "settings", label: "Settings", icon: SettingsIcon }
  ]

  const renderPage = () => {
    switch (currentPage) {
      case "discover":
        return <DiscoverPage onNavigate={handleNavigate} />
      case "featured":
        return <FeaturedPage onNavigate={handleNavigate} />
      case "trending":
        return <TrendingPage onNavigate={handleNavigate} />
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
      case "clubs":
        return <ClubsPage onNavigate={handleNavigate} />
      case "club":
        return <ClubPage clubId={currentStory?.clubId} onNavigate={handleNavigate} />
      case "search":
        return <SearchPage onNavigate={handleNavigate} />
      case "settings":
        return <SettingsPage onNavigate={handleNavigate} />
      case "profile":
        return <ProfilePage userId={currentStory?.userId} onNavigate={handleNavigate} />
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

      {/* Main Content */}
      <main className="main-content">
        {/* Back Button for Inner Pages */}
        {currentPage !== "discover" && (
          <div className="p-4 border-b border-border">
            <button 
              onClick={() => handleNavigate("discover")} 
              className="back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Discover</span>
            </button>
          </div>
        )}
        
        <div className="content-container">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}