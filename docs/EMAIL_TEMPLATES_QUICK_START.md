# Email Templates - Quick Start

## All Templates Ready to Use

All 6 branded email templates are complete and ready to add to Supabase:

### ✅ Templates Created

1. **Confirm Signup** → `docs/email-templates/confirm-signup.html`
2. **Invite User** → `docs/email-templates/invite-user.html`
3. **Change Email** → `docs/email-templates/change-email.html`
4. **Reset Password** → `docs/email-templates/reset-password.html`
5. **Reauthentication** → `docs/email-templates/reauthentication.html`
6. **Magic Link** → `docs/email-templates/magic-link.html`

## Quick Setup Steps

### 1. Go to Supabase Dashboard
Navigate to: **Authentication** → **Email Templates**

### 2. For Each Template:
1. Select the template type from dropdown
2. Copy the HTML from the corresponding file
3. Paste into Supabase editor
4. Click **Save**

### 3. Test
Create a test account to verify the emails look correct.

## Template Features

All templates include:
- ✅ **Emerald green branding** matching your app
- ✅ **Mobile-responsive** table-based layout
- ✅ **Clear CTA buttons** that are easy to click
- ✅ **Security notices** where appropriate
- ✅ **Fallback text links** for accessibility
- ✅ **Professional design** with GearBase logo

## Design Details

### Colors Used
- **Primary**: `#10b981` (Emerald-500) - Main buttons and accents
- **Gradient**: `#059669` to `#10b981` - Header background
- **Warning**: `#f59e0b` (Amber-500) - Security notices
- **Info**: `#0ea5e9` (Sky-500) - Informational boxes

### Security Timings
Each template has appropriate expiration times:
- **Confirm Signup**: 24 hours
- **Invite User**: 7 days (longer for team coordination)
- **Change Email**: 24 hours
- **Reset Password**: 1 hour (security-critical)
- **Reauthentication**: 15 minutes (highest security)
- **Magic Link**: 1 hour

## What Makes Each Template Special

### Confirm Signup
Shows all free tier features to excite new users about what they get for free.

### Invite User
Emphasizes team collaboration features and shared access.

### Change Email
Has a prominent yellow security warning to alert users about unauthorized changes.

### Reset Password
Balances urgency with reassurance, includes security notice.

### Reauthentication
Explains why verification is needed, builds trust.

### Magic Link
Educates users about passwordless login with a helpful info box.

## Customization Needed

Before deploying, update in ALL templates:
- Replace `support@gearbase.app` with your actual support email
- Update `© 2024 GearBase` year if needed

## Next Steps After Setup

1. ✅ Add all templates to Supabase
2. ✅ Update support email address
3. ✅ Test each email flow
4. ✅ Consider custom SMTP provider for production (SendGrid, Postmark, etc.)
5. ✅ Monitor email deliverability

## Testing Checklist

After adding to Supabase, test:
- [ ] Confirm signup email arrives and looks good
- [ ] Password reset flow works
- [ ] Email change confirmation works
- [ ] All buttons are clickable
- [ ] Mobile rendering looks good
- [ ] Links work correctly
- [ ] Emails don't go to spam

## Support Resources

- Full documentation: `docs/EMAIL_TEMPLATE_SETUP.md`
- Supabase Email Docs: https://supabase.com/docs/guides/auth/auth-email-templates
- Need help? Check Supabase dashboard logs for email delivery issues
