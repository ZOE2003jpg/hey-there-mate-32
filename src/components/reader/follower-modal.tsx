import { useFollowers } from '@/hooks/useFollowers'
import { useProfile } from '@/hooks/useProfile'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface FollowerModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  type: 'followers' | 'following'
  onNavigate: (page: string, data?: any) => void
}

function UserListItem({ userId, onNavigate }: { userId: string, onNavigate: (page: string, data?: any) => void }) {
  const { profile } = useProfile(userId)

  if (!profile) return null

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <button
        onClick={() => onNavigate('profile', { userId })}
        className="flex items-center gap-3 flex-1"
      >
        <Avatar className="h-10 w-10">
          <img 
            src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
            alt={profile.display_name || profile.username || 'User'}
          />
        </Avatar>
        <div className="text-left">
          <p className="font-medium">{profile.display_name || profile.username || 'Anonymous'}</p>
          {profile.bio && (
            <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</p>
          )}
        </div>
      </button>
    </div>
  )
}

export function FollowerModal({ isOpen, onClose, userId, type, onNavigate }: FollowerModalProps) {
  const { followers, following } = useFollowers(userId)

  const users = type === 'followers' 
    ? followers.map(f => f.follower_id) 
    : following.map(f => f.following_id)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'followers' ? 'Followers' : 'Following'} ({users.length})
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No {type === 'followers' ? 'followers' : 'following'} yet
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((uid) => (
                <UserListItem key={uid} userId={uid} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
