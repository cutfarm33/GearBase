-- Step-by-Step Migration (Run each section separately)

-- ==========================================
-- STEP 1: Check what you have
-- ==========================================
SELECT 'Current state:' as step;
SELECT COUNT(*) as profile_count FROM profiles;
SELECT COUNT(*) as org_count FROM organizations;

-- ==========================================
-- STEP 2: Create organization_members table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);

SELECT 'organization_members table created' as step;

-- ==========================================
-- STEP 3: Add active_organization_id to profiles
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'active_organization_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN active_organization_id UUID REFERENCES organizations(id);
  END IF;
END $$;

SELECT 'active_organization_id column added' as step;

-- ==========================================
-- STEP 4: Check profiles before migration
-- ==========================================
-- See how many profiles have organization_id
SELECT
  COUNT(*) as total_profiles,
  COUNT(organization_id) as profiles_with_org,
  COUNT(*) - COUNT(organization_id) as profiles_without_org
FROM profiles;

-- Show sample of what will be migrated
SELECT id, email, organization_id
FROM profiles
WHERE organization_id IS NOT NULL
LIMIT 5;

-- ==========================================
-- STEP 5: Migrate existing users to organization_members
-- ==========================================

-- First, let's do a safe insert with better error handling
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
  p.organization_id,
  p.id as user_id,
  'owner' as role
FROM profiles p
WHERE p.organization_id IS NOT NULL
  AND p.organization_id IN (SELECT id FROM organizations) -- Ensure org exists
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id) -- Ensure user exists
ON CONFLICT (organization_id, user_id) DO NOTHING; -- Skip if already exists

SELECT 'Migrated ' || COUNT(*) || ' users to organization_members' as step
FROM organization_members;

-- ==========================================
-- STEP 6: Set active_organization_id
-- ==========================================

UPDATE profiles
SET active_organization_id = organization_id
WHERE active_organization_id IS NULL
  AND organization_id IS NOT NULL;

SELECT 'Set active_organization_id for ' || COUNT(*) || ' profiles' as step
FROM profiles
WHERE active_organization_id IS NOT NULL;

-- ==========================================
-- STEP 7: Add subscription columns to organizations
-- ==========================================

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

SELECT 'Added subscription columns to organizations' as step;

-- ==========================================
-- STEP 8: Set owner_id in organizations
-- ==========================================

UPDATE organizations o
SET owner_id = (
  SELECT om.user_id
  FROM organization_members om
  WHERE om.organization_id = o.id
    AND om.role = 'owner'
  LIMIT 1
)
WHERE owner_id IS NULL;

SELECT 'Set owner_id for ' || COUNT(*) || ' organizations' as step
FROM organizations
WHERE owner_id IS NOT NULL;

-- ==========================================
-- STEP 9: Final verification
-- ==========================================

SELECT
  'Migration complete!' as status,
  (SELECT COUNT(*) FROM organizations) as total_orgs,
  (SELECT COUNT(*) FROM organization_members) as total_members,
  (SELECT COUNT(*) FROM profiles WHERE active_organization_id IS NOT NULL) as profiles_with_active_org;

-- Show sample of migrated data
SELECT
  p.email,
  o.name as org_name,
  om.role
FROM profiles p
JOIN organizations o ON o.id = p.active_organization_id
JOIN organization_members om ON om.user_id = p.id AND om.organization_id = o.id
LIMIT 10;
