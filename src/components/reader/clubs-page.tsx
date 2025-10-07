import { useState } from 'react';
import { useClubs } from '@/hooks/useClubs';
import { useUser } from '@/components/user-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReaderAuthModal } from '@/components/reader-auth-modal';
import { Users, Plus, UserPlus, UserCheck } from 'lucide-react';

interface ClubsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ClubsPage({ onNavigate }: ClubsPageProps) {
  const { user } = useUser();
  const { clubs, loading, createClub, joinClub, leaveClub } = useClubs(user?.id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDescription, setNewClubDescription] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFeature, setAuthFeature] = useState('join clubs');

  const handleCreateClub = async () => {
    if (!user) {
      setAuthFeature('create clubs');
      setShowAuthModal(true);
      setIsCreateOpen(false);
      return;
    }
    
    if (!newClubName.trim()) return;
    
    const club = await createClub(newClubName, newClubDescription);
    if (club) {
      setIsCreateOpen(false);
      setNewClubName('');
      setNewClubDescription('');
      onNavigate('club', { clubId: club.id });
    }
  };

  const handleJoinLeave = (clubId: string, isMember: boolean) => {
    if (!user) {
      setAuthFeature(isMember ? 'leave clubs' : 'join clubs');
      setShowAuthModal(true);
      return;
    }
    
    if (isMember) {
      leaveClub(clubId);
    } else {
      joinClub(clubId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <ReaderAuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        feature={authFeature}
      />
      <div className="container-system py-8">
        <div className="content-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="typography-h1">Reader Clubs</h1>
            <p className="typography-body text-muted-foreground mt-2">
              Join communities and discuss your favorite stories
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Club
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Club</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="typography-body font-medium">Club Name</label>
                  <Input
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="Enter club name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="typography-body font-medium">Description</label>
                  <Textarea
                    value={newClubDescription}
                    onChange={(e) => setNewClubDescription(e.target.value)}
                    placeholder="What's this club about?"
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleCreateClub} className="w-full">
                  Create Club
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card
              key={club.id}
              className="p-6 hover-scale cursor-pointer"
              onClick={() => onNavigate('club', { clubId: club.id })}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="typography-h3 mb-2">{club.name}</h3>
                  <p className="typography-caption text-muted-foreground line-clamp-2 mb-3">
                    {club.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="typography-caption text-muted-foreground">
                      {club.member_count} {club.member_count === 1 ? 'member' : 'members'}
                    </span>
                    <Button
                      size="sm"
                      variant={club.is_member ? 'outline' : 'default'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinLeave(club.id, club.is_member);
                      }}
                    >
                      {club.is_member ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Member
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {clubs.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="typography-h3 mb-2">No Clubs Yet</h3>
            <p className="typography-body text-muted-foreground">
              Be the first to create a club!
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
