# Theme Persistence Database Migration

## Overview
This migration adds theme preference storage to user profiles, allowing each user's light/dark mode choice to persist across sessions.

## What This Does
- Adds a `theme` column to the `profiles` table
- Defaults all existing users to 'dark' theme
- Saves theme preference when user toggles theme
- Loads saved theme preference on login

---

## Step 1: Add Theme Column to Profiles Table

Run this SQL in **Supabase SQL Editor**:

```sql
-- Add theme column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';

-- Add constraint to ensure only valid theme values
ALTER TABLE profiles
ADD CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark'));

-- Add comment for documentation
COMMENT ON COLUMN profiles.theme IS 'User preferred theme: light or dark';
```

---

## Step 2: Verify Migration

Check that the column was added successfully:

```sql
-- Verify theme column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'theme';

-- Check existing profiles have default theme
SELECT id, full_name, theme
FROM profiles
LIMIT 10;
```

Expected result:
- All existing users should have `theme = 'dark'`
- New signups will also default to 'dark'

---

## Step 3: Test Theme Persistence

### Test Flow:

1. **Login to your account**
2. **Toggle theme** from Dark to Light (click moon/sun icon)
3. **Verify database update**:
   ```sql
   SELECT full_name, theme FROM profiles WHERE id = 'your-user-id';
   ```
   Should show `theme = 'light'`

4. **Log out**
5. **Log back in**
6. **Verify theme persisted** - Should load with Light theme

### Optional: Set a specific user's theme

```sql
-- Set specific user to light theme
UPDATE profiles
SET theme = 'light'
WHERE id = 'your-user-id';

-- Or set by email
UPDATE profiles
SET theme = 'light'
WHERE email = 'your@email.com';
```

---

## How It Works

### On Login
1. User logs in with Supabase Auth
2. App fetches user profile from `profiles` table
3. Loads `theme` preference from profile
4. Sets app theme to saved preference
5. User sees their preferred theme immediately

### On Theme Toggle
1. User clicks theme toggle button
2. App updates local state (theme switches immediately)
3. App saves new theme to database:
   ```sql
   UPDATE profiles SET theme = 'light' WHERE id = '{user_id}';
   ```
4. Theme persists for next login

### For New Users
1. User signs up via `SignupScreen`
2. Profile created with `theme = 'dark'` (default)
3. User can change theme anytime
4. Preference saves automatically

---

## Rollback (If Needed)

If you need to remove theme persistence:

```sql
-- Remove theme column
ALTER TABLE profiles
DROP COLUMN IF EXISTS theme;
```

**Note**: This will delete all saved theme preferences.

---

## Files Modified

### 1. `/types.ts`
- Added `theme?: Theme` to `User` interface

### 2. `/context/AppContext.tsx`
- Added `toggleTheme()` function to save theme to database
- Updated `processUserSession()` to load theme from profile
- Updated reducer to save theme to user state
- Added `toggleTheme` to context interface and provider

### 3. `/components/Sidebar.tsx`
- Changed from `dispatch({ type: 'TOGGLE_THEME' })` to `toggleTheme()`

### 4. `/components/Header.tsx`
- Changed from `dispatch({ type: 'TOGGLE_THEME' })` to `toggleTheme()`

### 5. `/screens/WebsiteScreen.tsx`
- Changed from `dispatch({ type: 'TOGGLE_THEME' })` to `toggleTheme()`

---

## Benefits

✅ **User Preference Saved** - Theme persists across sessions
✅ **No Extra Clicks** - Users see their preferred theme on login
✅ **Professional UX** - Modern apps remember user preferences
✅ **Simple Implementation** - Single column, no complex logic
✅ **Multi-Device Support** - Theme syncs across devices (same account)

---

## Production Checklist

- [ ] Run migration SQL in Supabase
- [ ] Verify theme column exists
- [ ] Test theme toggle saves to database
- [ ] Test logging out and back in preserves theme
- [ ] Test with multiple users
- [ ] Deploy updated code to production

---

## Testing Instructions

### Manual Test:

1. Create test account or login
2. Note current theme (Dark or Light)
3. Toggle theme using button in sidebar/header
4. Open Supabase dashboard → Table Editor → profiles
5. Find your user's row
6. Verify `theme` column shows correct value
7. Log out completely
8. Log back in
9. **Expected**: App loads with same theme you left it on

### Database Test:

```sql
-- View all users and their theme preferences
SELECT
    full_name,
    email,
    theme,
    created_at
FROM profiles
ORDER BY created_at DESC;
```

---

## FAQ

**Q: What if a user never changes theme?**
A: They'll stay on the default 'dark' theme. No action required.

**Q: Can I change the default theme from 'dark' to 'light'?**
A: Yes, change the column default:
```sql
ALTER TABLE profiles ALTER COLUMN theme SET DEFAULT 'light';
```

**Q: Does this affect performance?**
A: No. It's a single column read on login and a single update on toggle. Negligible impact.

**Q: What if the database update fails?**
A: Theme still switches locally for the session. Just won't persist to next login. User can toggle again.

**Q: Can I add more theme options (e.g., auto/system)?**
A: Yes! Update the constraint:
```sql
ALTER TABLE profiles DROP CONSTRAINT valid_theme;
ALTER TABLE profiles ADD CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark', 'auto'));
```

Then update the `Theme` type in `types.ts`:
```typescript
export type Theme = 'light' | 'dark' | 'auto';
```

---

**Migration Complete!** 🎉

Users can now enjoy persistent theme preferences across all their sessions.
