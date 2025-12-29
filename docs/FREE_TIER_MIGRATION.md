# Free Tier Database Migration

## Overview
This migration adds the `plan` field to the profiles table to support the free tier launch strategy.

## SQL Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add plan column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Add plan expiry date (for future paid plans)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;

-- Add Stripe customer ID (for future paid plans)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Update existing users to have free plan
UPDATE profiles
SET plan = 'free'
WHERE plan IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.plan IS 'User subscription plan: free, pro, team, enterprise';
COMMENT ON COLUMN profiles.plan_expires_at IS 'When the paid plan expires (NULL for free tier)';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for paid subscriptions';
```

## Features by Plan (Current)

### Free Tier (Available Now)
- ✅ Unlimited Items
- ✅ Unlimited Jobs
- ✅ Unlimited Users
- ✅ QR Code Support
- ✅ Check-in/Check-out
- ✅ Digital Signatures
- ✅ Transaction History
- ✅ Job Management
- ✅ Calendar View

### Pro Tier (Coming Soon - $29/month)
- Everything in Free
- Advanced Reports
- API Access
- Priority Support

### Team Tier (Coming Soon - $99/month)
- Everything in Pro
- Advanced Analytics
- White Label Options
- Dedicated Support

### Enterprise (Coming Soon - Custom Pricing)
- Everything in Team
- Custom Integrations
- On-Premise Hosting
- SLA Guarantee

## Implementation Notes

1. **No Limits on Free Tier**: We're not enforcing any item/job/user limits for now. This allows maximum growth.

2. **Future Upgrade Path**: The `plan` field is ready for when you want to add paid plans later.

3. **Stripe Integration**: The `stripe_customer_id` field is prepared for future Stripe integration.

4. **Plan Expiry**: The `plan_expires_at` field will track when paid plans expire (always NULL for free users).

## Next Steps (When Ready to Monetize)

1. **Add Usage Tracking** (Optional):
   ```sql
   ALTER TABLE profiles ADD COLUMN items_count INT DEFAULT 0;
   ALTER TABLE profiles ADD COLUMN jobs_count INT DEFAULT 0;
   ```

2. **Create Stripe Checkout** for Pro plan

3. **Add Plan Limits** to UI (soft enforcement with upgrade prompts)

4. **Enable Upgrade Button** in settings/dashboard

## Testing

After running the migration:

1. Create a new account - should get `plan = 'free'`
2. Check existing accounts - should have `plan = 'free'`
3. Verify all features work as expected
