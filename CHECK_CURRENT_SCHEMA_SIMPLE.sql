-- Simple check - only query tables that exist

-- 1. List all your tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check organizations table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'organizations'
ORDER BY ordinal_position;

-- 3. Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Count existing data
SELECT
  (SELECT COUNT(*) FROM organizations) as org_count,
  (SELECT COUNT(*) FROM profiles) as profile_count;

-- 5. Show sample organizations
SELECT id, name, created_at
FROM organizations
LIMIT 5;

-- 6. Show sample profiles with their organization
SELECT p.id, p.email, p.full_name, p.organization_id, o.name as org_name
FROM profiles p
LEFT JOIN organizations o ON o.id = p.organization_id
LIMIT 5;
