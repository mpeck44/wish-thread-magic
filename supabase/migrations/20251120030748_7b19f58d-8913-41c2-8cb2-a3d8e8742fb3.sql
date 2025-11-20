-- Add vibes column to profiles table to store primary user's interests
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vibes text[] DEFAULT '{}';

COMMENT ON COLUMN public.profiles.vibes IS 'Primary user interests/vibes for personalized trip planning';