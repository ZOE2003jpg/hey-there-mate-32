import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Search, Filter, Music, Volume2 } from "lucide-react"
import { useSoundsLibrary } from "@/hooks/useSoundsLibrary"
import { supabase } from '@/integrations/supabase/client'

interface SoundLibraryProps {
  onNavigate: (page: string, data?: any) => void
}

export function SoundLibrary({ onNavigate }: SoundLibraryProps) {
  const { sounds, loading, error } = useSoundsLibrary()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('sound-library-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sounds_library'
        },
        (payload) => {
          console.log('Sound library updated:', payload)
          // The useSoundsLibrary hook will automatically refetch
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
    }
  }, [audioElement])

  const categories = ["all", ...Array.from(new Set(sounds.map(sound => sound.category)))]
  
  const filteredSounds = sounds.filter(sound => {
    const matchesSearch = sound.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sound.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || sound.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const playSound = (sound: any) => {
    if (currentlyPlaying === sound.id) {
      // Stop currently playing sound
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
      setCurrentlyPlaying(null)
      setAudioElement(null)
    } else {
      // Stop any existing audio
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
      
      // Play new sound
      const audio = new Audio(sound.file_url)
      audio.play().catch(error => console.error('Error playing sound:', error))
      
      audio.onended = () => {
        setCurrentlyPlaying(null)
        setAudioElement(null)
      }
      
      audio.onerror = () => {
        console.error('Error loading sound:', sound.file_url)
        setCurrentlyPlaying(null)
        setAudioElement(null)
      }
      
      setCurrentlyPlaying(sound.id)
      setAudioElement(audio)
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return "Unknown"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) return <div>Loading sound library...</div>
  if (error) return <div>Error loading sounds: {error}</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Music className="h-6 w-6" />
            Sound Library
          </h1>
          <p className="text-muted-foreground">Browse and preview sounds for your chapters</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sounds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sound Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSounds.map((sound) => (
          <Card key={sound.id} className="vine-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    {sound.name}
                  </CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {sound.category}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant={currentlyPlaying === sound.id ? "default" : "outline"}
                  onClick={() => playSound(sound)}
                >
                  {currentlyPlaying === sound.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sound.description && (
                <CardDescription className="mb-3">
                  {sound.description}
                </CardDescription>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Duration</span>
                <span>{formatDuration(sound.duration || 0)}</span>
              </div>
              {currentlyPlaying === sound.id && (
                <div className="mt-2 text-xs text-primary font-medium">
                  Now playing...
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSounds.length === 0 && (
        <Card className="vine-card">
          <CardContent className="text-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sounds found matching your criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card className="vine-card">
        <CardHeader>
          <CardTitle>Library Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{sounds.length}</p>
              <p className="text-sm text-muted-foreground">Total Sounds</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length - 1}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredSounds.length}</p>
              <p className="text-sm text-muted-foreground">Filtered Results</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(sounds.reduce((acc, sound) => acc + (sound.duration || 0), 0) / 60)}m
              </p>
              <p className="text-sm text-muted-foreground">Total Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}