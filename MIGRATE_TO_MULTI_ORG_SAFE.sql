-- Safe Migration: Add Multi-Organization Support
-- This checks for existing tables/columns before creating them

-- ==========================================
-- 1. CREATE ORGANIZATIONS TABLE (if not exists)
-- ==========================================

-- Organizations table likely already exists, so let's just ensure it has the right columns
DO $$
BEGIN
  -- Add subscription_tier if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE organizations ADD COLUMN subscription_tier TEXT DEFAULT 'free';
  END IF;

  -- Add subscription_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE organizations ADD COLUMN subscription_status TEXT DEFAULT 'active';
  END IF;

  -- Add owner_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE organizations ADD COLUMN owner_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- ==========================================
-- 2. CREATE ORGANIZATION_MEMBERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);

-- ==========================================
-- 3. UPDATE PROFILES TABLE
-- ==========================================

DO $$
BEGIN
  -- Add active_organization_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'active_organization_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN active_organization_id UUID REFERENCES organizations(id);
  END IF;
END $$;

-- ==========================================
-- 4. MIGRATE EXISTING DATA
-- ==========================================

-- For each existing user profile with an organization_id:
-- 1. Create an entry in organization_members
-- 2. Set them as 'owner' of that organization
-- 3. Set active_organization_id to their current organization

INSERT INTO organization_members (organization_id, user_id, role)
SELECT DISTINCT
  p.organization_id,
  p.id as user_id,
  'owner' as role
FROM profiles p
WHERE p.organization_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id) -- Skip orphaned profiles
  AND NOT EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = p.organization_id
      AND om.user_id = p.id
  );

-- Update active_organization_id to match their current organization_id
UPDATE profiles
SET active_organization_id = organization_id
WHERE active_organization_id IS NULL
  AND organization_id IS NOT NULL;

-- Update organizations to set owner_id
UPDATE organizations o
SET owner_id = (
  SELECT om.user_id
  FROM organization_members om
  WHERE om.organization_id = o.id
    AND om.role = 'owner'
  LIMIT 1
)
WHERE owner_id IS NULL;

-- ==========================================
-- 5. VERIFICATION QUERIES
-- ==========================================

-- Check the results
SELECT
  (SELECT COUNT(*) FROM organizations) as total_orgs,
  (SELECT COUNT(*) FROM organization_members) as total_members,
  (SELECT COUNT(*) FROM profiles WHERE active_organization_id IS NOT NULL) as profiles_with_active_org;

-- Show sample data
SELECT
  p.email,
  p.organization_id as old_org_id,
  p.active_organization_id,
  o.name as org_name,
  om.role
FROM profiles p
LEFT JOIN organizations o ON o.id = p.active_organization_id
LEFT JOIN organization_members om ON om.user_id = p.id AND om.organization_id = p.active_organization_id
LIMIT 10;
