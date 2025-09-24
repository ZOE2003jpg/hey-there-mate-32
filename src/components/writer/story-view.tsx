import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Eye, 
  MoreHorizontal,
  BookOpen,
  Clock,
  Users,
  Heart,
  MessageCircle,
  Save,
  FileText
} from "lucide-react"
import { useUser } from "@/components/user-context"
import { useChapters } from "@/hooks/useChapters"
import { useSlides } from "@/hooks/useSlides"
import { toast } from "sonner"
import { supabase } from '@/integrations/supabase/client'

interface StoryViewProps {
  story: any
  onNavigate: (page: string, data?: any) => void
}

export function StoryView({ story, onNavigate }: StoryViewProps) {
  const { user } = useUser()
  const { createChapter, loading: chapterLoading } = useChapters()
  const { splitChapterToSlides } = useSlides()
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addChapterOpen, setAddChapterOpen] = useState(false)
  
  const [chapterData, setChapterData] = useState({
    title: "",
    content: ""
  })

  useEffect(() => {
    fetchChapters()
  }, [story.id])

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', story.id)
        .order('chapter_number', { ascending: true })

      if (error) throw error
      setChapters(data || [])
    } catch (error) {
      console.error('Error fetching chapters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChapter = async () => {
    if (!user) {
      toast.error("Please login to create chapters")
      return
    }

    if (!chapterData.title.trim() || !chapterData.content.trim()) {
      toast.error("Please fill in title and content")
      return
    }

    try {
      // Get the next chapter number
      const nextChapterNumber = chapters.length + 1

      // Create the chapter
      const chapter = await createChapter({
        title: chapterData.title,
        content: chapterData.content,
        story_id: story.id,
        chapter_number: nextChapterNumber
      })

      // Split into slides using edge function
      if (chapter) {
        await splitChapterToSlides(chapter.id, chapterData.content, 400)
      }

      toast.success("Chapter created successfully!")
      setAddChapterOpen(false)
      setChapterData({ title: "", content: "" })
      fetchChapters() // Refresh chapters list
    } catch (error) {
      toast.error("Failed to create chapter")
      console.error('Chapter creation error:', error)
    }
  }

  const wordCount = chapterData.content.split(" ").filter(word => word.length > 0).length
  const estimatedSlides = Math.ceil(wordCount / 400)
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("manage-stories")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{story.title}</h1>
            <p className="text-muted-foreground">Manage your story and chapters</p>
          </div>
        </div>
        
        <Dialog open={addChapterOpen} onOpenChange={setAddChapterOpen}>
          <DialogTrigger asChild>
            <Button className="vine-button-hero">
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Chapter</DialogTitle>
              <DialogDescription>
                Create a new chapter for "{story.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid lg:grid-cols-3 gap-6 mt-4">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter-title">Chapter Title</Label>
                  <Input
                    id="chapter-title"
                    placeholder={`Chapter ${chapters.length + 1}: Enter title...`}
                    value={chapterData.title}
                    onChange={(e) => setChapterData({...chapterData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chapter-content">Chapter Content</Label>
                  <Textarea
                    id="chapter-content"
                    placeholder="Start writing your chapter here... The system will automatically split your content into slides for optimal reading experience."
                    value={chapterData.content}
                    onChange={(e) => setChapterData({...chapterData, content: e.target.value})}
                    className="min-h-[400px]"
                  />
                </div>
              </div>
              
              {/* Sidebar Stats */}
              <div className="space-y-4">
                <Card className="vine-card">
                  <CardHeader>
                    <CardTitle className="text-sm">Chapter Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Word Count:</span>
                      <span className="font-medium">{wordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Slides:</span>
                      <span className="font-medium">{estimatedSlides}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reading Time:</span>
                      <span className="font-medium">{readingTime} min</span>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleAddChapter}
                    disabled={chapterLoading || !chapterData.title.trim() || !chapterData.content.trim()}
                    className="vine-button-hero"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {chapterLoading ? "Creating..." : "Create Chapter"}
                  </Button>
                  <Button variant="outline" onClick={() => setAddChapterOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Story Details */}
        <div className="lg:col-span-1">
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Story Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-secondary/30 rounded-lg flex items-center justify-center">
                {story.cover_image_url ? (
                  <img 
                    src={story.cover_image_url} 
                    alt={story.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2" />
                    <p>No Cover Image</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{story.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {story.description || "No description available"}
                </p>
                {story.genre && (
                  <Badge className="mt-2">{story.genre}</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" />
                  </div>
                  <p className="font-bold">{story.view_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Heart className="h-4 w-4" />
                  </div>
                  <p className="font-bold">{story.like_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chapters List */}
        <div className="lg:col-span-2">
          <Card className="vine-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Chapters ({chapters.length})</CardTitle>
                  <CardDescription>Manage your story chapters</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading chapters...</div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No chapters yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start writing by adding your first chapter
                  </p>
                  <Button 
                    onClick={() => setAddChapterOpen(true)}
                    className="vine-button-hero"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Chapter
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chapters.map((chapter) => (
                    <Card key={chapter.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">Chapter {chapter.chapter_number}</Badge>
                            <h4 className="font-medium">{chapter.title}</h4>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {chapter.word_count || 0} words
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {chapter.view_count || 0} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(chapter.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'}>
                            {chapter.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}