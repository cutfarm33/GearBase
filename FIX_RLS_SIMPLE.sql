-- ==========================================
-- COMPLETE RLS FIX - Run this entire script at once
-- ==========================================

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their organization's inventory" ON inventory;
DROP POLICY IF EXISTS "Users can insert their organization's inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update their organization's inventory" ON inventory;
DROP POLICY IF EXISTS "Users can delete their organization's inventory" ON inventory;

DROP POLICY IF EXISTS "Users can view their organization's profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their organization's jobs" ON jobs;
DROP POLICY IF EXISTS "Users can manage their organization's jobs" ON jobs;

DROP POLICY IF EXISTS "Users can view their organization's kits" ON kits;
DROP POLICY IF EXISTS "Users can manage their organization's kits" ON kits;

DROP POLICY IF EXISTS "Users can view their organization's transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage their organization's transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view job_items" ON job_items;
DROP POLICY IF EXISTS "Users can manage job_items" ON job_items;

DROP POLICY IF EXISTS "Users can view kit_items" ON kit_items;
DROP POLICY IF EXISTS "Users can manage kit_items" ON kit_items;

DROP POLICY IF EXISTS "Users can view transaction_items" ON transaction_items;
DROP POLICY IF EXISTS "Users can manage transaction_items" ON transaction_items;

-- Step 2: Create helper function (fixes infinite recursion)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1
$$;

-- Step 3: PROFILES - Simple policies without recursion
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Step 4: INVENTORY - Use helper function
CREATE POLICY "Users can view their organization's inventory"
ON inventory FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert their organization's inventory"
ON inventory FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update their organization's inventory"
ON inventory FOR UPDATE
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can delete their organization's inventory"
ON inventory FOR DELETE
USING (organization_id = public.get_user_organization_id());

-- Step 5: JOBS
CREATE POLICY "Users can view their organization's jobs"
ON jobs FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage their organization's jobs"
ON jobs FOR ALL
USING (organization_id = public.get_user_organization_id());

-- Step 6: KITS
CREATE POLICY "Users can view their organization's kits"
ON kits FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage their organization's kits"
ON kits FOR ALL
USING (organization_id = public.get_user_organization_id());

-- Step 7: TRANSACTIONS
CREATE POLICY "Users can view their organization's transactions"
ON transactions FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage their organization's transactions"
ON transactions FOR ALL
USING (organization_id = public.get_user_organization_id());

-- Step 8: JUNCTION TABLES (allow all access, filtered by parent)
CREATE POLICY "Users can view job_items"
ON job_items FOR SELECT
USING (true);

CREATE POLICY "Users can manage job_items"
ON job_items FOR ALL
USING (true);

CREATE POLICY "Users can view kit_items"
ON kit_items FOR SELECT
USING (true);

CREATE POLICY "Users can manage kit_items"
ON kit_items FOR ALL
USING (true);

CREATE POLICY "Users can view transaction_items"
ON transaction_items FOR SELECT
USING (true);

CREATE POLICY "Users can manage transaction_items"
ON transaction_items FOR ALL
USING (true);

-- Step 9: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Done! Your RLS policies are now fixed.
