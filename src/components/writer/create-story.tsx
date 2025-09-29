import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Save, BookOpen, Eye, Tags, Plus, X } from "lucide-react"
import { useStories } from "@/hooks/useStories"
import { useUser } from "@/components/user-context"
import { toast } from "sonner"

interface CreateStoryProps {
  onNavigate: (page: string, data?: any) => void
}

export function CreateStory({ onNavigate }: CreateStoryProps) {
  const { user } = useUser()
  const { createStory, loading } = useStories()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    tags: [] as string[],
    coverImage: null as File | null
  })
  const [newTag, setNewTag] = useState("")

  const genres = [
    "Romance", "Fantasy", "Mystery", "Sci-Fi", "Horror", "Drama", 
    "Comedy", "Adventure", "Thriller", "Historical Fiction"
  ]

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to create stories")
      return
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a story title")
      return
    }

    try {
      const newStory = await createStory({
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: formData.genre,
        author_id: user.id,
        tags: formData.tags
      })
      
      toast.success("Story created successfully!")
      // Navigate to manage chapters with the new story data
      onNavigate("manage-chapters", { story: newStory })
    } catch (error) {
      console.error('Create story error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create story")
    }
  }

  const handleTagAdd = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      handleTagAdd()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Story</h1>
            <p className="text-muted-foreground">Set up your story details and start writing</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Story Information</CardTitle>
              <CardDescription>Basic details about your story</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Story Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your story title..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Write a compelling description of your story..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={formData.genre} onValueChange={(value) => setFormData({...formData, genre: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre..." />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre.toLowerCase()}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add tags and press Enter..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" onClick={handleTagAdd} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="cursor-pointer flex items-center gap-1"
                          onClick={() => handleTagRemove(tag)}
                        >
                          {tag} <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="vine-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Cover Image
              </CardTitle>
              <CardDescription>Upload an eye-catching cover for your story</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop your cover image here, or click to browse
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Story Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-secondary/30 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2" />
                  <p>Cover Preview</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">{formData.title || "Story Title"}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.description || "Story description will appear here..."}
                </p>
                {formData.genre && (
                  <Badge className="mt-2">{formData.genre}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <Tags className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Use relevant tags</p>
                  <p className="text-muted-foreground">Help readers discover your story</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Eye className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Compelling description</p>
                  <p className="text-muted-foreground">Hook readers with your first lines</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Save as Draft"}
            </Button>
            <Button 
              className="w-full vine-button-hero"
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim()}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create & Start Writing"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}