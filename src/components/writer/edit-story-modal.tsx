import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Save, BookOpen, Plus, X, Tags, Edit } from "lucide-react"
import { useStories } from "@/hooks/useStories"
import { useUser } from "@/components/user-context"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface EditStoryModalProps {
  story: any
  children: React.ReactNode
  onStoryUpdated: (story: any) => void
}

export function EditStoryModal({ story, children, onStoryUpdated }: EditStoryModalProps) {
  const { user } = useUser()
  const { updateStory, loading } = useStories()
  const [open, setOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: story?.title || "",
    description: story?.description || "",
    genre: story?.genre || "",
    authorName: story?.metadata?.author_name || "",
    tags: story?.metadata?.tags || [],
    coverImage: null as File | null
  })
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(story?.cover_image_url || null)
  const [newTag, setNewTag] = useState("")

  const genres = [
    "Romance", "Fantasy", "Mystery", "Sci-Fi", "Horror", "Drama", 
    "Comedy", "Adventure", "Thriller", "Historical Fiction"
  ]

  useEffect(() => {
    if (story && open) {
      setFormData({
        title: story.title || "",
        description: story.description || "",
        genre: story.genre || "",
        authorName: story.metadata?.author_name || "",
        tags: story.metadata?.tags || [],
        coverImage: null
      })
      setCoverImagePreview(story.cover_image_url || null)
    }
  }, [story, open])

  const handleSubmit = async () => {
    if (!user || !story) {
      toast.error("Unable to update story")
      return
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a story title")
      return
    }

    try {
      let coverImageUrl = story.cover_image_url
      
      // Upload new cover image if one is selected
      if (formData.coverImage) {
        const fileExt = formData.coverImage.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, formData.coverImage, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(uploadData.path)
        
        coverImageUrl = publicUrl
      }

      const updatedStoryData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: formData.genre,
        cover_image_url: coverImageUrl,
        // Store author name and tags in metadata for now
        metadata: { 
          ...story.metadata, 
          author_name: formData.authorName.trim(),
          tags: formData.tags
        }
      }

      const updatedStory = await updateStory(story.id, updatedStoryData)
      
      toast.success("Story updated successfully!")
      setOpen(false)
      onStoryUpdated(updatedStory)
    } catch (error) {
      console.error('Update story error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update story")
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Story</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Update your story details and settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
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
              <Label htmlFor="authorName">Author Name / Pen Name</Label>
              <Input
                id="authorName"
                placeholder="Enter author name or pen name..."
                value={formData.authorName}
                onChange={(e) => setFormData({...formData, authorName: e.target.value})}
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="tags"
                    placeholder="Add tags and press Enter..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleTagAdd} variant="outline" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2 sm:mr-0" />
                    <span className="sm:hidden">Add Tag</span>
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
                  Upload a new cover image or keep the current one
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
                  Choose New Image
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
          <div className="space-y-3 sm:space-y-4">
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
                {formData.authorName && (
                  <p className="text-xs text-muted-foreground">by {formData.authorName}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description || "Story description will appear here..."}
                </p>
                {formData.genre && (
                  <Badge className="mt-2 text-xs">{formData.genre}</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim()}
                className="vine-button-hero text-sm sm:text-base"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Updating..." : "Update Story"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="text-sm sm:text-base">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}