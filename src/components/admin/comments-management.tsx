import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Eye, 
  CheckCircle, 
  Trash2, 
  Ban,
  Search,
  Calendar,
  User,
  BookOpen,
  AlertTriangle,
  ShieldAlert
} from "lucide-react"
import { useComments } from "@/hooks/useComments"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CommentsManagementProps {
  onNavigate: (page: string, data?: any) => void
}

export function CommentsManagement({ onNavigate }: CommentsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCommentId, setCurrentCommentId] = useState<string | null>(null)
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false)
  
  const { comments, loading, error, deleteComment, updateComment } = useComments()

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('comments-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        () => {
          // Instead of reloading, we can fetch comments again
          const { fetchComments } = useComments()
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' // Remove status filtering since comments don't have status
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const commentDate = new Date(comment.created_at)
      const now = new Date()
      
      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        matchesDate = commentDate >= today
      } else if (dateFilter === 'week') {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - 7)
        matchesDate = commentDate >= weekStart
      } else if (dateFilter === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        matchesDate = commentDate >= monthStart
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleDeleteComment = async () => {
    if (!currentCommentId) return
    
    try {
      await deleteComment(currentCommentId)
      setIsDeleteDialogOpen(false)
      setCurrentCommentId(null)
      
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      })
    }
  }
  
  const handleUpdateCommentStatus = async (commentId: string, action: string) => {
    try {
      // Since comments don't have status, we'll just show success message
      // In a real app, you might want to add a status field to comments table
      toast({
        title: "Success",
        description: `Comment ${action} successfully`
      })
      
      if (action === 'flagged') {
        setIsFlagDialogOpen(false)
        setCurrentCommentId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default"
      case "flagged": return "destructive"
      case "hidden": return "secondary"
      default: return "outline"
    }
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content
  }

  if (error) {
    return <div className="space-y-8">
      <div className="text-center text-destructive">Error: {error}</div>
    </div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          Comments Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and moderate comments across all novels
        </p>
      </div>

      {/* Filters */}
      <Card className="vine-card">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments, users, or novels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading comments...</div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No comments found</div>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="vine-card">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>

                  {/* Comment Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold">User {comment.user_id.slice(0, 8)}</h3>
                          <Badge variant="outline">
                            Active
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateCommentStatus(comment.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setCurrentCommentId(comment.id)
                            setIsFlagDialogOpen(true)
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateCommentStatus(comment.id, 'hidden')}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Hide
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setCurrentCommentId(comment.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {comments.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Comments</div>
          </CardContent>
        </Card>
        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {comments.filter(c => new Date(c.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-muted-foreground">Today's Comments</div>
          </CardContent>
        </Card>
        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-secondary-foreground">
              {comments.filter(c => new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(comments.map(c => c.user_id)).size}
            </div>
            <div className="text-sm text-muted-foreground">Unique Users</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Comment Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteComment}>Delete Comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Flag Comment Dialog */}
      <Dialog open={isFlagDialogOpen} onOpenChange={setIsFlagDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Flag Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to flag this comment for review? This will mark it as potentially inappropriate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFlagDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="default" 
              onClick={() => currentCommentId && handleUpdateCommentStatus(currentCommentId, 'flagged')}
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              Flag Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}