-- Phase 1 & 2: Social Foundation + Gamification Features

-- ============================================
-- PHASE 1.1: FOLLOWER SYSTEM
-- ============================================

-- Create followers table
CREATE TABLE public.followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on followers
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for followers
CREATE POLICY "Anyone can view followers"
  ON public.followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.followers FOR DELETE
  USING (auth.uid() = follower_id);

-- Function to update follower count in writer_stats
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count
    UPDATE writer_stats 
    SET total_followers = (
      SELECT COUNT(*) FROM followers WHERE following_id = NEW.following_id
    ),
    updated_at = now()
    WHERE user_id = NEW.following_id;
    
    -- Create notification for new follower
    PERFORM create_notification(
      NEW.following_id,
      'new_follower',
      'New Follower',
      'Someone started following you!',
      NULL,
      NULL
    );
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count
    UPDATE writer_stats 
    SET total_followers = (
      SELECT COUNT(*) FROM followers WHERE following_id = OLD.following_id
    ),
    updated_at = now()
    WHERE user_id = OLD.following_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for follower changes
CREATE TRIGGER on_follower_change
  AFTER INSERT OR DELETE ON followers
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();

-- Add index for performance
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);

-- ============================================
-- PHASE 1.2: ENHANCED COMMENTS SYSTEM
-- ============================================

-- Add threading and mention support to comments
ALTER TABLE public.comments 
  ADD COLUMN parent_comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  ADD COLUMN depth integer DEFAULT 0,
  ADD COLUMN edited boolean DEFAULT false,
  ADD COLUMN like_count integer DEFAULT 0;

-- Create comment_likes table
CREATE TABLE public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_likes
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments 
    SET like_count = like_count + 1
    WHERE id = NEW.comment_id;
    
    -- Notify comment author
    PERFORM create_notification(
      (SELECT user_id FROM comments WHERE id = NEW.comment_id),
      'comment_liked',
      'Comment Liked',
      'Someone liked your comment!',
      (SELECT story_id FROM comments WHERE id = NEW.comment_id),
      (SELECT chapter_id FROM comments WHERE id = NEW.comment_id)
    );
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments 
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.comment_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for comment likes
CREATE TRIGGER on_comment_like_change
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- Add indexes
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);

-- ============================================
-- PHASE 2.1: DAILY READING STREAKS
-- ============================================

-- Create user_streaks table
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_read_date date,
  streak_freeze_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streak"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage streaks"
  ON public.user_streaks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update reading streak
CREATE OR REPLACE FUNCTION update_reading_streak(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_last_read date;
  v_current_streak integer;
  v_longest_streak integer;
  v_today date := CURRENT_DATE;
BEGIN
  -- Get or create streak record
  INSERT INTO user_streaks (user_id, last_read_date, current_streak, longest_streak)
  VALUES (p_user_id, v_today, 1, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT last_read_date, current_streak, longest_streak
  INTO v_last_read, v_current_streak, v_longest_streak
  FROM user_streaks
  WHERE user_id = p_user_id;
  
  -- Update streak logic
  IF v_last_read IS NULL OR v_last_read = v_today THEN
    -- First read or already read today, update last_read_date only
    UPDATE user_streaks
    SET last_read_date = v_today,
        updated_at = now()
    WHERE user_id = p_user_id AND last_read_date IS NULL;
    RETURN;
  ELSIF v_last_read = v_today - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE user_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_read_date = v_today,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Check for streak milestones and notify
    IF v_current_streak + 1 IN (3, 7, 30, 100, 365) THEN
      PERFORM create_notification(
        p_user_id,
        'streak_milestone',
        'Streak Milestone! 🔥',
        'You reached a ' || (v_current_streak + 1)::text || ' day reading streak!',
        NULL,
        NULL
      );
    END IF;
  ELSE
    -- Streak broken, reset to 1
    UPDATE user_streaks
    SET current_streak = 1,
        last_read_date = v_today,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update streak when reading
CREATE OR REPLACE FUNCTION trigger_update_streak()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_reading_streak(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_chapter_read
  AFTER INSERT ON reads
  FOR EACH ROW EXECUTE FUNCTION trigger_update_streak();

-- Add index
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);

-- ============================================
-- PHASE 2.2: LIVE PARAGRAPH REACTIONS
-- ============================================

-- Create paragraph_reactions table (linked to slides)
CREATE TABLE public.paragraph_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id uuid NOT NULL REFERENCES public.slides(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('fire', 'heart', 'cry', 'laugh', 'shock', 'thinking')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(slide_id, user_id, reaction_type)
);

-- Enable RLS on paragraph_reactions
ALTER TABLE public.paragraph_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paragraph_reactions
CREATE POLICY "Anyone can view reactions"
  ON public.paragraph_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON public.paragraph_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON public.paragraph_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_paragraph_reactions_slide_id ON paragraph_reactions(slide_id);
CREATE INDEX idx_paragraph_reactions_user_id ON paragraph_reactions(user_id);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE followers;
ALTER PUBLICATION supabase_realtime ADD TABLE paragraph_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE comment_likes;

-- Set replica identity for realtime updates
ALTER TABLE followers REPLICA IDENTITY FULL;
ALTER TABLE paragraph_reactions REPLICA IDENTITY FULL;
ALTER TABLE comment_likes REPLICA IDENTITY FULL;