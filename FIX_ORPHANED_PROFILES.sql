-- Fix: Remove orphaned profiles (profiles without corresponding auth users)

-- 1. First, let's see how many orphaned profiles we have
SELECT
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = p.id) THEN 1 END) as valid_profiles,
  COUNT(CASE WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p.id) THEN 1 END) as orphaned_profiles
FROM profiles p;

-- 2. Show the orphaned profiles
SELECT p.id, p.email, p.full_name
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = p.id
);

-- 3. Delete orphaned profiles (CAREFUL - this will delete data!)
-- Uncomment the line below ONLY if you're sure you want to delete these profiles
-- DELETE FROM profiles WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = profiles.id);

-- 4. Verify after deletion
-- SELECT COUNT(*) as remaining_profiles FROM profiles;
