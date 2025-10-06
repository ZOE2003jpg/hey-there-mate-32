import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useFollowers } from '@/hooks/useFollowers'
import { useStories } from '@/hooks/useStories'
import { useUser } from '@/components/user-context'
import { FollowButton } from './follow-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, Avatar as AvatarComponent } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, Heart, MessageCircle } from 'lucide-react'
import { FollowerModal } from './follower-modal'
import { StoryCard } from '@/components/ui/story-card'

interface ProfilePageProps {
  userId: string
  onNavigate: (page: string, data?: any) => void
}

export function ProfilePage({ userId, onNavigate }: ProfilePageProps) {
  const { user: currentUser } = useUser()
  const { profile, loading: profileLoading } = useProfile(userId)
  const { followers, following } = useFollowers(userId)
  const { stories } = useStories()
  const [showFollowerModal, setShowFollowerModal] = useState(false)
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers')

  const userStories = stories.filter(story => story.author_id === userId && story.status === 'published')
  const isOwnProfile = currentUser?.id === userId

  const totalLikes = userStories.reduce((sum, story) => sum + (story.like_count || 0), 0)
  const totalComments = userStories.reduce((sum, story) => sum + (story.comment_count || 0), 0)

  const handleShowFollowers = () => {
    setModalType('followers')
    setShowFollowerModal(true)
  }

  const handleShowFollowing = () => {
    setModalType('following')
    setShowFollowerModal(true)
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <AvatarComponent className="h-24 w-24">
              <img 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} 
                alt={profile.display_name || profile.username || 'User'} 
              />
            </AvatarComponent>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">
                  {profile.display_name || profile.username || 'Anonymous User'}
                </h1>
                {!isOwnProfile && <FollowButton authorId={userId} />}
              </div>
              
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <button
                  onClick={handleShowFollowers}
                  className="flex flex-col items-center hover:text-primary transition-colors"
                >
                  <span className="text-2xl font-bold">{followers.length}</span>
                  <span className="text-sm text-muted-foreground">Followers</span>
                </button>
                <button
                  onClick={handleShowFollowing}
                  className="flex flex-col items-center hover:text-primary transition-colors"
                >
                  <span className="text-2xl font-bold">{following.length}</span>
                  <span className="text-sm text-muted-foreground">Following</span>
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{userStories.length}</span>
                  <span className="text-sm text-muted-foreground">Stories</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{userStories.length}</div>
            <div className="text-sm text-muted-foreground">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{totalLikes}</div>
            <div className="text-sm text-muted-foreground">Total Likes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{totalComments}</div>
            <div className="text-sm text-muted-foreground">Comments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{followers.length}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
      </div>

      {/* Published Stories */}
      <Card>
        <CardHeader>
          <CardTitle>Published Stories</CardTitle>
        </CardHeader>
        <CardContent>
          {userStories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No published stories yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => onNavigate('story-chapters', story)}
                  className="cursor-pointer"
                >
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follower Modal */}
      <FollowerModal
        isOpen={showFollowerModal}
        onClose={() => setShowFollowerModal(false)}
        userId={userId}
        type={modalType}
        onNavigate={onNavigate}
      />
    </div>
  )
}
