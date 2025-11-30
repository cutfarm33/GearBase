# Multi-Tenancy Migration - Step by Step

## Important: Run Each Step Separately

Copy and paste each step one at a time into your Supabase SQL Editor.

---

## STEP 1: Create organizations table

```sql
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE organizations IS 'Organizations for multi-tenancy. Each user belongs to one organization.';
```

**Run this, then click "Run" in Supabase. Wait for success.**

---

## STEP 2: Add organization_id to profiles

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS profiles_organization_id_idx ON profiles(organization_id);
```

**Run this, then click "Run". Wait for success.**

---

## STEP 3a: Add organization_id to inventory_items

```sql
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS inventory_items_organization_id_idx ON inventory_items(organization_id);
```

**Run this, then click "Run". Wait for success.**

---

## STEP 3b: Add organization_id to jobs

```sql
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS jobs_organization_id_idx ON jobs(organization_id);
```

**Run this, then click "Run". Wait for success.**

---

## STEP 3c: Add organization_id to transactions

```sql
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS transactions_organization_id_idx ON transactions(organization_id);
```

**Run this, then click "Run". Wait for success.**

---

## STEP 3d: Add organization_id to kits (if table exists)

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kits') THEN
    ALTER TABLE kits
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS kits_organization_id_idx ON kits(organization_id);
  END IF;
END $$;
```

**Run this, then click "Run". Wait for success.**

---

## STEP 4: Get your user ID

First, find your user ID:

```sql
SELECT id, email FROM profiles;
```

**Copy your UUID from the results.** It looks like: `123e4567-e89b-12d3-a456-426614174000`

---

## STEP 5: Migrate your existing data

**IMPORTANT**: Replace `'YOUR_USER_ID_HERE'` below with your actual UUID from Step 4.

```sql
DO $$
DECLARE
  org_id UUID;
  admin_user_id UUID := 'YOUR_USER_ID_HERE'; -- REPLACE THIS!
BEGIN
  -- Create organization
  INSERT INTO organizations (name)
  VALUES ('My Organization')
  RETURNING id INTO org_id;

  -- Update your profile with organization
  UPDATE profiles SET organization_id = org_id WHERE id = admin_user_id;

  -- Update all existing data with this organization
  UPDATE inventory_items SET organization_id = org_id WHERE organization_id IS NULL;
  UPDATE jobs SET organization_id = org_id WHERE organization_id IS NULL;
  UPDATE transactions SET organization_id = org_id WHERE organization_id IS NULL;

  -- Update kits if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kits') THEN
    UPDATE kits SET organization_id = org_id WHERE organization_id IS NULL;
  END IF;

  RAISE NOTICE 'Migration completed! Organization ID: %', org_id;
END $$;
```

**Run this AFTER replacing YOUR_USER_ID_HERE. Wait for success.**

---

## STEP 6: Make organization_id required

```sql
ALTER TABLE profiles ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN organization_id SET NOT NULL;
```

**Run this, then click "Run". Wait for success.**

---

## STEP 7: Make organization_id required for kits (if exists)

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kits') THEN
    ALTER TABLE kits ALTER COLUMN organization_id SET NOT NULL;
  END IF;
END $$;
```

**Run this, then click "Run". Wait for success.**

---

## STEP 8: Enable Row Level Security

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

**Run this, then click "Run". Wait for success.**

---

## STEP 9: Enable RLS on kits (if exists)

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kits') THEN
    ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
```

**Run this, then click "Run". Wait for success.**

---

## STEP 10: Create RLS Policies for Organizations

```sql
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );
```

**Run this, then click "Run". Wait for success.**

---

## STEP 11: Create RLS Policies for Profiles

```sql
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
```

**Run this, then click "Run". Wait for success.**

---

## STEP 12: Create RLS Policies for Inventory Items

```sql
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
```

**Run this, then click "Run". Wait for success.**

---

## STEP 13: Create RLS Policies for Jobs

```sql
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
```

**Run this, then click "Run". Wait for success.**

---

## STEP 14: Create RLS Policies for Transactions

```sql
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
```

**Run this, then click "Run". Wait for success.**

---

## STEP 15: Create helper function

```sql
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Run this, then click "Run". Wait for success.**

---

## STEP 16: Create auto-set function

```sql
CREATE OR REPLACE FUNCTION set_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := get_user_organization_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Run this, then click "Run". Wait for success.**

---

## STEP 17: Create triggers for auto-setting organization_id

```sql
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

**Run this, then click "Run". Wait for success.**

---

## STEP 18: Verify everything worked

```sql
-- Check organizations
SELECT * FROM organizations;

-- Check your profile has organization_id
SELECT id, email, organization_id FROM profiles;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'inventory_items', 'jobs', 'transactions');

-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Run this to verify. All should return data.**

---

## ✅ Done!

Your database now has multi-tenancy! Each user will have their own isolated workspace.

## Next Steps

1. Deploy your code changes (already done in `SignupScreen.tsx` and `types.ts`)
2. Test by creating a new account
3. Verify new account has empty inventory

## Troubleshooting

If any step fails:
- Read the error message carefully
- Make sure you replaced `YOUR_USER_ID_HERE` in Step 5
- Check that tables exist before altering them
- You can re-run any step - they all use `IF NOT EXISTS` or `CREATE OR REPLACE`
