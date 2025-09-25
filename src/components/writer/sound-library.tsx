import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Search, Filter, Music, Volume2, Plus, Upload, Trash2 } from "lucide-react"
import { useSoundsLibrary } from "@/hooks/useSoundsLibrary"
import { supabase } from '@/integrations/supabase/client'
import { useToast } from "@/hooks/use-toast"

interface SoundLibraryProps {
  onNavigate: (page: string, data?: any) => void
}

export function SoundLibrary({ onNavigate }: SoundLibraryProps) {
  const { sounds, loading, error, uploadSound, deleteSound } = useSoundsLibrary()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "ambient",
    file: null as File | null
  })
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file",
          variant: "destructive"
        })
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        })
        return
      }
      
      setUploadForm(prev => ({ ...prev, file }))
      
      // Auto-fill name from filename if empty
      if (!uploadForm.name) {
        const name = file.name.replace(/\.[^/.]+$/, "")
        setUploadForm(prev => ({ ...prev, name }))
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadForm.file || !uploadForm.name || !uploadForm.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      await uploadSound(uploadForm.file, uploadForm.name, uploadForm.description, uploadForm.category)
      
      toast({
        title: "Sound uploaded",
        description: "Your sound has been added to the library"
      })
      
      setShowUploadDialog(false)
      setUploadForm({
        name: "",
        description: "",
        category: "ambient",
        file: null
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload sound",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteSound = async (soundId: string, soundName: string) => {
    if (!confirm(`Are you sure you want to delete "${soundName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteSound(soundId)
      toast({
        title: "Sound deleted",
        description: `${soundName} has been removed from the library`
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete sound",
        variant: "destructive"
      })
    }
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
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Sound
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Sound</DialogTitle>
              <DialogDescription>
                Add a new sound to your library. Supported formats: MP3, WAV, OGG
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Audio File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Sound name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this sound..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ambient">Ambient</SelectItem>
                    <SelectItem value="nature">Nature</SelectItem>
                    <SelectItem value="weather">Weather</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="effects">Effects</SelectItem>
                    <SelectItem value="voices">Voices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadDialog(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                <div className="flex gap-1">
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSound(sound.id, sound.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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