import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Eye } from "lucide-react"
import { useChapters } from "@/hooks/useChapters"

interface StoryChaptersProps {
  story: any
  onNavigate: (page: string, data?: any) => void
}

export function StoryChapters({ story, onNavigate }: StoryChaptersProps) {
  const { chapters, loading } = useChapters(story?.id)
  
  const publishedChapters = chapters.filter(chapter => chapter.status === 'published')

  const handleReadChapter = (chapter: any) => {
    onNavigate('reader', { story, chapter })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{story?.title}</h1>
          <p className="text-muted-foreground">{story?.description}</p>
        </div>
        <Badge variant="outline">{story?.genre}</Badge>
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Chapters ({publishedChapters.length})</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading chapters...</div>
        ) : publishedChapters.length === 0 ? (
          <Card className="vine-card">
            <CardContent className="pt-6 pb-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No chapters available</h3>
              <p className="text-muted-foreground">
                This story doesn't have any published chapters yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          publishedChapters.map((chapter, index) => (
            <Card key={chapter.id} className="vine-card hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-primary">{chapter.chapter_number}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{chapter.title}</CardTitle>
                      <CardDescription>
                        Chapter {chapter.chapter_number}
                      </CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => handleReadChapter(chapter)}>
                    Read Chapter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.ceil((chapter.word_count || 0) / 200)} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{chapter.view_count || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{chapter.word_count || 0} words</span>
                  </div>
                </div>
                {chapter.content && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
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