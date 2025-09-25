-- Fix foreign key relationships
ALTER TABLE public.chapter_sounds 
ADD CONSTRAINT fk_chapter_sounds_chapter_id 
FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;

ALTER TABLE public.chapter_sounds 
ADD CONSTRAINT fk_chapter_sounds_sound_id 
FOREIGN KEY (sound_id) REFERENCES public.sounds_library(id) ON DELETE CASCADE;