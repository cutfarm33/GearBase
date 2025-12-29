# Fix RLS Policies - Infinite Recursion Error

## Problem
You're seeing this error: `infinite recursion detected in policy for relation "profiles"`

This happens when an RLS policy on the `profiles` table tries to SELECT from `profiles` itself, creating a circular dependency.

## Solution

Go to your Supabase Dashboard → SQL Editor → New Query, and run these commands:

### Step 1: Drop Existing Problematic Policies

```sql
-- Drop all existing policies on all tables
DROP POLICY IF EXISTS "Users can view their organization's inventory" ON inventory;
DROP POLICY IF EXISTS "Users can insert their organization's inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update their organization's inventory" ON inventory;
DROP POLICY IF EXISTS "Users can delete their organization's inventory" ON inventory;

DROP POLICY IF EXISTS "Users can view their organization's profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their organization's jobs" ON jobs;
DROP POLICY IF EXISTS "Users can manage their organization's jobs" ON jobs;

DROP POLICY IF EXISTS "Users can view their organization's kits" ON kits;
DROP POLICY IF EXISTS "Users can manage their organization's kits" ON kits;

DROP POLICY IF EXISTS "Users can view their organization's transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage their organization's transactions" ON transactions;
```

### Step 2: Create Correct RLS Policies

```sql
-- ==========================================
-- PROFILES TABLE POLICIES (Fix Infinite Recursion)
-- ==========================================

-- Allow users to view their own profile (no recursion)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ==========================================
-- INVENTORY TABLE POLICIES
-- ==========================================

-- First, create a helper function to get user's organization_id
-- Note: Must be in public schema, not auth schema (permission denied)
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1
$$;

-- Allow users to view inventory from their organization
CREATE POLICY "Users can view their organization's inventory"
ON inventory FOR SELECT
USING (organization_id = public.get_user_organization_id());

-- Allow users to insert inventory for their organization
CREATE POLICY "Users can insert their organization's inventory"
ON inventory FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id());

-- Allow users to update inventory in their organization
CREATE POLICY "Users can update their organization's inventory"
ON inventory FOR UPDATE
USING (organization_id = public.get_user_organization_id());

-- Allow users to delete inventory from their organization
CREATE POLICY "Users can delete their organization's inventory"
ON inventory FOR DELETE
USING (organization_id = public.get_user_organization_id());

-- ==========================================
-- JOBS TABLE POLICIES
-- ==========================================

CREATE POLICY "Users can view their organization's jobs"
ON jobs FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage their organization's jobs"
ON jobs FOR ALL
USING (organization_id = public.get_user_organization_id());

-- ==========================================
-- KITS TABLE POLICIES
-- ==========================================

CREATE POLICY "Users can view their organization's kits"
ON kits FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage their organization's kits"
ON kits FOR ALL
USING (organization_id = public.get_user_organization_id());

-- ==========================================
-- TRANSACTIONS TABLE POLICIES
-- ==========================================

CREATE POLICY "Users can view their organization's transactions"
ON transactions FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage their organization's transactions"
ON transactions FOR ALL
USING (organization_id = public.get_user_organization_id());

-- ==========================================
-- JUNCTION TABLES (job_items, kit_items, transaction_items)
-- ==========================================

-- These don't need organization_id since they're filtered by parent table
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
```

### Step 3: Verify RLS is Enabled

```sql
-- Make sure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
```

### Step 4: Test the Fix

Run this query to verify your user can see their profile:

```sql
SELECT id, email, full_name, organization_id
FROM profiles
WHERE id = auth.uid();
```

If this works, try refreshing your app. The data should now load correctly!

## Why This Fixes the Problem

The original policy was doing something like:

```sql
-- BAD - Causes infinite recursion
CREATE POLICY "..." ON profiles
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
```

This creates a loop: to check if you can SELECT from profiles, it needs to SELECT from profiles!

The fix:
1. The profiles policy now only uses `auth.uid()` directly (no recursion)
2. We created a helper function `auth.user_organization_id()` that other tables can use
3. This function only runs ONCE per query, avoiding recursion

## After Running These Commands

1. Refresh your application
2. Try importing your CSV again
3. The items should now appear in your inventory!
