# Multi-Tenancy Quick Start

## Problem You're Solving
Right now, when someone signs up, they see YOUR inventory and jobs. This fixes that so each user gets their own fresh workspace.

## Quick Implementation (15 minutes)

### Step 1: Backup Database (2 min)
Go to Supabase Dashboard → Database → Backups → Create Backup

### Step 2: Get Your User ID (1 min)
In Supabase SQL Editor, run:
```sql
SELECT id, email FROM profiles;
```
Copy your UUID (looks like: `123e4567-e89b-12d3-a456-426614174000`)

### Step 3: Run Migration (5 min)
1. Open `docs/MULTI_TENANCY_MIGRATION.md`
2. Find this line in the script:
   ```sql
   admin_user_id UUID := 'YOUR_USER_ID';
   ```
3. Replace `'YOUR_USER_ID'` with your actual UUID
4. Copy the ENTIRE migration script
5. Paste into Supabase SQL Editor
6. Click "Run"
7. Wait for "Success" message

### Step 4: Verify Migration Worked (2 min)
Run this in SQL Editor:
```sql
-- Should see your organization
SELECT * FROM organizations;

-- Should see your profile with organization_id
SELECT id, email, organization_id FROM profiles;

-- Should see RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('profiles', 'inventory_items', 'jobs', 'transactions');
```

All should return data. If `rowsecurity` is `true`, RLS is working!

### Step 5: Deploy Updated Code (3 min)
The code changes are already done in:
- `types.ts` - Added organization types
- `screens/SignupScreen.tsx` - Creates org on signup

Just deploy to Vercel:
```bash
git add .
git commit -m "Add multi-tenancy with organizations"
git push
```

Vercel will auto-deploy.

### Step 6: Test (2 min)
1. Open your deployed app
2. Create a new test account (use a different email)
3. Login with the new account
4. Check inventory - should be **EMPTY** (not showing your stuff!)

## ✅ Done!

Each new user now gets their own isolated workspace. Your existing data is safe in your organization.

## What Changed

### Database
- New `organizations` table
- `organization_id` column on all data tables
- Row Level Security (RLS) policies isolate data
- Automatic triggers set organization_id on insert

### Code
- TypeScript types include `organization_id`
- Signup creates organization automatically
- RLS handles all filtering (you don't need to change queries!)

## Common Issues

**"organization_id cannot be null" error**
- Re-run Step 4 (Make organization_id required) from migration
- Make sure triggers were created

**New users still see my data**
- RLS might not be enabled
- Run: `ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;`
- Then run the policies from the migration again

**I can't see my own data**
- Check: `SELECT organization_id FROM profiles WHERE email = 'your@email.com';`
- If NULL, run Step 4 of the migration again

## Next Steps (Optional)

Later, you can add:
- Organization name editing
- Team member invitations
- Sharing items between orgs
- Organization settings page

## Need Help?

1. Check `docs/MULTI_TENANCY_MIGRATION.md` for full migration
2. Check `docs/MULTI_TENANCY_IMPLEMENTATION.md` for detailed guide
3. Check Supabase logs for specific errors

## Summary

**Before**: All users share the same inventory ❌
**After**: Each user has their own isolated workspace ✅

You're now running true multi-tenancy!
