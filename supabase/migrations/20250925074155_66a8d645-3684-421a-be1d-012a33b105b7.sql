-- Create sounds library table
CREATE TABLE public.sounds_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  category TEXT DEFAULT 'ambient',
  duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapter_sounds table for linking sounds to chapters
CREATE TABLE public.chapter_sounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL,
  sound_id UUID NOT NULL,
  volume DECIMAL DEFAULT 0.5,
  loop_sound BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chapter_id, sound_id)
);

-- Enable RLS
ALTER TABLE public.sounds_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_sounds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sounds_library
CREATE POLICY "Anyone can view sounds library" 
ON public.sounds_library 
FOR SELECT 
USING (true);

-- RLS Policies for chapter_sounds  
CREATE POLICY "Anyone can view chapter sounds" 
ON public.chapter_sounds 
FOR SELECT 
USING (true);

CREATE POLICY "Authors can manage sounds for their chapters" 
ON public.chapter_sounds 
FOR ALL 
USING (chapter_id IN (
  SELECT c.id 
  FROM chapters c 
  JOIN stories s ON c.story_id = s.id 
  WHERE s.author_id = auth.uid()
));

-- Insert some default ambient sounds
INSERT INTO public.sounds_library (name, description, file_url, category, duration) VALUES
('Forest Ambience', 'Peaceful forest sounds with birds and rustling leaves', 'https://www.soundjay.com/misc/sounds/forest_ambience.mp3', 'nature', 180),
('Rain Gentle', 'Soft rainfall for relaxation', 'https://www.soundjay.com/misc/sounds/rain_gentle.mp3', 'weather', 240),
('Ocean Waves', 'Calming ocean waves on the shore', 'https://www.soundjay.com/misc/sounds/ocean_waves.mp3', 'nature', 300),
('Crackling Fire', 'Warm fireplace crackling sounds', 'https://www.soundjay.com/misc/sounds/fire_crackling.mp3', 'ambient', 120),
('Wind Gentle', 'Soft wind through trees', 'https://www.soundjay.com/misc/sounds/wind_gentle.mp3', 'weather', 200),
('Night Forest', 'Night time forest with crickets and owls', 'https://www.soundjay.com/misc/sounds/night_forest.mp3', 'nature', 360);