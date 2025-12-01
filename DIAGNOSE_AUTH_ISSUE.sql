-- ==========================================
-- DIAGNOSE: Why Can't We Find Your User?
-- ==========================================

-- Step 1: Check if you're actually authenticated
SELECT
    auth.uid() as current_user_id,
    auth.jwt() as jwt_info;

-- Step 2: List ALL users in auth.users (shows everyone)
SELECT id, email, created_at, confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: List ALL profiles (shows everyone)
SELECT id, email, full_name, organization_id
FROM profiles
ORDER BY id
LIMIT 10;

-- Step 4: Try to manually insert a profile for a specific user
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with the ID from Step 2
-- Example: INSERT INTO profiles (id, email, full_name, role, plan, organization_id, theme)
-- VALUES ('abc123-...', 'your@email.com', 'Your Name', 'admin', 'free', '00000000-0000-0000-0000-000000000000', 'dark');

-- Step 5: Alternative - Create profile for FIRST user in auth.users if no profile exists
INSERT INTO profiles (id, email, full_name, role, plan, organization_id, theme)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email) as full_name,
    'admin' as role,
    'free' as plan,
    '00000000-0000-0000-0000-000000000000'::uuid as organization_id,
    'dark' as theme
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
ORDER BY u.created_at DESC
LIMIT 1
RETURNING *;

-- Step 6: Verify all users have profiles now
SELECT
    u.id,
    u.email as auth_email,
    p.email as profile_email,
    p.full_name,
    p.organization_id,
    CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
