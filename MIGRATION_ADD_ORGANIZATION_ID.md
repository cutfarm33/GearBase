# Migration: Add organization_id to All Tables

This migration adds the `organization_id` column to all tables that need it for multi-tenancy support.

## Run these SQL commands in Supabase SQL Editor

Go to your Supabase project → SQL Editor → New Query, then paste and run:

```sql
-- Add organization_id column to inventory table
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Add organization_id column to profiles table (if not exists)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Add organization_id column to jobs table (if not exists)
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Add organization_id column to kits table (if not exists)
ALTER TABLE kits
ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Add organization_id column to transactions table (if not exists)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Update existing NULL values to default organization
UPDATE inventory SET organization_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE organization_id IS NULL;
UPDATE profiles SET organization_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE organization_id IS NULL;
UPDATE jobs SET organization_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE organization_id IS NULL;
UPDATE kits SET organization_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE organization_id IS NULL;
UPDATE transactions SET organization_id = '00000000-0000-0000-0000-000000000000'::uuid WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after setting defaults
ALTER TABLE inventory ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE kits ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN organization_id SET NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_organization ON inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_organization ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_kits_organization ON kits(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_organization ON transactions(organization_id);
```

## After Running Migration

1. The columns will be added to all tables
2. Existing data will be assigned to the default organization
3. Future inserts will require organization_id
4. Your CSV imports should now work correctly

## Verification

Run this query to verify the columns were added:

```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'organization_id'
ORDER BY table_name;
```

You should see `organization_id` listed for: inventory, profiles, jobs, kits, and transactions.
