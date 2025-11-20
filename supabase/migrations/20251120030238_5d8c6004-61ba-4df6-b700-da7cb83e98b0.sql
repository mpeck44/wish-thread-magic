-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view families they created or are members of" ON public.families;
DROP POLICY IF EXISTS "Users can add members to their families" ON public.family_members;
DROP POLICY IF EXISTS "Users can delete members from their families" ON public.family_members;
DROP POLICY IF EXISTS "Users can update members in their families" ON public.family_members;
DROP POLICY IF EXISTS "Users can view family members of their families" ON public.family_members;

-- Create security definer function to check family access
CREATE OR REPLACE FUNCTION public.user_has_family_access(_family_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.families f
    WHERE f.id = _family_id
      AND f.creator_id IN (
        SELECT p.id FROM public.profiles p WHERE p.user_id = _user_id
      )
  );
$$;

-- Create security definer function to get user's profile id
CREATE OR REPLACE FUNCTION public.get_user_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- Recreate families SELECT policy using the function
CREATE POLICY "Users can view their families"
ON public.families
FOR SELECT
TO authenticated
USING (public.user_has_family_access(id, auth.uid()));

-- Recreate family_members policies using the function
CREATE POLICY "Users can view family members"
ON public.family_members
FOR SELECT
TO authenticated
USING (public.user_has_family_access(family_id, auth.uid()));

CREATE POLICY "Users can add family members"
ON public.family_members
FOR INSERT
TO authenticated
WITH CHECK (public.user_has_family_access(family_id, auth.uid()));

CREATE POLICY "Users can update family members"
ON public.family_members
FOR UPDATE
TO authenticated
USING (public.user_has_family_access(family_id, auth.uid()));

CREATE POLICY "Users can delete family members"
ON public.family_members
FOR DELETE
TO authenticated
USING (public.user_has_family_access(family_id, auth.uid()));