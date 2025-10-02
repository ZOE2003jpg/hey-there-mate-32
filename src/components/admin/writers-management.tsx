import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Eye, 
  Ban, 
  CheckCircle, 
  MessageSquare,
  Search,
  Plus,
  UserCheck
} from "lucide-react"
import { useProfiles } from '@/hooks/useProfiles'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

interface WritersManagementProps {
  onNavigate: (page: string, data?: any) => void
}

export function WritersManagement({ onNavigate }: WritersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentWriter, setCurrentWriter] = useState<any>(null)
  const [newWriterData, setNewWriterData] = useState({
    username: "",
    display_name: "",
    email: "",
    bio: ""
  })
  
  const { profiles, loading, error, createProfile, updateProfile } = useProfiles()

  const writers = profiles // All profiles are potential writers

  const filteredWriters = writers.filter(writer => {
    const displayName = writer.display_name || writer.username || 'Unknown'
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase())
    const status = writer.status || 'active'
    const matchesStatus = statusFilter === "all" || status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default"
      case "pending": return "secondary"
      case "suspended": return "destructive"
      default: return "outline"
    }
  }
  
  const handleInviteWriter = async () => {
    try {
      // In a real app, this would send an invitation email
      // For now, we'll just create a profile with pending status
      await createProfile({
        user_id: `temp-${Date.now()}`, // In real app, this would be a real user ID
        username: newWriterData.username,
        display_name: newWriterData.display_name,
        bio: newWriterData.bio
      })
      
      setIsInviteDialogOpen(false)
      setNewWriterData({
        username: "",
        display_name: "",
        email: "",
        bio: ""
      })
      
      toast({
        title: "Success",
        description: "Writer invitation sent successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send writer invitation",
        variant: "destructive"
      })
    }
  }
  
  const handleUpdateWriter = async () => {
    if (!currentWriter) return
    
    try {
      await updateProfile(currentWriter.user_id, {
        display_name: currentWriter.display_name,
        bio: currentWriter.bio,
        status: currentWriter.status
      })
      
      setIsEditDialogOpen(false)
      setCurrentWriter(null)
      
      toast({
        title: "Success",
        description: "Writer profile updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update writer profile",
        variant: "destructive"
      })
    }
  }
  
  const handleToggleStatus = async (writer: any) => {
    try {
      const newStatus = writer.status === 'active' ? 'suspended' : 'active'
      await updateProfile(writer.user_id, { status: newStatus })
      
      toast({
        title: "Success",
        description: `Writer ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update writer status`,
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="space-y-8">
      <div className="text-center">Loading writers...</div>
    </div>
  }

  if (error) {
    return <div className="space-y-8">
      <div className="text-center text-destructive">Error: {error}</div>
    </div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Writers Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage writer accounts, verification, and platform access
          </p>
        </div>
        <Button 
          className="vine-button-hero"
          onClick={() => setIsInviteDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Invite Writer
        </Button>
      </div>

      {/* Filters */}
      <Card className="vine-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search writers by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Writers List */}
      <div className="space-y-4">
        {filteredWriters.length === 0 && !loading && (
          <Card className="vine-card">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">No writers found. Invite some writers to get started!</p>
            </CardContent>
          </Card>
        )}
        
        {filteredWriters.map((writer) => (
          <Card key={writer.id} className="vine-card">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>

                {/* Writer Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{writer.display_name || writer.username || 'Unknown'}</h3>
                        <Badge variant={getStatusColor(writer.status || 'active') as any}>
                          {writer.status || 'active'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">User ID: {writer.user_id}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Username:</span>
                          <span className="ml-2 font-medium">{writer.username || 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bio:</span>
                          <span className="ml-2 font-medium">{writer.bio ? writer.bio.substring(0, 50) + '...' : 'No bio'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2 font-medium">{new Date(writer.created_at || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onNavigate("novels", { writerId: writer.user_id })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Novels
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentWriter(writer)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(writer)}
                      >
                        {writer.status === 'suspended' ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onNavigate("comments", { writerId: writer.user_id })}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comments
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredWriters.length === 0 && (
          <Card className="vine-card">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No writers found matching your criteria.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invite Writer Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invite Writer</DialogTitle>
            <DialogDescription>
              Send an invitation to a new writer to join the platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                value={newWriterData.email}
                onChange={(e) => setNewWriterData({...newWriterData, email: e.target.value})}
                placeholder="writer@example.com"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="username">Username</label>
              <Input
                id="username"
                value={newWriterData.username}
                onChange={(e) => setNewWriterData({...newWriterData, username: e.target.value})}
                placeholder="username"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="display_name">Display Name</label>
              <Input
                id="display_name"
                value={newWriterData.display_name}
                onChange={(e) => setNewWriterData({...newWriterData, display_name: e.target.value})}
                placeholder="Writer's Name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="bio">Bio</label>
              <Textarea
                id="bio"
                value={newWriterData.bio}
                onChange={(e) => setNewWriterData({...newWriterData, bio: e.target.value})}
                placeholder="Writer's bio"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteWriter}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Writer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Writer Profile</DialogTitle>
            <DialogDescription>
              Update writer profile information
            </DialogDescription>
          </DialogHeader>
          {currentWriter && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-display-name">Display Name</label>
                <Input
                  id="edit-display-name"
                  value={currentWriter.display_name || ''}
                  onChange={(e) => setCurrentWriter({...currentWriter, display_name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-bio">Bio</label>
                <Textarea
                  id="edit-bio"
                  value={currentWriter.bio || ''}
                  onChange={(e) => setCurrentWriter({...currentWriter, bio: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-status">Status</label>
                <Select 
                  value={currentWriter.status || 'active'} 
                  onValueChange={(value) => setCurrentWriter({...currentWriter, status: value})}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateWriter}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="vine-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {writers.filter(w => (w.status || 'active') === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">Active Writers</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}