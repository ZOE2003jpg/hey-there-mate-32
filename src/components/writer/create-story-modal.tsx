import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Save, BookOpen, Plus, X, Tags, Eye } from "lucide-react"
import { useStories } from "@/hooks/useStories"
import { useUser } from "@/components/user-context"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface CreateStoryModalProps {
  children: React.ReactNode
  onStoryCreated: (story: any) => void
}

export function CreateStoryModal({ children, onStoryCreated }: CreateStoryModalProps) {
  const { user } = useUser()
  const { createStory, loading } = useStories()
  const [open, setOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    tags: [] as string[],
    coverImage: null as File | null
  })
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")

  const genres = [
    "Romance", "Fantasy", "Mystery", "Sci-Fi", "Horror", "Drama", 
    "Comedy", "Adventure", "Thriller", "Historical Fiction"
  ]

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      genre: "",
      tags: [],
      coverImage: null
    })
    setNewTag("")
    setCoverImagePreview(null)
  }

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
      let coverImageUrl = null
      
      // Upload cover image if one is selected
      if (formData.coverImage) {
        const fileExt = formData.coverImage.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, formData.coverImage)
        
        if (uploadError) {
          throw new Error('Failed to upload cover image')
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(uploadData.path)
        
        coverImageUrl = publicUrl
      }

      const newStory = await createStory({
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: formData.genre,
        author_id: user.id,
        tags: formData.tags,
        cover_image_url: coverImageUrl
      })
      
      toast.success("Story created successfully!")
      setOpen(false)
      resetForm()
      onStoryCreated(newStory)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Story</DialogTitle>
          <DialogDescription>
            Set up your story details and start writing your first chapter
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-3 gap-6 mt-4">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4">
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

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your cover image here, or click to browse
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cover-image-input"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"
                  onClick={() => document.getElementById('cover-image-input')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                {formData.coverImage && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {formData.coverImage.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Story Preview</h3>
              <div className="aspect-[3/4] bg-secondary/30 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {coverImagePreview ? (
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-1" />
                    <p className="text-xs">Cover Preview</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm">{formData.title || "Story Title"}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description || "Story description will appear here..."}
                </p>
                {formData.genre && (
                  <Badge className="mt-2 text-xs">{formData.genre}</Badge>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Quick Tips</h3>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <Tags className="h-3 w-3 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Use relevant tags</p>
                    <p className="text-muted-foreground">Help readers discover your story</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Eye className="h-3 w-3 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Compelling description</p>
                    <p className="text-muted-foreground">Hook readers with your first lines</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim()}
                className="vine-button-hero"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Story"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}