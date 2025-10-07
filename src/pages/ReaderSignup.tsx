import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/components/user-context';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReaderSignup() {
  const { signUpReader, loading } = useUser();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUpReader(email, password, fullName);
      
      if (error) {
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          toast.error('This email is already registered. Please login instead.');
        } else if (error.message?.includes('invalid email')) {
          toast.error('Please enter a valid email address');
        } else if (error.message?.includes('password')) {
          toast.error('Password is too weak. Please use a stronger password.');
        } else {
          toast.error('Failed to create account. Please try again.');
        }
        return;
      }

      toast.success('Account created successfully!');
      navigate('/?panel=reader&page=library', { replace: true });
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="vine-card p-8 space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/20 p-4 rounded-full">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Join VineNovel</h1>
            <p className="text-muted-foreground">
              Create your reader account and start your journey
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="vine-button-hero w-full h-12 text-base"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/reader/login')}
                className="text-primary hover:underline font-medium"
                disabled={isSubmitting}
              >
                Login here
              </button>
            </p>
            
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
