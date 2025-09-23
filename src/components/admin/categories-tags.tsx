import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  BookOpen,
  AlertCircle
} from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface TagData {
  id: string
  tag: string
  story_id: string
  created_at: string
}

interface CategoriesTagsProps {
  onNavigate: (page: string, data?: any) => void
}

export function CategoriesTags({ onNavigate }: CategoriesTagsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [newTag, setNewTag] = useState("")
  const [tags, setTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog states
  const [isEditTagDialogOpen, setIsEditTagDialogOpen] = useState(false)
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false)
  
  // Edit states
  const [currentTag, setCurrentTag] = useState<{ id: string, tag: string }>({ id: '', tag: '' })

  const fetchTags = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('story_tags')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTags(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags')
    } finally {
      setLoading(false)
    }
  }

  // Realtime subscription
  useEffect(() => {
    fetchTags()
    
    const channel = supabase
      .channel('story-tags-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_tags'
        },
        () => {
          fetchTags()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleCreateTag = async () => {
    if (!newTag.trim()) return
    
    try {
      // For demo purposes, we'll use a placeholder story_id
      // In a real implementation, you'd select which story to tag
      const { error } = await supabase
        .from('story_tags')
        .insert({ tag: newTag.trim(), story_id: 'placeholder' })

      if (error) throw error
      setNewTag("")
      toast.success("Tag created successfully")
      fetchTags()
    } catch (error) {
      toast.error("Failed to create tag")
    }
  }

  const handleUpdateTag = async () => {
    if (!currentTag.tag.trim()) return
    
    try {
      await supabase
        .from('story_tags')
        .update({ tag: currentTag.tag.trim() })
        .eq('id', currentTag.id)
      
      setIsEditTagDialogOpen(false)
      toast.success("Tag updated successfully")
      fetchTags()
    } catch (error) {
      toast.error("Failed to update tag")
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      await supabase
        .from('story_tags')
        .delete()
        .eq('id', tagId)

      setIsDeleteTagDialogOpen(false)
      toast.success("Tag deleted successfully")
      fetchTags()
    } catch (error) {
      toast.error("Failed to delete tag")
    }
  }
  
  const openEditTagDialog = (tag: TagData) => {
    setCurrentTag({
      id: tag.id,
      tag: tag.tag
    })
    setIsEditTagDialogOpen(true)
  }
  
  const openDeleteTagDialog = (tag: TagData) => {
    setCurrentTag({
      id: tag.id,
      tag: tag.tag
    })
    setIsDeleteTagDialogOpen(true)
  }

  const filteredTags = tags.filter(tag =>
    tag.tag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique tags with counts
  const uniqueTags = tags.reduce((acc, tag) => {
    const existing = acc.find(t => t.tag === tag.tag)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ ...tag, count: 1 })
    }
    return acc
  }, [] as (TagData & { count: number })[])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Tag className="h-8 w-8 text-primary" />
          Tags Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage story tags used by writers and readers
        </p>
      </div>

      {/* Search */}
      <Card className="vine-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card className="vine-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
              <CardDescription>
                Popular tags used by writers and readers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Tag */}
          <Card className="vine-card p-4">
            <h4 className="font-semibold mb-3">Add New Tag</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="new-tag">Tag Name</Label>
                  <Input
                    id="new-tag"
                    placeholder="Enter tag name..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button className="vine-button-hero" onClick={handleCreateTag}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
          </Card>

          {/* Tags Cloud */}
          <div className="space-y-4">
            <h4 className="font-semibold">Popular Tags</h4>
            <div className="flex flex-wrap gap-3">
              {loading ? (
                <div className="text-center py-4">Loading tags...</div>
              ) : uniqueTags.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No tags found</div>
              ) : (
                uniqueTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer hover:opacity-80"
                    >
                      {tag.tag}
                      <span className="ml-2 text-xs opacity-70">({tag.count})</span>
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" onClick={() => openEditTagDialog(tag)} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => openDeleteTagDialog(tag)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tag Analytics */}
          <Card className="vine-card p-4">
            <h4 className="font-semibold mb-3">Tag Analytics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{uniqueTags.length}</div>
                <div className="text-sm text-muted-foreground">Unique Tags</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {tags.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Usage</div>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
      
      {/* Edit Tag Dialog */}
      <Dialog open={isEditTagDialogOpen} onOpenChange={setIsEditTagDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update tag name. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">Tag Name</Label>
              <Input
                id="edit-tag-name"
                value={currentTag.tag}
                onChange={(e) => setCurrentTag({ ...currentTag, tag: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTag}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <Dialog open={isDeleteTagDialogOpen} onOpenChange={setIsDeleteTagDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag "{currentTag.tag}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteTag(currentTag.id)}>
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}