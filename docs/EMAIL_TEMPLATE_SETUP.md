# Email Template Setup Guide

## Overview
Custom branded email templates for GearBase authentication flows. All templates feature your emerald green branding, professional design, and mobile-responsive layouts.

## Templates Included

| Template | File | Purpose |
|----------|------|---------|
| **Confirm Signup** | `confirm-signup.html` | Email verification for new user signups |
| **Invite User** | `invite-user.html` | Team member invitations |
| **Change Email** | `change-email.html` | Confirm new email address |
| **Reset Password** | `reset-password.html` | Password recovery |
| **Reauthentication** | `reauthentication.html` | Identity verification for sensitive actions |
| **Magic Link** | `magic-link.html` | Passwordless login |

## How to Add to Supabase

### Step 1: Access Email Templates
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Each Template

#### Confirm Signup
1. Select **"Confirm signup"** from the template dropdown
2. Copy the contents of `docs/email-templates/confirm-signup.html`
3. Paste into the email template editor
4. Click **Save**

#### Invite User
1. Select **"Invite user"** from the template dropdown
2. Copy the contents of `docs/email-templates/invite-user.html`
3. Paste into the email template editor
4. Click **Save**

#### Change Email Address
1. Select **"Change email address"** from the template dropdown
2. Copy the contents of `docs/email-templates/change-email.html`
3. Paste into the email template editor
4. Click **Save**

#### Reset Password
1. Select **"Reset password"** from the template dropdown
2. Copy the contents of `docs/email-templates/reset-password.html`
3. Paste into the email template editor
4. Click **Save**

#### Reauthentication
1. Select **"Reauthentication"** from the template dropdown
2. Copy the contents of `docs/email-templates/reauthentication.html`
3. Paste into the email template editor
4. Click **Save**

#### Magic Link
1. Select **"Magic Link"** from the template dropdown
2. Copy the contents of `docs/email-templates/magic-link.html`
3. Paste into the email template editor
4. Click **Save**

### Step 3: Test Each Template
Test each email flow to ensure templates render correctly:

- **Confirm Signup**: Create a new test account
- **Invite User**: Invite a team member (if feature is enabled)
- **Change Email**: Change your email address in settings
- **Reset Password**: Use "Forgot Password" flow
- **Magic Link**: Use passwordless login (if enabled)
- **Reauthentication**: Perform a sensitive action requiring verification

## Template Features

### Brand Colors
- **Primary Green**: `#10b981` (Emerald-500)
- **Gradient Header**: `#059669` to `#10b981`
- **Background**: `#f1f5f9` (Slate-100)
- **Text**: `#334155` (Slate-700)

### Responsive Design
- Mobile-friendly table-based layout
- 600px max width for desktop
- Readable on all devices

### Key Elements
- ✅ Branded header with GearBase logo text
- ✅ Clear CTA button for confirmation
- ✅ Fallback link for email clients that don't support buttons
- ✅ Feature list highlighting free tier benefits
- ✅ Support contact information
- ✅ Security notice about link expiration

## Template-Specific Features

### Confirm Signup
- Welcome message with encouragement
- Feature list highlighting free tier benefits
- 24-hour expiration notice

### Invite User
- Team-focused messaging
- Collaboration features highlighted
- 7-day expiration (longer for team coordination)

### Change Email Address
- Security-focused design
- Yellow warning box for unauthorized changes
- Clear "ignore if not you" message

### Reset Password
- Urgent but not alarming tone
- Security notice in yellow warning box
- 1-hour expiration for security

### Reauthentication
- Verification-focused messaging
- Explains why reauthentication is needed
- 15-minute expiration (short for security)

### Magic Link
- Explains what a magic link is (educational)
- Blue info box with explanation
- Promotes password-free convenience
- 1-hour expiration

## Customization

### Update Support Email
Replace `support@gearbase.app` with your actual support email:
```html
<a href="mailto:your-email@example.com">Contact Support</a>
```

### Update Company Name/Year
Update the footer copyright:
```html
© 2024 GearBase. All rights reserved.
```

### Custom Domain
If you have a custom domain, you may want to update links and branding accordingly.

## Testing Checklist

- [ ] Email displays correctly in Gmail
- [ ] Email displays correctly in Outlook
- [ ] Email displays correctly on mobile
- [ ] Confirmation link works
- [ ] Links are properly styled
- [ ] Brand colors match your app
- [ ] All text is readable
- [ ] Button is clickable

## Troubleshooting

### Email Not Sending
- Check Supabase email rate limits
- Verify email settings in Authentication settings
- Check spam folder

### Template Not Updating
- Clear browser cache
- Wait a few minutes for changes to propagate
- Try in incognito mode

### Styling Issues
- Some email clients strip CSS styles
- Use inline styles (already done in template)
- Test in multiple email clients

## Next Steps

After setting up the email template:
1. Test with a real signup
2. Create templates for other auth flows (optional)
3. Consider custom SMTP provider for production (SendGrid, Postmark, etc.)
