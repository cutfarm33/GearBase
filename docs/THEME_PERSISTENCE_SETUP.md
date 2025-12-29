# Theme Persistence - Quick Setup Guide

## What This Does

When users toggle between Light and Dark theme, their preference is now **saved to their profile** and will persist across:
- ✅ Browser sessions
- ✅ Different devices (same account)
- ✅ App restarts
- ✅ Logging out and back in

## Quick Setup (3 Steps)

### Step 1: Add Theme Column to Database

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Add theme column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';

-- Add constraint to ensure only valid theme values
ALTER TABLE profiles
ADD CONSTRAINT valid_theme CHECK (theme IN ('light', 'dark'));
```

Click **Run** ▶️

### Step 2: Verify It Worked

Run this to check:

```sql
SELECT id, full_name, theme FROM profiles LIMIT 5;
```

You should see a `theme` column with value 'dark' for all users.

### Step 3: Test It!

1. **Login to your app**
2. **Toggle theme** (click the sun/moon icon)
3. **Log out**
4. **Log back in**
5. **Expected**: Your theme preference is remembered! 🎉

---

## How It Works

### Previous Behavior (Before)
- Theme toggle only changed local state
- Theme reset to 'dark' on every login
- User had to toggle theme every session

### New Behavior (After)
- Theme toggle saves to database automatically
- Theme loads from database on login
- User's preference persists forever

---

## User Experience

### For Your Users:

**First Login:**
- App loads with default Dark theme

**Toggle Theme:**
- Click sun/moon icon in sidebar or header
- Theme switches instantly (no delay)
- Preference saves to database silently

**Every Login After:**
- App loads with user's saved theme
- No need to toggle again
- Works across all devices

---

## Technical Details

### Database Schema
```
profiles table:
  - id (uuid, primary key)
  - full_name (text)
  - email (text)
  - role (text)
  - organization_id (uuid)
  - theme (text) ← NEW! Defaults to 'dark'
```

### Code Changes
All theme toggles now use `toggleTheme()` function which:
1. Updates local state (instant visual change)
2. Saves to database (background)
3. Handles errors gracefully

Files modified:
- `types.ts` - Added theme to User interface
- `context/AppContext.tsx` - Added toggleTheme function
- `components/Sidebar.tsx` - Uses toggleTheme
- `components/Header.tsx` - Uses toggleTheme
- `screens/WebsiteScreen.tsx` - Uses toggleTheme

---

## Troubleshooting

### Theme Not Persisting?

**Check 1: Database column exists**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'theme';
```
Should return one row.

**Check 2: Theme is saving**
Toggle theme, then check database:
```sql
SELECT full_name, theme FROM profiles WHERE email = 'your@email.com';
```
Should show 'light' or 'dark' based on your current theme.

**Check 3: Console errors**
Open browser DevTools → Console
Look for errors like "Failed to save theme preference"

### Still Not Working?

1. Clear browser cache and cookies
2. Log out and log back in
3. Check Supabase logs for permission errors
4. Verify RLS policies allow UPDATE on profiles table

---

## Advanced: Set Default Theme to Light

If you want new users to default to Light theme:

```sql
ALTER TABLE profiles ALTER COLUMN theme SET DEFAULT 'light';
```

Existing users keep their saved preference.

---

## Advanced: Add "Auto" (System) Theme

Want to support system theme detection?

**Step 1: Update constraint**
```sql
ALTER TABLE profiles DROP CONSTRAINT valid_theme;
ALTER TABLE profiles ADD CONSTRAINT valid_theme
CHECK (theme IN ('light', 'dark', 'auto'));
```

**Step 2: Update types.ts**
```typescript
export type Theme = 'light' | 'dark' | 'auto';
```

**Step 3: Add system detection logic**
(Implementation left as exercise - requires `window.matchMedia`)

---

## Migration Document

For full technical details, see:
📄 [THEME_PERSISTENCE_MIGRATION.md](./THEME_PERSISTENCE_MIGRATION.md)

---

**Enjoy persistent themes!** 🌙☀️
