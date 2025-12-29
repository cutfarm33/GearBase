-- ==========================================
-- EMERGENCY: DISABLE ALL RLS FOR TESTING
-- ==========================================
-- Run this to temporarily disable RLS and test login
-- WARNING: This removes security - only use for testing!
-- ==========================================

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE kits DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('profiles', 'inventory', 'kits', 'transactions', 'jobs'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'inventory', 'kits', 'transactions', 'jobs');

SELECT 'RLS DISABLED - Try logging in now!' as status;
