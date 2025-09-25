import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChapterSoundManager } from "./chapter-sound-manager"
import { 
  ArrowLeft, 
  Split, 
  Save, 
  BookOpen, 
  Eye, 
  Edit3,
  FileText,
  Clock,
  Type,
  Music
} from "lucide-react"
import { useChapters } from "@/hooks/useChapters"
import { useSlides } from "@/hooks/useSlides"
import { useUser } from "@/components/user-context"
import { toast } from "sonner"
import { useStories } from "@/hooks/useStories"
import { supabase } from '@/integrations/supabase/client'

interface AddChapterProps {
  onNavigate: (page: string, data?: any) => void
  editData?: {
    chapter: any
    storyId: string
  }
}

export function AddChapter({ onNavigate, editData }: AddChapterProps) {
  const { user } = useUser()
  const { createChapter, updateChapter, loading } = useChapters()
  const { splitChapterToSlides } = useSlides()
  const { stories } = useStories()
  
  const [chapterData, setChapterData] = useState({
    title: editData?.chapter?.title || "",
    content: editData?.chapter?.content || "",
    storyId: editData?.storyId || (stories.length > 0 ? stories[0].id : "")
  })
  const [isEditing, setIsEditing] = useState(!!editData?.chapter)
  const [chapterId, setChapterId] = useState(editData?.chapter?.id || null)
  
  const [slides, setSlides] = useState<string[]>([])
  const [wordsPerSlide, setWordsPerSlide] = useState(400)
  const [showSoundManager, setShowSoundManager] = useState(false)
  
  const wordCount = chapterData.content.split(" ").filter(word => word.length > 0).length
  const estimatedSlides = Math.ceil(wordCount / wordsPerSlide)
  const readingTime = Math.ceil(wordCount / 200) // Average reading speed

  const splitIntoSlides = async () => {
    if (!chapterData.content.trim()) {
      toast.error("Please enter chapter content first")
      return
    }

    // Simple client-side splitting for preview
    const words = chapterData.content.split(" ")
    const newSlides = []
    
    for (let i = 0; i < words.length; i += wordsPerSlide) {
      const slideWords = words.slice(i, i + wordsPerSlide)
      newSlides.push(slideWords.join(" "))
    }
    
    setSlides(newSlides)
    toast.success(`Chapter split into ${newSlides.length} slides`)
  }

  const handleSaveChapter = async (publish = false) => {
    if (!user) {
      toast.error("Please login to create chapters")
      return
    }

    if (!chapterData.title.trim() || !chapterData.content.trim()) {
      toast.error("Please fill in title and content")
      return
    }

    if (!chapterData.storyId) {
      toast.error("Please select a story first")
      return
    }

    try {
      let chapter
      
      if (isEditing && chapterId) {
        // Update existing chapter
        chapter = await updateChapter(chapterId, {
          title: chapterData.title,
          content: chapterData.content,
          status: publish ? 'published' : 'draft'
        })
        
        // Recreate slides for updated content
        if (chapter) {
          try {
            await splitChapterToSlides(chapterId, chapterData.content, wordsPerSlide)
          } catch (slideError) {
            console.warn('Slide update failed, but chapter was saved:', slideError)
          }
        }
      } else {
        // Create new chapter
        const { data: existingChapters, error: countError } = await supabase
          .from('chapters')
          .select('chapter_number')
          .eq('story_id', chapterData.storyId)
          .order('chapter_number', { ascending: false })
          .limit(1)
        
        if (countError) {
          console.error('Error fetching chapter count:', countError)
        }
        
        const nextChapterNumber = existingChapters && existingChapters.length > 0 
          ? existingChapters[0].chapter_number + 1 
          : 1

        chapter = await createChapter({
          title: chapterData.title,
          content: chapterData.content,
          story_id: chapterData.storyId,
          chapter_number: nextChapterNumber
        })

        // Update status if publishing
        if (publish && chapter) {
          await supabase
            .from('chapters')
            .update({ status: 'published' })
            .eq('id', chapter.id)
        }

        // Create slides
        if (chapter) {
          try {
            await splitChapterToSlides(chapter.id, chapterData.content, wordsPerSlide)
          } catch (slideError) {
            console.warn('Slide creation failed, but chapter was saved:', slideError)
          }
        }
      }

      toast.success(
        isEditing 
          ? (publish ? "Chapter updated and published!" : "Chapter updated successfully!")
          : (publish ? "Chapter published successfully!" : "Chapter saved as draft!")
      )
      onNavigate("manage-chapters", { storyId: chapterData.storyId })
    } catch (error) {
      if (error.code === '23505') {
        toast.error("A chapter with this number already exists. Please try again.")
      } else {
        toast.error("Failed to create chapter")
      }
      console.error('Chapter creation error:', error)
    }
  }

  const handlePreviewReader = () => {
    if (!chapterData.content.trim()) {
      toast.error("Please add chapter content first")
      return
    }
    
    // Create a temporary chapter object for preview
    const previewChapter = {
      id: 'preview',
      title: chapterData.title || 'Untitled Chapter',
      content: chapterData.content,
      chapter_number: 1,
      word_count: chapterData.content.split(/\s+/).length,
      slide_count: Math.ceil(chapterData.content.split(/\s+/).length / wordsPerSlide)
    }
    
    // Navigate to preview reader
    onNavigate('preview-reader', { 
      chapter: previewChapter
    })
  }

  const handleReSplit = (newWordsPerSlide: number) => {
    setWordsPerSlide(newWordsPerSlide)
    if (chapterData.content) {
      const words = chapterData.content.split(" ")
      const newSlides = []
      
      for (let i = 0; i < words.length; i += newWordsPerSlide) {
        const slideWords = words.slice(i, i + newWordsPerSlide)
        newSlides.push(slideWords.join(" "))
      }
      
      setSlides(newSlides)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("create-story")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit Chapter' : 'Add Chapter'}</h1>
            <p className="text-muted-foreground">{isEditing ? 'Update your chapter content and preview changes' : 'Write your chapter and preview slides'}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="vine-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Chapter Details
              </CardTitle>
              <CardDescription>Basic information about this chapter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="story-select">Select Story</Label>
                <select
                  id="story-select"
                  value={chapterData.storyId}
                  onChange={(e) => setChapterData({...chapterData, storyId: e.target.value})}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select a story...</option>
                  {stories.filter(s => s.author_id === user?.id).map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chapter-title">Chapter Title</Label>
                <Input
                  id="chapter-title"
                  placeholder="Chapter 1: The Beginning..."
                  value={chapterData.title}
                  onChange={(e) => setChapterData({...chapterData, title: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="vine-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Chapter Content
              </CardTitle>
              <CardDescription>
                Paste your chapter text below. It will be automatically split into slides.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Start writing your chapter here... The system will automatically split your content into slides every 400 words for optimal reading experience."
                value={chapterData.content}
                onChange={(e) => setChapterData({...chapterData, content: e.target.value})}
                className="min-h-[400px]"
              />
              
              <div className="flex gap-2">
                <Button onClick={splitIntoSlides} disabled={!chapterData.content || loading}>
                  <Split className="h-4 w-4 mr-2" />
                  Split Preview
                </Button>
                <Button variant="outline" onClick={() => handleReSplit(300)}>
                  Re-split (300 words)
                </Button>
                <Button variant="outline" onClick={() => handleReSplit(500)}>
                  Re-split (500 words)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Slide Previews */}
          {slides.length > 0 && (
            <Card className="vine-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Slide Previews ({slides.length} slides)
                </CardTitle>
                <CardDescription>Preview how your chapter will appear as slides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 max-h-[600px] overflow-y-auto">
                  {slides.map((slide, index) => (
                    <Card key={index} className="p-4 border">
                      <div className="flex justify-between items-center mb-3">
                        <Badge variant="outline">Slide {index + 1}</Badge>
                        <Button size="sm" variant="ghost">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed">{slide}</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {slide.split(" ").length} words
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Chapter Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Word Count:</span>
                  <span className="font-medium">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Slides:</span>
                  <span className="font-medium">{estimatedSlides}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reading Time:</span>
                  <span className="font-medium">{readingTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Words per Slide:</span>
                  <span className="font-medium">{wordsPerSlide}</span>
                </div>
              </div>
              
              {wordCount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.min(100, Math.round((wordCount / 2000) * 100))}%</span>
                  </div>
                  <Progress value={Math.min(100, (wordCount / 2000) * 100)} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleSaveChapter(false)}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Draft"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handlePreviewReader}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Reader Mode
              </Button>
              {isEditing && chapterId && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowSoundManager(!showSoundManager)}
                >
                  <Music className="h-4 w-4 mr-2" />
                  {showSoundManager ? "Hide" : "Add"} Chapter Music
                </Button>
              )}
              <Button 
                className="w-full vine-button-hero justify-start" 
                onClick={() => handleSaveChapter(true)}
                disabled={loading}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {loading ? "Publishing..." : "Publish Chapter"}
              </Button>
            </CardContent>
          </Card>

          {/* Sound Manager */}
          {showSoundManager && isEditing && chapterId && (
            <Card className="vine-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Chapter Music
                </CardTitle>
                <CardDescription>Add background music to enhance your chapter</CardDescription>
              </CardHeader>
              <CardContent>
                <ChapterSoundManager chapterId={chapterId} chapterTitle={chapterData.title} />
              </CardContent>
            </Card>
          )}

          <Card className="vine-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Writing Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Optimal Length</p>
                <p className="text-muted-foreground">Aim for 1500-3000 words per chapter</p>
              </div>
              <div>
                <p className="font-medium">Slide Breaks</p>
                <p className="text-muted-foreground">Natural breaks work best for reader engagement</p>
              </div>
              <div>
                <p className="font-medium">Cliffhangers</p>
                <p className="text-muted-foreground">End chapters with hooks to keep readers engaged</p>
              </div>
              <div>
                <p className="font-medium">Audio Enhancement</p>
                <p className="text-muted-foreground">Add background music to create atmosphere</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}