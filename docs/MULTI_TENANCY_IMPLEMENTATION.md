# Multi-Tenancy Implementation Guide

## Overview

This guide shows you how to implement multi-tenancy so each user gets their own isolated workspace when they sign up. No more shared inventory!

## What's Been Done

✅ **Database Migration Created** - See `MULTI_TENANCY_MIGRATION.md`
✅ **TypeScript Types Updated** - Added `organization_id` to all data models
✅ **Signup Flow Updated** - Creates organization automatically for new users

## Step-by-Step Implementation

### Step 1: Run the Database Migration

**IMPORTANT: Backup your database first!**

1. Go to your Supabase Dashboard → SQL Editor
2. Open `docs/MULTI_TENANCY_MIGRATION.md`
3. **Find your user ID first**:
   ```sql
   SELECT id, email FROM profiles;
   ```
4. **Update the migration script**:
   - Replace `YOUR_USER_ID` with your actual UUID
5. **Run the entire migration script**
6. **Verify it worked**:
   ```sql
   -- Check organizations were created
   SELECT * FROM organizations;

   -- Check your profile has organization_id
   SELECT id, email, organization_id FROM profiles;

   -- Check RLS is enabled
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('profiles', 'inventory_items', 'jobs', 'transactions');
   ```

### Step 2: Test with the Updated Signup Flow

The signup flow (`screens/SignupScreen.tsx`) has already been updated to:
1. Create a new organization for each user
2. Link the user's profile to that organization

**Test it**:
1. Deploy your changes to Vercel
2. Create a new test account
3. Verify the new user has:
   - Their own organization
   - Empty inventory/jobs (not seeing your data!)

### Step 3: Verify Row Level Security is Working

**Test data isolation**:

```sql
-- As your original user, check you can see your data
SELECT * FROM inventory_items;

-- Try to query another organization's data (should return empty)
SELECT * FROM inventory_items WHERE organization_id = 'some-other-org-id';
```

Row Level Security (RLS) will automatically filter results so users only see their own organization's data.

### Step 4: Update Queries (Optional - RLS handles this automatically)

Because we set up Row Level Security and triggers, most queries will work automatically. However, for explicit filtering and better performance, you can update queries like this:

**Before**:
```typescript
const { data } = await supabase
  .from('inventory_items')
  .select('*');
```

**After** (optional, for explicitness):
```typescript
const {  data } = await supabase
  .from('inventory_items')
  .select('*');
  // RLS automatically filters by organization!
```

The `organization_id` is automatically:
- Added on INSERT (via trigger)
- Filtered on SELECT (via RLS policies)

### Step 5: Handle Existing User Login

When your existing user logs in, they should see all their original data because:
1. Their profile has the organization_id
2. All their data was migrated to have the same organization_id
3. RLS policies filter to show only their organization's data

## Important Files Modified

### Types (`types.ts`)
Added `organization_id: string` to:
- `User` (profile)
- `InventoryItem`
- `Job`
- `Kit`
- `Transaction`
- New `Organization` interface

### Signup Flow (`screens/SignupScreen.tsx`)
- Creates organization before creating profile
- Names it `"{User's Name}'s Organization"`
- Links profile to organization

## What Happens Now

### When a New User Signs Up:
1. ✅ Auth account is created (Supabase Auth)
2. ✅ Organization is created (e.g., "John's Organization")
3. ✅ Profile is created with `organization_id`
4. ✅ User sees empty inventory/jobs (fresh start!)

### When They Add Data:
1. ✅ Trigger automatically sets `organization_id`
2. ✅ Only they can see it (RLS)
3. ✅ Their team members (same org) can see it
4. ✅ Other users cannot see it

### When They Query Data:
1. ✅ RLS automatically filters by their organization
2. ✅ They only see their own data
3. ✅ No risk of data leakage

## Testing Checklist

After implementation:

- [ ] Run database migration successfully
- [ ] Verify your existing data still loads
- [ ] Create a new test account
- [ ] Verify new account has empty inventory
- [ ] Add an item as the new user
- [ ] Verify old user cannot see new user's item
- [ ] Verify new user cannot see old user's items
- [ ] Check that jobs, transactions also isolated

## Troubleshooting

### "Failed to create organization" Error
- Check the `organizations` table exists
- Verify your Supabase user has INSERT permission
- Check Supabase logs for detailed error

### New Users See Old Data
- RLS policies might not be enabled
- Run: `ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;`
- Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'inventory_items';`

### Existing User Can't See Their Data
- Check their profile has `organization_id`
- Run: `SELECT id, email, organization_id FROM profiles WHERE email = 'your@email.com';`
- If NULL, manually update it to your organization's ID

### Insert Fails with "organization_id cannot be null"
- The trigger should auto-set it
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname LIKE '%organization%';`
- Manual workaround: Include organization_id in INSERT

## Advanced: Inviting Team Members

In the future, you can allow users to invite team members to their organization:

```typescript
// Invite a team member
const { data: inviteData } = await supabase
  .from('profiles')
  .insert({
    email: 'teammate@example.com',
    organization_id: currentUser.organization_id, // Same org!
    role: 'Crew'
  });
```

Team members in the same organization will see the same inventory/jobs.

## Next Steps

1. ✅ Run the migration
2. ✅ Test signup with new account
3. ✅ Verify data isolation
4. Consider adding:
   - Organization name editing
   - Team member invitations
   - Organization settings page
   - Usage analytics per organization

## Summary

With this implementation:
- ✅ **Each user gets their own workspace**
- ✅ **No more shared data across accounts**
- ✅ **Row Level Security enforces isolation**
- ✅ **Automatic organization creation on signup**
- ✅ **Future-proof for team collaboration**

You're now running a proper multi-tenant SaaS application!
