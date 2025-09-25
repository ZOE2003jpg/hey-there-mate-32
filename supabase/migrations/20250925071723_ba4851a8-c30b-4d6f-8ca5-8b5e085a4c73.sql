-- Enable realtime for likes, comments, reads, and stories tables
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.reads REPLICA IDENTITY FULL;
ALTER TABLE public.stories REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;