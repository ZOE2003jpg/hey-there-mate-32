import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users, 
  Plus, 
  Search,
  Mail,
  Shield,
  Trash2,
  Edit,
  Loader2,
  UserCog
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { z } from "zod"

interface UserManagementProps {
  onNavigate: (page: string, data?: any) => void
}

const createUserSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long").optional().or(z.literal("")),
  display_name: z.string().max(100, "Display name too long").optional().or(z.literal("")),
  roles: z.array(z.enum(["reader", "writer", "admin"])).min(1, "At least one role is required")
})

export function UserManagement({ onNavigate }: UserManagementProps) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    username: "",
    display_name: "",
    roles: [] as string[]
  })
  
  const [editRoles, setEditRoles] = useState<string[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch all user roles
      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      // Transform data to include roles array
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: allRoles?.filter(r => r.user_id === profile.user_id).map(r => r.role) || []
      })) || []

      setUsers(usersWithRoles)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      // Validate input
      const validated = createUserSchema.parse(newUserData)
      
      setIsCreating(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: validated.email,
          password: validated.password,
          username: validated.username || null,
          display_name: validated.display_name || null,
          roles: validated.roles
        }
      })

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      toast.success(data?.message || 'User created successfully')
      setIsCreateDialogOpen(false)
      setNewUserData({
        email: "",
        password: "",
        username: "",
        display_name: "",
        roles: []
      })
      
      // Refresh users list
      await fetchUsers()
      
    } catch (error: any) {
      console.error('Error creating user:', error)
      
      if (error.errors && Array.isArray(error.errors)) {
        // Zod validation error
        toast.error(error.errors[0]?.message || 'Validation error')
      } else {
        toast.error('Failed to create user: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateRoles = async () => {
    if (!selectedUser) return
    
    try {
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id)

      if (deleteError) throw deleteError

      // Insert new roles
      if (editRoles.length > 0) {
        const roleInserts = editRoles.map(role => ({
          user_id: selectedUser.user_id,
          role: role as 'admin' | 'reader' | 'writer'
        }))

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(roleInserts)

        if (insertError) throw insertError
      }

      toast.success('User roles updated successfully')
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      await fetchUsers()
      
    } catch (error: any) {
      console.error('Error updating roles:', error)
      toast.error('Failed to update roles: ' + error.message)
    }
  }

  const toggleRole = (role: string) => {
    setNewUserData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const toggleEditRole = (role: string) => {
    setEditRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter)
    
    return matchesSearch && matchesRole
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive"
      case "writer": return "default"
      case "reader": return "secondary"
      default: return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCog className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and assign roles to platform users
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, username, or display name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="writer">Writer</SelectItem>
                <SelectItem value="reader">Reader</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        )}

        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-8 w-8 text-primary" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-semibold">
                          {user.display_name || user.username || 'No name'}
                        </h3>
                        {user.roles.map((role: string) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role) as any}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="font-mono">{user.user_id}</span>
                        </div>
                        {user.username && (
                          <div>
                            <span className="text-muted-foreground">Username:</span>
                            <span className="ml-2 font-medium">@{user.username}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="ml-2 font-medium">{user.status || 'active'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2 font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setEditRoles(user.roles)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Roles
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {users.filter(u => u.roles.includes('admin')).length}
            </div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {users.filter(u => u.roles.includes('writer')).length}
            </div>
            <div className="text-sm text-muted-foreground">Writers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">
              {users.filter(u => u.roles.includes('reader')).length}
            </div>
            <div className="text-sm text-muted-foreground">Readers</div>
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign roles
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUserData.username}
                onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                placeholder="username"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={newUserData.display_name}
                onChange={(e) => setNewUserData({...newUserData, display_name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            
            <div className="grid gap-3">
              <Label>Roles * (select at least one)</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-reader"
                    checked={newUserData.roles.includes('reader')}
                    onCheckedChange={() => toggleRole('reader')}
                  />
                  <label htmlFor="role-reader" className="text-sm font-medium leading-none cursor-pointer">
                    Reader - Can read and interact with stories
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-writer"
                    checked={newUserData.roles.includes('writer')}
                    onCheckedChange={() => toggleRole('writer')}
                  />
                  <label htmlFor="role-writer" className="text-sm font-medium leading-none cursor-pointer">
                    Writer - Can create and publish stories
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-admin"
                    checked={newUserData.roles.includes('admin')}
                    onCheckedChange={() => toggleRole('admin')}
                  />
                  <label htmlFor="role-admin" className="text-sm font-medium leading-none cursor-pointer">
                    Admin - Full platform access
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Roles Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Update roles for {selectedUser?.display_name || selectedUser?.username || 'user'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-role-reader"
                  checked={editRoles.includes('reader')}
                  onCheckedChange={() => toggleEditRole('reader')}
                />
                <label htmlFor="edit-role-reader" className="text-sm font-medium leading-none cursor-pointer">
                  Reader
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-role-writer"
                  checked={editRoles.includes('writer')}
                  onCheckedChange={() => toggleEditRole('writer')}
                />
                <label htmlFor="edit-role-writer" className="text-sm font-medium leading-none cursor-pointer">
                  Writer
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-role-admin"
                  checked={editRoles.includes('admin')}
                  onCheckedChange={() => toggleEditRole('admin')}
                />
                <label htmlFor="edit-role-admin" className="text-sm font-medium leading-none cursor-pointer">
                  Admin
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRoles} disabled={editRoles.length === 0}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}