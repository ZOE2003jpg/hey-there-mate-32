-- Create analytics events table
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  story_id uuid,
  chapter_id uuid,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create writer statistics table for aggregated data
CREATE TABLE public.writer_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  total_reads integer DEFAULT 0,
  total_likes integer DEFAULT 0, 
  total_comments integer DEFAULT 0,
  total_followers integer DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  avg_reading_time integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writer_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_events
CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Writers can view their story analytics" ON public.analytics_events
  FOR SELECT USING (
    story_id IN (
      SELECT id FROM public.stories WHERE author_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- Create policies for writer_stats
CREATE POLICY "Users can view their own stats" ON public.writer_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.writer_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert writer stats" ON public.writer_stats
  FOR INSERT WITH CHECK (true);

-- Create trigger for writer_stats updated_at
CREATE TRIGGER update_writer_stats_updated_at
  BEFORE UPDATE ON public.writer_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_analytics_events_story_id ON public.analytics_events(story_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_writer_stats_user_id ON public.writer_stats(user_id);