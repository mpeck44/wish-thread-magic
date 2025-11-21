-- Add new columns to profiles table for enhanced preferences
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dietary_preferences text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mobility_needs text,
ADD COLUMN IF NOT EXISTS budget_level text,
ADD COLUMN IF NOT EXISTS trip_planning_complete boolean DEFAULT false;

-- Add new columns to family_members table
ALTER TABLE public.family_members
ADD COLUMN IF NOT EXISTS dietary_restrictions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mobility_needs text,
ADD COLUMN IF NOT EXISTS height_restrictions boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS nap_schedule boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS energy_level text,
ADD COLUMN IF NOT EXISTS special_interests text[] DEFAULT '{}';

-- Create trip_preferences table
CREATE TABLE IF NOT EXISTS public.trip_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  accommodation_preference text,
  preferred_parks text[] DEFAULT '{}',
  trip_duration integer,
  visit_dates_start date,
  visit_dates_end date,
  pace_preference text DEFAULT 'moderate',
  theme_days_enabled boolean DEFAULT false,
  theme_day_preferences jsonb DEFAULT '[]'::jsonb,
  dining_style text DEFAULT 'mix',
  shopping_interest text DEFAULT 'moderate',
  photography_priority text DEFAULT 'some',
  special_occasions text[] DEFAULT '{}',
  must_do_experiences text,
  additional_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on trip_preferences
ALTER TABLE public.trip_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for trip_preferences
CREATE POLICY "Users can view trip preferences for their families"
ON public.trip_preferences FOR SELECT
USING (
  family_id IN (
    SELECT f.id FROM public.families f
    WHERE f.creator_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert trip preferences for their families"
ON public.trip_preferences FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT f.id FROM public.families f
    WHERE f.creator_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update trip preferences for their families"
ON public.trip_preferences FOR UPDATE
USING (
  family_id IN (
    SELECT f.id FROM public.families f
    WHERE f.creator_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete trip preferences for their families"
ON public.trip_preferences FOR DELETE
USING (
  family_id IN (
    SELECT f.id FROM public.families f
    WHERE f.creator_id IN (
      SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
    )
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_trip_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_preferences_updated_at
BEFORE UPDATE ON public.trip_preferences
FOR EACH ROW
EXECUTE FUNCTION update_trip_preferences_updated_at();