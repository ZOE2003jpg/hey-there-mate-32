-- Add metadata column to stories table to support author names and tags
ALTER TABLE public.stories ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;