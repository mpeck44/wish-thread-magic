-- Step 1: Add profile_complete flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false;

-- Step 2: Mark existing users with families as profile_complete
UPDATE profiles 
SET profile_complete = true 
WHERE id IN (SELECT DISTINCT creator_id FROM families);

-- Step 3: Remove budget_level from profiles (it's trip-specific)
ALTER TABLE profiles DROP COLUMN IF EXISTS budget_level;

-- Step 4: Add trip-specific columns to trips table
ALTER TABLE trips 
  ADD COLUMN IF NOT EXISTS budget_level TEXT,
  ADD COLUMN IF NOT EXISTS accommodation_preference TEXT,
  ADD COLUMN IF NOT EXISTS trip_duration INTEGER,
  ADD COLUMN IF NOT EXISTS visit_dates_start DATE,
  ADD COLUMN IF NOT EXISTS visit_dates_end DATE,
  ADD COLUMN IF NOT EXISTS pace_preference TEXT DEFAULT 'moderate',
  ADD COLUMN IF NOT EXISTS dining_style TEXT DEFAULT 'mix',
  ADD COLUMN IF NOT EXISTS shopping_interest TEXT DEFAULT 'moderate',
  ADD COLUMN IF NOT EXISTS photography_priority TEXT DEFAULT 'some',
  ADD COLUMN IF NOT EXISTS preferred_parks TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS special_occasions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS must_do_experiences TEXT,
  ADD COLUMN IF NOT EXISTS theme_days_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS theme_day_preferences JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Step 5: Migrate data from trip_preferences to trips
-- Match the most recent trip_preferences for each family to their trips
UPDATE trips t
SET 
  budget_level = (
    SELECT tp.dining_style FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  accommodation_preference = (
    SELECT tp.accommodation_preference FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  trip_duration = (
    SELECT tp.trip_duration FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  visit_dates_start = (
    SELECT tp.visit_dates_start FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  visit_dates_end = (
    SELECT tp.visit_dates_end FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  pace_preference = (
    SELECT tp.pace_preference FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  dining_style = (
    SELECT tp.dining_style FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  shopping_interest = (
    SELECT tp.shopping_interest FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  photography_priority = (
    SELECT tp.photography_priority FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  preferred_parks = (
    SELECT tp.preferred_parks FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  special_occasions = (
    SELECT tp.special_occasions FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  must_do_experiences = (
    SELECT tp.must_do_experiences FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  theme_days_enabled = (
    SELECT tp.theme_days_enabled FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  theme_day_preferences = (
    SELECT tp.theme_day_preferences FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  ),
  additional_notes = (
    SELECT tp.additional_notes FROM trip_preferences tp 
    WHERE tp.family_id = t.family_id 
    ORDER BY tp.created_at DESC LIMIT 1
  )
WHERE EXISTS (
  SELECT 1 FROM trip_preferences tp WHERE tp.family_id = t.family_id
);

-- Step 6: Drop the trip_preferences table
DROP TABLE IF EXISTS trip_preferences CASCADE;