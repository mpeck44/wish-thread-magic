-- Drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Users can create families" ON public.families;

-- Create a simpler security definer function to check if creator_id matches user's profile
CREATE OR REPLACE FUNCTION public.is_users_profile(_profile_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _profile_id
      AND user_id = _user_id
  );
$$;

-- Recreate the INSERT policy using the security definer function
CREATE POLICY "Users can create families"
ON public.families
FOR INSERT
WITH CHECK (public.is_users_profile(creator_id, auth.uid()));