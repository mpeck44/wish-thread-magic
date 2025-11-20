-- Create enum for family roles
CREATE TYPE public.family_role AS ENUM ('mom', 'dad', 'grandparent', 'kid', 'other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  family_role public.family_role DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create families table
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Family',
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create family_members table
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age INT,
  vibes TEXT[] DEFAULT '{}',
  is_child BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  wish_text TEXT NOT NULL,
  itinerary_json JSONB,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create wish_history table
CREATE TABLE public.wish_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  version INT NOT NULL DEFAULT 1,
  itinerary_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wish_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for families
CREATE POLICY "Users can view families they created or are members of"
  ON public.families FOR SELECT
  USING (
    creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR id IN (
      SELECT family_id FROM public.family_members 
      WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create families"
  ON public.families FOR INSERT
  WITH CHECK (creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Family creators can update their families"
  ON public.families FOR UPDATE
  USING (creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Family creators can delete their families"
  ON public.families FOR DELETE
  USING (creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for family_members
CREATE POLICY "Users can view family members of their families"
  ON public.family_members FOR SELECT
  USING (
    family_id IN (
      SELECT id FROM public.families 
      WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add members to their families"
  ON public.family_members FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT id FROM public.families 
      WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update members in their families"
  ON public.family_members FOR UPDATE
  USING (
    family_id IN (
      SELECT id FROM public.families 
      WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete members from their families"
  ON public.family_members FOR DELETE
  USING (
    family_id IN (
      SELECT id FROM public.families 
      WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for trips
CREATE POLICY "Users can view trips for their families"
  ON public.trips FOR SELECT
  USING (
    family_id IN (
      SELECT id FROM public.families 
      WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create trips for their families"
  ON public.trips FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT id FROM public.families 
      WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update trips for their families"
  ON public.trips FOR UPDATE
  USING (
    family_id IN (
      SELECT id FROM public.families 
      WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete trips for their families"
  ON public.trips FOR DELETE
  USING (
    family_id IN (
      SELECT id FROM public.families 
      WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for wish_history
CREATE POLICY "Users can view wish history for their trips"
  ON public.wish_history FOR SELECT
  USING (
    trip_id IN (
      SELECT id FROM public.trips 
      WHERE family_id IN (
        SELECT id FROM public.families 
        WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can insert wish history for their trips"
  ON public.wish_history FOR INSERT
  WITH CHECK (
    trip_id IN (
      SELECT id FROM public.trips 
      WHERE family_id IN (
        SELECT id FROM public.families 
        WHERE creator_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('itineraries', 'itineraries', false);

-- Storage policies for avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for itineraries (private bucket)
CREATE POLICY "Users can view their own itineraries"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'itineraries' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own itineraries"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'itineraries' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, avatar_url, family_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.raw_user_meta_data->>'avatar_url',
    'other'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_families_creator_id ON public.families(creator_id);
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_members_profile_id ON public.family_members(profile_id);
CREATE INDEX idx_trips_family_id ON public.trips(family_id);
CREATE INDEX idx_wish_history_trip_id ON public.wish_history(trip_id);