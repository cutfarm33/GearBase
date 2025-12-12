-- ==========================================
-- FIX ALL TABLES - ADD ORGANIZATION_ID
-- ==========================================
-- This script adds organization_id to ALL tables that need it
-- for multi-organization support. Run this in Supabase SQL Editor.
-- ==========================================

-- 1. ADD ORGANIZATION_ID TO INVENTORY TABLE
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'inventory' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE inventory ADD COLUMN organization_id UUID;
        RAISE NOTICE 'Added organization_id to inventory';
    ELSE
        RAISE NOTICE 'inventory already has organization_id';
    END IF;
END $$;

-- 2. ADD ORGANIZATION_ID TO KITS TABLE
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'kits' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE kits ADD COLUMN organization_id UUID;
        RAISE NOTICE 'Added organization_id to kits';
    ELSE
        RAISE NOTICE 'kits already has organization_id';
    END IF;
END $$;

-- 3. ADD ORGANIZATION_ID TO TRANSACTIONS TABLE
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE transactions ADD COLUMN organization_id UUID;
        RAISE NOTICE 'Added organization_id to transactions';
    ELSE
        RAISE NOTICE 'transactions already has organization_id';
    END IF;
END $$;

-- 4. ADD ORGANIZATION_ID TO JOBS TABLE (if not already there)
-- ==========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jobs' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE jobs ADD COLUMN organization_id UUID;
        RAISE NOTICE 'Added organization_id to jobs';
    ELSE
        RAISE NOTICE 'jobs already has organization_id';
    END IF;
END $$;

-- 5. SET DEFAULT ORG ID FOR EXISTING DATA
-- ==========================================
-- Update all NULL organization_ids to the default org
-- This ensures existing data is accessible

UPDATE inventory SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE kits SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE transactions SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE jobs SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;
UPDATE profiles SET organization_id = '00000000-0000-0000-0000-000000000000' WHERE organization_id IS NULL;

-- 6. ENABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES FOR INVENTORY
-- ==========================================

DROP POLICY IF EXISTS "Users can view inventory in their org" ON inventory;
DROP POLICY IF EXISTS "Users can insert inventory in their org" ON inventory;
DROP POLICY IF EXISTS "Users can update inventory in their org" ON inventory;
DROP POLICY IF EXISTS "Users can delete inventory in their org" ON inventory;

CREATE POLICY "Users can view inventory in their org"
ON inventory FOR SELECT
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can insert inventory in their org"
ON inventory FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can update inventory in their org"
ON inventory FOR UPDATE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can delete inventory in their org"
ON inventory FOR DELETE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

-- 8. CREATE RLS POLICIES FOR KITS
-- ==========================================

DROP POLICY IF EXISTS "Users can view kits in their org" ON kits;
DROP POLICY IF EXISTS "Users can insert kits in their org" ON kits;
DROP POLICY IF EXISTS "Users can update kits in their org" ON kits;
DROP POLICY IF EXISTS "Users can delete kits in their org" ON kits;

CREATE POLICY "Users can view kits in their org"
ON kits FOR SELECT
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can insert kits in their org"
ON kits FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can update kits in their org"
ON kits FOR UPDATE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can delete kits in their org"
ON kits FOR DELETE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

-- 9. CREATE RLS POLICIES FOR TRANSACTIONS
-- ==========================================

DROP POLICY IF EXISTS "Users can view transactions in their org" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions in their org" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions in their org" ON transactions;
DROP POLICY IF EXISTS "Users can delete transactions in their org" ON transactions;

CREATE POLICY "Users can view transactions in their org"
ON transactions FOR SELECT
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can insert transactions in their org"
ON transactions FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can update transactions in their org"
ON transactions FOR UPDATE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

CREATE POLICY "Users can delete transactions in their org"
ON transactions FOR DELETE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id IS NULL
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

-- 10. UPDATE PROFILES RLS TO ALLOW SELF-READ
-- ==========================================
-- This is critical for login to work - user must be able to read their own profile

DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can delete profiles in their org" ON profiles;

-- SELECT: Can view own profile OR profiles in same org
CREATE POLICY "Users can view profiles in their org"
ON profiles FOR SELECT
USING (
    id = auth.uid()  -- Can ALWAYS view own profile
    OR organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

-- INSERT: Can create own profile or profiles in same org
CREATE POLICY "Users can insert profiles in their org"
ON profiles FOR INSERT
WITH CHECK (
    id = auth.uid()  -- Can create own profile
    OR organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    OR organization_id = '00000000-0000-0000-0000-000000000000'
);

-- UPDATE: Can update own profile or profiles in same org
CREATE POLICY "Users can update profiles in their org"
ON profiles FOR UPDATE
USING (
    id = auth.uid()  -- Can always update own profile
    OR organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
);

-- DELETE: Can delete profiles in org (not self)
CREATE POLICY "Users can delete profiles in their org"
ON profiles FOR DELETE
USING (
    organization_id IN (
        SELECT COALESCE(active_organization_id, organization_id)
        FROM profiles
        WHERE id = auth.uid()
    )
    AND id != auth.uid()  -- Cannot delete yourself
);

-- 11. VERIFICATION
-- ==========================================

SELECT 'Migration completed!' as status;

-- Check columns exist
SELECT
    'inventory' as table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'organization_id') as has_org_id
UNION ALL
SELECT
    'kits',
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'kits' AND column_name = 'organization_id')
UNION ALL
SELECT
    'transactions',
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'organization_id')
UNION ALL
SELECT
    'jobs',
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'organization_id')
UNION ALL
SELECT
    'profiles',
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id');

-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('inventory', 'kits', 'transactions', 'jobs', 'profiles')
ORDER BY tablename, policyname;
