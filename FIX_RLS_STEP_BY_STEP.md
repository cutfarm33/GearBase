# Fix RLS Policies - Step by Step Approach

If the single SQL script fails, run these commands ONE AT A TIME in Supabase SQL Editor.

## Step 1: Drop Existing Policies (Run Each Line Separately if Needed)

```sql
DROP POLICY IF EXISTS "Users can view their organization's inventory" ON inventory;
```

```sql
DROP POLICY IF EXISTS "Users can insert their organization's inventory" ON inventory;
```

```sql
DROP POLICY IF EXISTS "Users can update their organization's inventory" ON inventory;
```

```sql
DROP POLICY IF EXISTS "Users can delete their organization's inventory" ON inventory;
```

```sql
DROP POLICY IF EXISTS "Users can view their organization's profiles" ON profiles;
```

```sql
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
```

```sql
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
```

```sql
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
```

```sql
DROP POLICY IF EXISTS "Users can view their organization's jobs" ON jobs;
```

```sql
DROP POLICY IF EXISTS "Users can manage their organization's jobs" ON jobs;
```

```sql
DROP POLICY IF EXISTS "Users can view their organization's kits" ON kits;
```

```sql
DROP POLICY IF EXISTS "Users can manage their organization's kits" ON kits;
```

```sql
DROP POLICY IF EXISTS "Users can view their organization's transactions" ON transactions;
```

```sql
DROP POLICY IF EXISTS "Users can manage their organization's transactions" ON transactions;
```

```sql
DROP POLICY IF EXISTS "Users can view job_items" ON job_items;
```

```sql
DROP POLICY IF EXISTS "Users can manage job_items" ON job_items;
```

```sql
DROP POLICY IF EXISTS "Users can view kit_items" ON kit_items;
```

```sql
DROP POLICY IF EXISTS "Users can manage kit_items" ON kit_items;
```

```sql
DROP POLICY IF EXISTS "Users can view transaction_items" ON transaction_items;
```

```sql
DROP POLICY IF EXISTS "Users can manage transaction_items" ON transaction_items;
```

## Step 2: Create Helper Function

```sql
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1
$$;
```

## Step 3: Create Profiles Policies

```sql
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

```sql
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

```sql
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

## Step 4: Create Inventory Policies

```sql
CREATE POLICY "Users can view their organization's inventory"
ON inventory FOR SELECT
USING (organization_id = public.get_user_organization_id());
```

```sql
CREATE POLICY "Users can insert their organization's inventory"
ON inventory FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id());
```

```sql
CREATE POLICY "Users can update their organization's inventory"
ON inventory FOR UPDATE
USING (organization_id = public.get_user_organization_id());
```

```sql
CREATE POLICY "Users can delete their organization's inventory"
ON inventory FOR DELETE
USING (organization_id = public.get_user_organization_id());
```

## Step 5: Create Jobs Policies

```sql
CREATE POLICY "Users can view their organization's jobs"
ON jobs FOR SELECT
USING (organization_id = public.get_user_organization_id());
```

```sql
CREATE POLICY "Users can manage their organization's jobs"
ON jobs FOR ALL
USING (organization_id = public.get_user_organization_id());
```

## Step 6: Create Kits Policies

```sql
CREATE POLICY "Users can view their organization's kits"
ON kits FOR SELECT
USING (organization_id = public.get_user_organization_id());
```

```sql
CREATE POLICY "Users can manage their organization's kits"
ON kits FOR ALL
USING (organization_id = public.get_user_organization_id());
```

## Step 7: Create Transactions Policies

```sql
CREATE POLICY "Users can view their organization's transactions"
ON transactions FOR SELECT
USING (organization_id = public.get_user_organization_id());
```

```sql
CREATE POLICY "Users can manage their organization's transactions"
ON transactions FOR ALL
USING (organization_id = public.get_user_organization_id());
```

## Step 8: Create Junction Table Policies

```sql
CREATE POLICY "Users can view job_items"
ON job_items FOR SELECT
USING (true);
```

```sql
CREATE POLICY "Users can manage job_items"
ON job_items FOR ALL
USING (true);
```

```sql
CREATE POLICY "Users can view kit_items"
ON kit_items FOR SELECT
USING (true);
```

```sql
CREATE POLICY "Users can manage kit_items"
ON kit_items FOR ALL
USING (true);
```

```sql
CREATE POLICY "Users can view transaction_items"
ON transaction_items FOR SELECT
USING (true);
```

```sql
CREATE POLICY "Users can manage transaction_items"
ON transaction_items FOR ALL
USING (true);
```

## Step 9: Enable RLS on All Tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
```

## Verification

After running all commands, verify it worked:

```sql
SELECT id, email, full_name, organization_id
FROM profiles
WHERE id = auth.uid();
```

If this returns your profile, the fix worked! Refresh your app and try importing CSV again.
