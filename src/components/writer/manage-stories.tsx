import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useStories } from "@/hooks/useStories"
import { useUser } from "@/components/user-context"
import { toast } from "sonner"
import { CreateStoryModal } from "./create-story-modal"
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Calendar,
  Filter,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ManageStoriesProps {
  onNavigate: (page: string, data?: any) => void
}

export function ManageStories({ onNavigate }: ManageStoriesProps) {
  const { user } = useUser()
  const { stories, loading, deleteStory, updateStory } = useStories()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null)

  const userStories = stories.filter(story => story.author_id === user?.id)

  const filteredStories = userStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || story.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default"
      case "draft": return "secondary"
      case "archived": return "outline"
      default: return "secondary"
    }
  }

  const handleDeleteClick = (storyId: string) => {
    setStoryToDelete(storyId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!storyToDelete) return
    
    try {
      await deleteStory(storyToDelete)
      toast.success("Story deleted successfully")
    } catch (error) {
      toast.error("Failed to delete story")
    }
    
    setDeleteDialogOpen(false)
    setStoryToDelete(null)
  }

  const toggleStatus = async (storyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    try {
      await updateStory(storyId, { status: newStatus as any })
      toast.success(`Story ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`)
    } catch (error) {
      toast.error("Failed to update story status")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Manage Stories</h1>
            <p className="text-muted-foreground text-sm sm:text-base">View and manage all your stories</p>
          </div>
        </div>
        <CreateStoryModal onStoryCreated={(story) => onNavigate("story-view", { story })}>
          <Button className="vine-button-hero text-sm sm:text-base w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Story
          </Button>
        </CreateStoryModal>
      </div>

      {/* Filters */}
      <Card className="vine-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "published", "draft", "archived"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stories Grid */}
      {loading ? (
        <div className="text-center py-8">Loading stories...</div>
      ) : (
        <div className="grid gap-6">
          {filteredStories.map((story) => (
            <Card key={story.id} className="vine-card">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Cover Image */}
                  <div className="w-16 h-20 sm:w-20 sm:h-28 bg-secondary/30 rounded-lg flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                    {story.cover_image_url ? (
                      <img src={story.cover_image_url} alt={story.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Story Details */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-2">
                      <div className="text-center sm:text-left">
                        <h3 className="text-lg sm:text-xl font-bold">{story.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {story.genre || "General"} • Created {new Date(story.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(story.status)} className="text-xs">
                        {story.status}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        {story.view_count.toLocaleString()} reads
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        Updated {new Date(story.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex justify-center sm:justify-start gap-4 text-xs sm:text-sm">
                        <span>{story.like_count} likes</span>
                        <span>{story.comment_count} comments</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleStatus(story.id, story.status)}
                          className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                          {story.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onNavigate("manage-chapters", story)}
                          className="w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="ml-1 sm:hidden">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onNavigate("manage-chapters", story)}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              View Chapters
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onNavigate("analytics", story)}>
                              <Filter className="h-4 w-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(story.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredStories.length === 0 && !loading && (
        <Card className="vine-card">
          <CardContent className="pt-6 pb-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No stories found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start your writing journey by creating your first story"
              }
            </p>
            {!searchQuery && filterStatus === "all" && (
              <CreateStoryModal onStoryCreated={(story) => onNavigate("story-view", { story })}>
                <Button className="vine-button-hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Story
                </Button>
              </CreateStoryModal>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be undone and will permanently remove the story and all its chapters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete Story
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}