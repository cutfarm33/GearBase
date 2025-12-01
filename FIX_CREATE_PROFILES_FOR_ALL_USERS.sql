-- ==========================================
-- FIX: Create Profiles for All Auth Users
-- ==========================================

-- This creates profile rows for any auth.users that don't have profiles yet
-- Run this in Supabase SQL Editor (uses service role, not user auth)

-- Step 1: See which users are missing profiles
SELECT
    u.id,
    u.email,
    u.created_at,
    CASE WHEN p.id IS NULL THEN '❌ MISSING PROFILE' ELSE '✅ HAS PROFILE' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 2: Create profiles for ALL users that don't have them
INSERT INTO profiles (id, email, full_name, role, plan, organization_id, theme)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as full_name,
    'admin' as role,
    'free' as plan,
    '00000000-0000-0000-0000-000000000000'::uuid as organization_id,
    'dark' as theme
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
)
RETURNING id, email, full_name, organization_id;

-- Step 3: Verify all users now have profiles
SELECT
    u.id,
    u.email as user_email,
    p.email as profile_email,
    p.full_name,
    p.role,
    p.organization_id,
    CASE WHEN p.id IS NULL THEN '❌ STILL MISSING' ELSE '✅ FIXED' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 4: Count profiles vs users
SELECT
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)) as users_missing_profiles;
