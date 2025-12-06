-- Run this in Supabase SQL Editor to check your current schema

-- 1. Check what tables exist
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

-- 3. Check if organization_members table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'organization_members'
ORDER BY ordinal_position;

-- 4. Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Check current data (safely)
SELECT
  (SELECT COUNT(*) FROM organizations) as org_count,
  (SELECT COUNT(*)
   FROM organization_members
   WHERE EXISTS (
     SELECT FROM information_schema.tables
     WHERE table_name = 'organization_members'
   )) as member_count,
  (SELECT COUNT(*) FROM profiles) as profile_count;
