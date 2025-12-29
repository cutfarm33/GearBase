-- ==========================================
-- FIX: Create Missing Profile for Current User
-- ==========================================

-- This query creates a profile row for your current authenticated user
-- Run this if you get "No rows returned" when checking your profile

-- Step 1: Check what your auth user ID is
SELECT auth.uid() as your_user_id;

-- Step 2: Check if you already have a profile (should return nothing currently)
SELECT * FROM profiles WHERE id = auth.uid();

-- Step 3: Check your email from auth.users
SELECT id, email FROM auth.users WHERE id = auth.uid();

-- Step 4: Create your missing profile
-- IMPORTANT: Replace 'YOUR_EMAIL_HERE' with your actual email from Step 3
-- Or use the query below which will auto-populate from auth.users

INSERT INTO profiles (id, email, full_name, role, plan, organization_id, theme)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    'admin' as role,
    'free' as plan,
    '00000000-0000-0000-0000-000000000000'::uuid as organization_id,
    'dark' as theme
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify it worked
SELECT id, email, full_name, role, organization_id
FROM profiles
WHERE id = auth.uid();

-- You should now see your profile!
