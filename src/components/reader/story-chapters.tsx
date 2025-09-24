import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Eye, ChevronLeft } from "lucide-react"
import { useChapters } from "@/hooks/useChapters"

interface StoryChaptersProps {
  story: any
  onNavigate: (page: string, data?: any) => void
}

export function StoryChapters({ story, onNavigate }: StoryChaptersProps) {
  const { chapters, loading } = useChapters(story?.id)
  
  const publishedChapters = chapters.filter(chapter => chapter.status === 'published' || chapter.status === 'draft')

  const handleReadChapter = (chapter: any) => {
    onNavigate('reader', { story, chapter })
  }

  const handlePreviewChapter = (chapter: any) => {
    onNavigate('preview', { chapter })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate("discover")}
          className="mb-2 sm:mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Discover
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold line-clamp-2">{story?.title}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1 line-clamp-3">{story?.description}</p>
        </div>
        <Badge variant="outline" className="flex-shrink-0">{story?.genre}</Badge>
      </div>

      <div className="grid gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-semibold">Chapters ({publishedChapters.length})</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading chapters...</div>
        ) : publishedChapters.length === 0 ? (
          <Card className="vine-card">
            <CardContent className="pt-6 pb-6 text-center">
              <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No chapters available</h3>
              <p className="text-muted-foreground text-sm">
                This story doesn't have any published chapters yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          publishedChapters.map((chapter, index) => (
            <Card key={chapter.id} className="vine-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary text-sm sm:text-base">{chapter.chapter_number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg line-clamp-2">{chapter.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Chapter {chapter.chapter_number}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={() => handlePreviewChapter(chapter)} className="flex-1 sm:flex-initial">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Preview</span>
                    </Button>
                    <Button onClick={() => handleReadChapter(chapter)} className="flex-1 sm:flex-initial">
                      <span className="sm:hidden">Read</span>
                      <span className="hidden sm:inline">Read Chapter</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{Math.ceil((chapter.word_count || 0) / 200)} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{chapter.view_count || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{chapter.slide_count || 0} slides</span>
                  </div>
                </div>
                {chapter.content && (
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {chapter.content.substring(0, 150)}...
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}