-- Enable real-time updates for sounds_library table
ALTER TABLE sounds_library REPLICA IDENTITY FULL;

-- Add sounds_library to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE sounds_library;

-- Enable real-time updates for chapter_sounds table
ALTER TABLE chapter_sounds REPLICA IDENTITY FULL;

-- Add chapter_sounds to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chapter_sounds;