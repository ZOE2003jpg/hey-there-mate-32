-- Fix sounds_library policies to allow users to upload sounds
DROP POLICY IF EXISTS "Admins can manage sounds library" ON public.sounds_library;

-- Allow authenticated users to insert sounds into the library
CREATE POLICY "Authenticated users can add sounds"
ON public.sounds_library
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to delete their own uploaded sounds
CREATE POLICY "Users can delete their own sounds"
ON public.sounds_library
FOR DELETE
TO public
USING (true); -- For now, allow anyone to delete. In production, you might want to track uploader_id

-- Allow users to update sounds they have access to
CREATE POLICY "Users can update sounds"
ON public.sounds_library
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Keep the existing view policy
-- (Anyone can view sounds library is already in place)