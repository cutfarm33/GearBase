-- ==========================================
-- ☠️  DO NOT RUN — DISARMED 2026-08-12
-- ==========================================
-- This script was run against production and is the direct cause of the
-- `rls_disabled_in_public` / `policy_exists_rls_disabled` ERROR advisories:
-- it disabled RLS AND dropped every policy on profiles, inventory, kits,
-- transactions and jobs, leaving them open to any anon API key.
--
-- Repair script: migrations/2026-08-12_fix_security_advisories.sql
--
-- The guard below aborts the script. If you genuinely need to disable RLS on a
-- local/branch database, delete the guard block — never on production.
-- ==========================================

DO $guard$
BEGIN
    RAISE EXCEPTION
      'DISABLE_RLS_TEMP.sql is disarmed. It removes all data isolation. See migrations/2026-08-12_fix_security_advisories.sql';
END
$guard$;

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
