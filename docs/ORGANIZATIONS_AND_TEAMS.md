# Organizations and Teams - Complete Guide

## Overview

GearBase uses a **many-to-many organization system** that allows:
- Users to belong to multiple organizations
- Organizations to have multiple team members
- Only organization owners pay for subscriptions
- Users can switch between their organizations

## How It Works

### Database Architecture

```
organizations ←→ organization_members ←→ auth.users
     ↓                                         ↓
  inventory                               profiles
  jobs                           (has active_organization_id)
  kits
  transactions
```

### Key Tables

#### 1. `organizations`
The main workspace/company entity that holds the subscription.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',  -- free, pro, team, enterprise
  subscription_status TEXT DEFAULT 'active',
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `organization_members` (Junction Table)
Links users to organizations in a many-to-many relationship.

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member',  -- owner, admin, member
  invited_by UUID,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

#### 3. `profiles`
User settings, including which org they're currently viewing.

```sql
ALTER TABLE profiles ADD COLUMN active_organization_id UUID REFERENCES organizations(id);
```

## User Scenarios

### Scenario 1: New User Signs Up

1. User creates account → Profile created
2. System creates a new organization
3. System adds user to `organization_members` as 'owner'
4. User's `active_organization_id` set to new org
5. User starts with empty inventory (fresh workspace)

### Scenario 2: User Gets Invited to Another Organization

**Example**: Alice (has her own org) gets invited by Bob (has his own org)

1. Bob invites Alice via email
2. Alice accepts invitation
3. New row created in `organization_members` linking Alice to Bob's org
4. Alice now belongs to **TWO** organizations:
   - Her own (where she's owner)
   - Bob's org (where she's member)
5. Alice sees an **Organization Switcher** in the header
6. When Alice switches to Bob's org:
   - Her `active_organization_id` updates to Bob's org ID
   - Dashboard now shows Bob's inventory/jobs/kits
   - All queries filtered by Bob's org

### Scenario 3: User with Subscription Invites Team Members

**Example**: Production company invites crew members

1. **Company owner** pays for Team subscription ($99/mo)
2. Owner invites 10 crew members via email
3. Each crew member signs up (free, no payment required)
4. All 10 members added to `organization_members` with role='member'
5. All team members see the company's inventory
6. **Only the company owner pays** - team members have free access

## Subscription Model

### How Subscriptions Work

- **Subscription belongs to the ORGANIZATION**, not individual users
- Only the organization **owner** pays
- All **team members** get access for free
- When user switches between orgs, they see that org's subscription features

### Subscription Tiers

```typescript
type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise';

// Free - Single user, unlimited items
// Pro ($29/mo) - Advanced features, API access
// Team ($99/mo) - Unlimited team members, analytics
// Enterprise (Custom) - White label, custom integrations
```

### Example: User in Multiple Orgs with Different Subscriptions

Alice belongs to:
1. **Her personal org** (Free tier)
2. **Big Productions LLC** (Team tier, invited as member)

When Alice switches to Big Productions LLC, she gets:
- Access to Team features (analytics, reports)
- Without paying anything herself
- Only Big Productions LLC pays $99/mo

## Organization Switching

### How Users Switch Organizations

```typescript
// User's organizations are loaded on login
const userOrganizations = await supabase
  .from('organization_members')
  .select('organization:organizations(*), role')
  .eq('user_id', user.id);

// User selects different org from dropdown
async function switchOrganization(newOrgId: string) {
  // Update active_organization_id
  await supabase
    .from('profiles')
    .update({ active_organization_id: newOrgId })
    .eq('id', user.id);

  // Reload all data (inventory, jobs, etc.)
  // RLS policies automatically filter by new active_organization_id
}
```

### What Happens When Switching

1. User selects different org from dropdown
2. `active_organization_id` updated in profile
3. **All data refreshes automatically**:
   - Inventory shows new org's items
   - Jobs show new org's projects
   - Kits show new org's packages
4. RLS policies handle filtering (no code changes needed!)

## Row Level Security (RLS)

### How RLS Enforces Organization Isolation

```sql
-- Helper function to get user's active organization
CREATE FUNCTION get_user_active_org()
RETURNS uuid AS $$
  SELECT active_organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Example RLS policy for inventory
CREATE POLICY "Users see their active org's inventory"
ON inventory FOR SELECT
USING (organization_id = get_user_active_org());
```

**Benefits**:
- Frontend doesn't need to filter queries
- Can't accidentally see other org's data
- Works with all Supabase queries automatically

## Migration Steps (Already Completed)

✅ Created `organizations` table
✅ Created `organization_members` junction table
✅ Added `active_organization_id` to profiles
✅ Migrated existing users as organization owners
✅ Added subscription columns to organizations

## Common Operations

### Check User's Organizations

```sql
SELECT
  o.name as org_name,
  om.role,
  o.subscription_tier
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = auth.uid();
```

### Check Active Organization

```sql
SELECT
  p.email,
  o.name as active_org,
  p.active_organization_id
FROM profiles p
JOIN organizations o ON o.id = p.active_organization_id
WHERE p.id = auth.uid();
```

### Invite User to Organization

```typescript
// 1. Send invitation email (to be implemented)
// 2. When they accept, add to organization_members
await supabase
  .from('organization_members')
  .insert({
    organization_id: currentOrgId,
    user_id: invitedUserId,
    role: 'member',
    invited_by: auth.uid()
  });
```

## Next Steps (Not Yet Implemented)

The database is ready, but these features still need UI:

1. **Organization Switcher Dropdown** - Let users switch between orgs
2. **Team Management Screen** - Invite/remove members
3. **Subscription Management** - Upgrade/downgrade tiers
4. **Role-based Permissions** - Different actions for owner/admin/member
5. **Invitation System** - Email invites with accept/decline

## Summary

**Before**: Each user had one organization
**After**: Users can belong to multiple organizations

**Benefits**:
- ✅ Collaboration: Share inventory across teams
- ✅ Cost-effective: Only org owner pays, unlimited members
- ✅ Flexible: Users can have personal org + be member of client orgs
- ✅ Secure: RLS ensures complete data isolation

Your app now supports true multi-organization collaboration!
