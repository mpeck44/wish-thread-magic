-- Create a helper function to create a family and its members in one secure call
CREATE OR REPLACE FUNCTION public.create_family_with_members(
  _name text,
  _members jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_family_id uuid;
  v_member jsonb;
BEGIN
  -- Ensure the caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get the current user's profile id
  v_profile_id := public.get_user_profile_id(auth.uid());
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user';
  END IF;

  -- Create the family owned by this profile
  INSERT INTO public.families (name, creator_id)
  VALUES (COALESCE(_name, 'My Family'), v_profile_id)
  RETURNING id INTO v_family_id;

  -- Optionally add family members
  IF _members IS NOT NULL THEN
    FOR v_member IN SELECT * FROM jsonb_array_elements(_members)
    LOOP
      INSERT INTO public.family_members (family_id, name, age, vibes, is_child)
      VALUES (
        v_family_id,
        COALESCE(v_member->>'name', 'Unknown'),
        NULLIF(v_member->>'age', '')::int,
        CASE
          WHEN v_member ? 'vibes' THEN
            COALESCE(ARRAY(SELECT jsonb_array_elements_text(v_member->'vibes')), '{}')::text[]
          ELSE NULL
        END,
        CASE
          WHEN NULLIF(v_member->>'age', '') IS NULL THEN NULL
          ELSE (NULLIF(v_member->>'age', '')::int < 18)
        END
      );
    END LOOP;
  END IF;

  RETURN v_family_id;
END;
$$;