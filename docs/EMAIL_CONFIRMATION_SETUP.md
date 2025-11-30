# Email Confirmation Setup

## What Happens When Users Click the Confirmation Link

When a user clicks the confirmation link in their email, they'll:
1. Be redirected to your app with a confirmation token
2. Land on the **Email Confirmed** success page
3. See a countdown and automatically redirect to login/dashboard
4. Or manually click "Continue to Login"

## Supabase Configuration

### Step 1: Set Redirect URL in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Find **"Site URL"** - set it to your production URL:
   ```
   https://gearbase.vercel.app
   ```
3. Find **"Redirect URLs"** - add these URLs (one per line):
   ```
   https://gearbase.vercel.app
   https://gearbase.vercel.app/email-confirmed
   http://localhost:5173
   http://localhost:5173/email-confirmed
   ```

### Step 2: Handle the Confirmation in Your App

The app already handles this! When Supabase redirects with a confirmation token:

1. **AppContext** detects the auth state change
2. User is marked as confirmed
3. Navigate to `EMAIL_CONFIRMED` view

### Step 3: Update Email Template Redirect (Optional)

In your Supabase email templates, the confirmation URL is automatically generated. But you can customize where it goes:

1. **Supabase Dashboard** → **Authentication** → **Email Templates** → **Confirm signup**
2. The `{{ .ConfirmationURL }}` variable contains the full URL
3. Supabase automatically appends the token

## How It Works

### Flow Diagram

```
User signs up
    ↓
Receives email with confirmation link
    ↓
Clicks link → https://gearbase.vercel.app?token=abc123&type=signup
    ↓
Supabase confirms email
    ↓
App detects auth change
    ↓
Shows EmailConfirmedScreen
    ↓
Auto-redirects to LOGIN or DASHBOARD (3 seconds)
```

## The New Screen

**EmailConfirmedScreen.tsx** shows:
- ✅ Success icon
- ✅ "Email Confirmed!" message
- ✅ List of features they now have access to
- ✅ Auto-redirect countdown
- ✅ Manual "Continue to Login" button

## Testing

### Test the Full Flow

1. **Create a test account** with a real email you can access
2. **Check email** (including spam folder)
3. **Click confirmation link** in email
4. **Should land on** Email Confirmed page
5. **After 3 seconds** redirects to login/dashboard

### If Email Doesn't Arrive

See `docs/EMAIL_CONFIRMATION_TROUBLESHOOTING.md` or:
- Temporarily disable email confirmation in Supabase
- Check spam folder
- Set up custom SMTP (SendGrid, Postmark)

## Customization

### Change Auto-Redirect Time

In `screens/EmailConfirmedScreen.tsx`, change this line:
```typescript
const [countdown, setCountdown] = useState(3); // Change 3 to your desired seconds
```

### Change Redirect Destination

Currently redirects to:
- **DASHBOARD** if user is logged in
- **LOGIN** if user clicks "Continue"

To change, modify the `handleContinue()` function.

## Production Checklist

- [ ] Site URL set in Supabase to production domain
- [ ] Redirect URLs added for both dev and production
- [ ] Email templates uploaded (branded)
- [ ] Test signup flow end-to-end
- [ ] Verify auto-redirect works
- [ ] Check mobile responsiveness

## Next Steps

After deploying:
1. Test with a real signup
2. Verify email arrives
3. Confirm confirmation page looks good
4. Check auto-redirect works

Your users now have a professional, smooth confirmation experience!
