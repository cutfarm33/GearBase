-- ==========================================
-- SIMPLE FIX FOR LOGIN ISSUES
-- ==========================================
-- Run this in Supabase SQL Editor
-- ==========================================

-- STEP 1: Add organization_id columns to all tables that need them
-- ==========================================

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE kits ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS organization_id UUID;

-- STEP 2: Set default org ID for all existing data
-- ==========================================

UPDATE inventory SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE kits SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE transactions SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE jobs SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE profiles SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;

-- STEP 3: Temporarily DISABLE RLS to fix policies
-- ==========================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE kits DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- STEP 4: Drop ALL existing policies
-- ==========================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('profiles', 'inventory', 'kits', 'transactions', 'jobs'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- STEP 5: Create simple, permissive policies
-- ==========================================

-- PROFILES: Authenticated users can do everything
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated USING (id != auth.uid());

-- INVENTORY: Authenticated users can do everything
CREATE POLICY "inventory_select" ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "inventory_insert" ON inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "inventory_update" ON inventory FOR UPDATE TO authenticated USING (true);
CREATE POLICY "inventory_delete" ON inventory FOR DELETE TO authenticated USING (true);

-- KITS: Authenticated users can do everything
CREATE POLICY "kits_select" ON kits FOR SELECT TO authenticated USING (true);
CREATE POLICY "kits_insert" ON kits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "kits_update" ON kits FOR UPDATE TO authenticated USING (true);
CREATE POLICY "kits_delete" ON kits FOR DELETE TO authenticated USING (true);

-- TRANSACTIONS: Authenticated users can do everything
CREATE POLICY "transactions_select" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "transactions_update" ON transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE TO authenticated USING (true);

-- JOBS: Authenticated users can do everything
CREATE POLICY "jobs_select" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "jobs_insert" ON jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "jobs_update" ON jobs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "jobs_delete" ON jobs FOR DELETE TO authenticated USING (true);

-- STEP 6: Re-enable RLS
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- STEP 7: Verify
-- ==========================================

SELECT 'Done! All tables now have organization_id and simple RLS policies.' as status;

SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'inventory', 'kits', 'transactions', 'jobs')
ORDER BY tablename;
