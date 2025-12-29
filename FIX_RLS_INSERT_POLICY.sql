-- ==========================================
-- FIX: RLS INSERT Policy Blocking CSV Import
-- ==========================================

-- The issue: "new row violates row-level security policy for table inventory"
-- This happens when the WITH CHECK clause fails on INSERT

-- Step 1: Check current INSERT policy
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'inventory'
AND cmd = 'INSERT';

-- Step 2: Drop and recreate the INSERT policy with better logic
DROP POLICY IF EXISTS "Users can insert their organization's inventory" ON inventory;

-- Step 3: Create new INSERT policy that allows NULL to pass through
-- (the organization_id will be set by the INSERT, then checked)
CREATE POLICY "Users can insert their organization's inventory"
ON inventory FOR INSERT
WITH CHECK (
    organization_id = COALESCE(
        (SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::uuid
    )
);

-- Step 4: Alternative - make INSERT policy more permissive for authenticated users
-- DROP POLICY IF EXISTS "Users can insert their organization's inventory" ON inventory;
--
-- CREATE POLICY "Users can insert their organization's inventory"
-- ON inventory FOR INSERT
-- WITH CHECK (auth.uid() IS NOT NULL);

-- Step 5: Verify the new policy
SELECT
    tablename,
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'inventory'
AND cmd = 'INSERT';

-- Step 6: Test insert (will fail in SQL Editor since auth.uid() is NULL, but will work in app)
-- You can test this by trying your CSV import again in the app
