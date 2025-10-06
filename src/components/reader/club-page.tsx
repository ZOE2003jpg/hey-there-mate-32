import { useState } from 'react';
import { useClubPosts } from '@/hooks/useClubPosts';
import { useUser } from '@/components/user-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ClubPageProps {
  clubId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function ClubPage({ clubId, onNavigate }: ClubPageProps) {
  const { user } = useUser();
  const { posts, loading, createPost } = useClubPosts(clubId, user?.id);
  const [newPost, setNewPost] = useState('');

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    
    await createPost(newPost);
    setNewPost('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-system py-8">
      <div className="content-container max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => onNavigate('clubs')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clubs
        </Button>

        {/* Post Composer */}
        <Card className="p-4 mb-6">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts with the club..."
            className="mb-3 min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitPost} disabled={!newPost.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={post.author_avatar || undefined} />
                  <AvatarFallback>{post.author_name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="typography-body font-medium">{post.author_name}</span>
                    <span className="typography-caption text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="typography-body whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            </Card>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="typography-body text-muted-foreground">
                No posts yet. Be the first to share something!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
