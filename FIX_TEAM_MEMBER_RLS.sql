-- ==========================================
-- FIX TEAM MEMBER CREATION RLS POLICIES
-- ==========================================
-- Run this in Supabase SQL Editor to allow
-- team member creation without foreign key issues
-- ==========================================

-- 1. REMOVE FOREIGN KEY CONSTRAINT ON PROFILES
-- This allows creating "offline" profiles that don't link to auth.users
-- ==========================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. ALLOW ANY ROLE VALUE
-- Remove the check constraint that limits role values
-- ==========================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. UPDATE RLS POLICIES FOR PROFILES TABLE
-- Allow authenticated users to insert profiles in their organization
-- ==========================================

-- First, enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate)
DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can delete profiles in their org" ON profiles;

-- SELECT: Users can view all profiles in their organization
CREATE POLICY "Users can view profiles in their org"
ON profiles FOR SELECT
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

-- INSERT: Users can add team members to their organization
CREATE POLICY "Users can insert profiles in their org"
ON profiles FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id = '00000000-0000-0000-0000-000000000000'
    OR id = auth.uid() -- Allow creating own profile on signup
);

-- UPDATE: Users can update profiles in their organization
CREATE POLICY "Users can update profiles in their org"
ON profiles FOR UPDATE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR id = auth.uid() -- Can always update own profile
);

-- DELETE: Users can delete profiles in their organization (not themselves)
CREATE POLICY "Users can delete profiles in their org"
ON profiles FOR DELETE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    AND id != auth.uid() -- Can't delete yourself
);

-- 4. ENSURE JOBS TABLE HAS ORGANIZATION_ID
-- ==========================================

-- Add organization_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jobs' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE jobs ADD COLUMN organization_id UUID;
    END IF;
END $$;

-- Update RLS for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view jobs in their org" ON jobs;
DROP POLICY IF EXISTS "Users can insert jobs in their org" ON jobs;
DROP POLICY IF EXISTS "Users can update jobs in their org" ON jobs;
DROP POLICY IF EXISTS "Users can delete jobs in their org" ON jobs;

CREATE POLICY "Users can view jobs in their org"
ON jobs FOR SELECT
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can insert jobs in their org"
ON jobs FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can update jobs in their org"
ON jobs FOR UPDATE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can delete jobs in their org"
ON jobs FOR DELETE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

-- ==========================================
-- 5. VERIFICATION
-- ==========================================

SELECT 'RLS policies updated successfully' as status;

-- Check profiles policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Check jobs policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'jobs';
