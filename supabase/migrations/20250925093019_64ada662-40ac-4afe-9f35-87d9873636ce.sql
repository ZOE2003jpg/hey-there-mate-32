-- Create sounds storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('sounds', 'sounds', true);

-- Create storage policies for sounds bucket
CREATE POLICY "Anyone can view sounds" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'sounds');

CREATE POLICY "Writers can upload sounds" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'sounds' AND auth.uid() IS NOT NULL);

CREATE POLICY "Writers can update their sounds" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'sounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Writers can delete their sounds" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'sounds' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add admin policies for sounds library management  
CREATE POLICY "Admins can manage sounds library" 
ON sounds_library 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Remove fake sound data
DELETE FROM sounds_library;