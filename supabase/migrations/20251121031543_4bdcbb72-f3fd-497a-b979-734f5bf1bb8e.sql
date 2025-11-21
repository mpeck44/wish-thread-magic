-- Mark existing users with trips as profile_complete
UPDATE profiles 
SET profile_complete = true 
WHERE id IN (
  SELECT DISTINCT p.id 
  FROM profiles p
  JOIN families f ON f.creator_id = p.id
  JOIN trips t ON t.family_id = f.id
);