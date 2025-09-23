-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('reader', 'writer', 'admin');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'reader',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stories table
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  cover_image_url TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chapters table
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  view_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  slide_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(story_id, chapter_number)
);

-- Create slides table
CREATE TABLE public.slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  slide_number INTEGER NOT NULL,
  background_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chapter_id, slide_number)
);

-- Create story tags table
CREATE TABLE public.story_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(story_id, tag)
);

-- Create library table (reader's saved stories)
CREATE TABLE public.library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Create reads table (reading progress)
CREATE TABLE public.reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  slide_id UUID REFERENCES public.slides(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, COALESCE(story_id::text, '') || COALESCE(chapter_id::text, ''))
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for stories
CREATE POLICY "Anyone can view published stories" ON public.stories FOR SELECT USING (status = 'published' OR auth.uid() = author_id);
CREATE POLICY "Authors can manage their own stories" ON public.stories FOR ALL USING (auth.uid() = author_id);

-- Create RLS policies for chapters
CREATE POLICY "Anyone can view published chapters" ON public.chapters FOR SELECT USING (
  status = 'published' OR 
  auth.uid() IN (SELECT author_id FROM public.stories WHERE id = story_id)
);
CREATE POLICY "Authors can manage their own chapters" ON public.chapters FOR ALL USING (
  auth.uid() IN (SELECT author_id FROM public.stories WHERE id = story_id)
);

-- Create RLS policies for slides
CREATE POLICY "Anyone can view slides of published chapters" ON public.slides FOR SELECT USING (
  chapter_id IN (
    SELECT c.id FROM public.chapters c 
    JOIN public.stories s ON c.story_id = s.id 
    WHERE c.status = 'published' OR s.author_id = auth.uid()
  )
);
CREATE POLICY "Authors can manage their own slides" ON public.slides FOR ALL USING (
  chapter_id IN (
    SELECT c.id FROM public.chapters c 
    JOIN public.stories s ON c.story_id = s.id 
    WHERE s.author_id = auth.uid()
  )
);

-- Create RLS policies for other tables
CREATE POLICY "Users can manage their own library" ON public.library FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own reads" ON public.reads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own likes" ON public.likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can manage their own comments" ON public.comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view tags" ON public.story_tags FOR SELECT USING (true);
CREATE POLICY "Authors can manage tags for their stories" ON public.story_tags FOR ALL USING (
  story_id IN (SELECT id FROM public.stories WHERE author_id = auth.uid())
);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chapters table
ALTER TABLE public.chapters REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;

-- Insert test users data (will need to be done after auth users are created)
-- Test Writer User Profile
INSERT INTO public.profiles (user_id, username, display_name, role, bio) VALUES 
('00000000-0000-0000-0000-000000000001', 'test_writer', 'Test Writer', 'writer', 'I write amazing stories!'),
('00000000-0000-0000-0000-000000000002', 'test_reader', 'Test Reader', 'reader', 'I love reading stories!'),
('00000000-0000-0000-0000-000000000003', 'test_admin', 'Test Admin', 'admin', 'Platform administrator');

-- Insert test story
INSERT INTO public.stories (id, title, description, genre, author_id, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'The Magical Journey', 'An epic adventure through mystical lands', 'Fantasy', '00000000-0000-0000-0000-000000000001', 'published');

-- Insert test chapters
INSERT INTO public.chapters (id, story_id, title, content, chapter_number, status, word_count) VALUES 
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'The Beginning', 'Once upon a time, in a land far away, there lived a young adventurer named Alex. The world was filled with magic and wonder, waiting to be discovered.', 1, 'published', 25),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'The Quest Begins', 'Alex set out on a journey that would change everything. The path ahead was uncertain, but the call of adventure was too strong to resist.', 2, 'published', 22);