# Multi-Tenancy Migration Guide

## Problem
Currently, all users share the same database tables. When a new user signs up, they see YOUR inventory, jobs, and transactions. Every user needs their own isolated workspace (organization).

## Solution: Organization-Based Multi-Tenancy

Each user gets their own "organization" when they sign up. All data (inventory, jobs, transactions, etc.) is scoped to that organization using Row Level Security (RLS).

## Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- ============================================
-- STEP 1: Create organizations table
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE organizations IS 'Organizations for multi-tenancy. Each user belongs to one organization.';

-- ============================================
-- STEP 2: Add organization_id to profiles
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS profiles_organization_id_idx ON profiles(organization_id);

-- ============================================
-- STEP 3: Add organization_id to all data tables
-- ============================================

-- Inventory items
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS inventory_items_organization_id_idx ON inventory_items(organization_id);

-- Jobs
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS jobs_organization_id_idx ON jobs(organization_id);

-- Transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS transactions_organization_id_idx ON transactions(organization_id);

-- Kits/Packages (if you have this table)
ALTER TABLE IF EXISTS kits
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS kits_organization_id_idx ON kits(organization_id);

-- ============================================
-- STEP 4: Migrate existing data (YOUR data)
-- ============================================

-- Create an organization for your existing data
INSERT INTO organizations (name) VALUES ('My Organization')
RETURNING id;

-- IMPORTANT: Replace 'YOUR_ORG_ID_HERE' with the UUID returned above
-- Also replace 'YOUR_USER_ID' with your actual user ID from the profiles table

DO $$
DECLARE
  org_id UUID;
  admin_user_id UUID := 'YOUR_USER_ID'; -- Replace with your actual user ID
BEGIN
  -- Get or create organization
  INSERT INTO organizations (name)
  VALUES ('My Organization')
  ON CONFLICT DO NOTHING
  RETURNING id INTO org_id;

  -- If already exists, get the id
  IF org_id IS NULL THEN
    SELECT id INTO org_id FROM organizations WHERE name = 'My Organization' LIMIT 1;
  END IF;

  -- Update admin user's profile with organization
  UPDATE profiles SET organization_id = org_id WHERE id = admin_user_id;

  -- Update all existing data with this organization
  UPDATE inventory_items SET organization_id = org_id WHERE organization_id IS NULL;
  UPDATE jobs SET organization_id = org_id WHERE organization_id IS NULL;
  UPDATE transactions SET organization_id = org_id WHERE organization_id IS NULL;
  UPDATE kits SET organization_id = org_id WHERE organization_id IS NULL AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kits');
END $$;

-- ============================================
-- STEP 5: Make organization_id required
-- ============================================

-- After migrating existing data, make the column required
ALTER TABLE profiles ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN organization_id SET NOT NULL;
-- ALTER TABLE kits ALTER COLUMN organization_id SET NOT NULL; -- Uncomment if you have kits table

-- ============================================
-- STEP 6: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE kits ENABLE ROW LEVEL SECURITY; -- Uncomment if you have kits table

-- ============================================
-- STEP 7: Create RLS Policies
-- ============================================

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Profiles: Users can see profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Inventory Items: Full CRUD for organization members
CREATE POLICY "Users can view inventory in their organization"
  ON inventory_items FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert inventory in their organization"
  ON inventory_items FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update inventory in their organization"
  ON inventory_items FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete inventory in their organization"
  ON inventory_items FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Jobs: Full CRUD for organization members
CREATE POLICY "Users can view jobs in their organization"
  ON jobs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert jobs in their organization"
  ON jobs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update jobs in their organization"
  ON jobs FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete jobs in their organization"
  ON jobs FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Transactions: Full CRUD for organization members
CREATE POLICY "Users can view transactions in their organization"
  ON transactions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transactions in their organization"
  ON transactions FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions in their organization"
  ON transactions FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions in their organization"
  ON transactions FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================
-- STEP 8: Create helper function to get user's organization
-- ============================================

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 9: Create trigger to auto-set organization_id
-- ============================================

-- Function to automatically set organization_id on insert
CREATE OR REPLACE FUNCTION set_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := get_user_organization_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-set organization_id
CREATE TRIGGER set_inventory_organization
  BEFORE INSERT ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_job_organization
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id();

CREATE TRIGGER set_transaction_organization
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id();

```

## Important Notes

### Before Running

1. **Backup your database** - This is critical!
2. **Replace placeholders**:
   - Find your user ID: `SELECT id FROM profiles WHERE email = 'your@email.com';`
   - Replace `YOUR_USER_ID` in the migration script

### After Running

1. All your existing data will be in "My Organization"
2. New users will get their own organization automatically
3. Row Level Security will prevent users from seeing each other's data
4. All inserts will automatically include the user's organization_id

## Testing

After migration:

1. Your existing data should still work
2. Create a new test account - should have empty inventory/jobs
3. Try to access data across organizations - should be blocked by RLS
4. Check that new items/jobs automatically get organization_id

## Rollback (Emergency Only)

If something goes wrong:

```sql
-- Disable RLS
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
-- ... drop all other policies

-- Remove organization columns (destructive!)
ALTER TABLE profiles DROP COLUMN IF EXISTS organization_id;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS organization_id;
ALTER TABLE jobs DROP COLUMN IF EXISTS organization_id;
ALTER TABLE transactions DROP COLUMN IF EXISTS organization_id;

-- Drop organizations table
DROP TABLE IF EXISTS organizations;
```

## Next Steps

After running the migration:

1. Update TypeScript types (next document)
2. Update signup flow to create organization
3. Update all queries to use organization context
4. Test thoroughly!
