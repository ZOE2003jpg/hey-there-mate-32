import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/components/user-context"
import { useProfiles } from "@/hooks/useProfiles"
import { useWriterStats } from "@/hooks/useWriterStats"
import { useAchievements } from "@/hooks/useAchievements"
import { useStories } from "@/hooks/useStories"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { 
  ArrowLeft,
  User,
  Edit,
  Camera,
  BookOpen,
  Calendar,
  Eye,
  Heart,
  Users,
  Award,
  Link as LinkIcon,
  Save,
  Upload,
  TrendingUp,
  MessageCircle
} from "lucide-react"

interface ProfileProps {
  onNavigate: (page: string, data?: any) => void
}

export function Profile({ onNavigate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()
  const { getProfile, updateProfile, createProfile } = useProfiles()
  const { stats, loading: statsLoading } = useWriterStats(user?.id)
  const { achievements, userAchievements, loading: achievementsLoading } = useAchievements(user?.id)
  const { stories, loading: storiesLoading } = useStories()
  
  const [profileData, setProfileData] = useState({
    displayName: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    instagram: "",
    avatarUrl: ""
  })

  // Get current user profile - only load once
  React.useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const profile = await getProfile(user.id)
        setProfileData(prev => ({
          ...prev,
          displayName: profile?.display_name || prev.displayName,
          username: profile?.username || prev.username,
          bio: profile?.bio || prev.bio,
          avatarUrl: profile?.avatar_url || prev.avatarUrl
        }))
      }
    }
    loadProfile()
  }, [user?.id]) // Remove getProfile dependency to prevent infinite loops

  const userStories = stories.filter(story => story.author_id === user?.id)

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    try {
      setUploading(true)
      
      // Upload to Supabase Storage with better error handling
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}` // Add timestamp to avoid caching issues
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const avatarUrl = data.publicUrl

      // Update profile with optimistic update
      setProfileData(prev => ({ ...prev, avatarUrl }))

      // Update database
      try {
        const existingProfile = await getProfile(user.id)
        
        if (existingProfile) {
          await updateProfile(user.id, { avatar_url: avatarUrl })
        } else {
          await createProfile({
            user_id: user.id,
            avatar_url: avatarUrl,
            role: 'writer'
          })
        }
        
        toast.success('Avatar updated successfully!')
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Revert optimistic update on database error
        setProfileData(prev => ({ ...prev, avatarUrl: prev.avatarUrl }))
        toast.error('Failed to save avatar to profile')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    try {
      // Optimistic update - disable editing immediately
      setIsEditing(false)
      
      const profileUpdates = {
        display_name: profileData.displayName,
        username: profileData.username,
        bio: profileData.bio
      }

      // Check if profile exists first
      const existingProfile = await getProfile(user.id)
      
      if (existingProfile) {
        // Update existing profile
        await updateProfile(user.id, profileUpdates)
      } else {
        // Create new profile
        await createProfile({
          user_id: user.id,
          ...profileUpdates,
          role: 'writer'
        })
      }
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
      // Re-enable editing on error
      setIsEditing(true)
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return BookOpen
      case 'Heart': return Heart
      case 'Users': return Users
      case 'Award': return Award
      case 'TrendingUp': return TrendingUp
      case 'Eye': return Eye
      default: return Award
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Writer Profile</h1>
            <p className="text-muted-foreground">Manage your public writer profile</p>
          </div>
        </div>
        <Button 
          variant={isEditing ? "default" : "outline"}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className={isEditing ? "vine-button-hero" : ""}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {profileData.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      size="icon"
                      variant="secondary" 
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload New Photo'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Writer Stats */}
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Writer Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statsLoading ? (
                <div className="text-center text-muted-foreground">Loading stats...</div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stories Published</span>
                    <span className="font-medium">{stats.totalStories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Reads</span>
                    <span className="font-medium">{stats.totalReads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-medium">{stats.totalFollowers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Rating</span>
                    <span className="font-medium">{stats.averageRating} ⭐</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{stats.joinedDate}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="text-center text-muted-foreground">Loading achievements...</div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement) => {
                    const isEarned = userAchievements.some(ua => ua.achievement_id === achievement.id)
                    const IconComponent = getIconComponent(achievement.icon)
                    
                    return (
                      <div key={achievement.id} className={`flex items-center gap-3 p-2 rounded-lg ${
                        isEarned ? "bg-primary/10" : "bg-secondary/20"
                      }`}>
                        <IconComponent className={`h-5 w-5 ${
                          isEarned ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isEarned ? "" : "text-muted-foreground"
                          }`}>
                            {achievement.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        {isEarned && (
                          <Badge variant="secondary" className="text-xs">
                            Earned
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                This information will be visible to readers on your profile page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-4">
                <Label>Social Links</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Website URL"
                      value={profileData.website}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-4">@</span>
                    <Input
                      placeholder="Twitter handle"
                      value={profileData.twitter}
                      onChange={(e) => setProfileData({...profileData, twitter: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-4">@</span>
                    <Input
                      placeholder="Instagram handle"
                      value={profileData.instagram}
                      onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Published Stories */}
          <Card className="vine-card">
            <CardHeader>
              <CardTitle>Published Works</CardTitle>
              <CardDescription>Stories visible on your public profile</CardDescription>
            </CardHeader>
            <CardContent>
              {storiesLoading ? (
                <div className="text-center text-muted-foreground">Loading stories...</div>
              ) : userStories.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No published stories yet. Start writing your first story!
                </div>
              ) : (
                <div className="space-y-4">
                  {userStories.map((story) => (
                    <div key={story.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{story.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline">{story.genre || 'General'}</Badge>
                          <span>{story.status}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {story.view_count?.toLocaleString() || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {story.like_count?.toLocaleString() || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {story.comment_count || 0}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onNavigate("manage-chapters", { storyId: story.id })}>
                        <BookOpen className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
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