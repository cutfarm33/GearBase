# GearBase Deployment Checklist

## Your Domain: mygearbase.com

---

## 1. Supabase Configuration ✅

### URL Configuration
Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**

**Site URL:**
```
https://mygearbase.com
```

**Redirect URLs** (add all of these):
```
https://mygearbase.com
https://mygearbase.com/email-confirmed
https://www.mygearbase.com
https://www.mygearbase.com/email-confirmed
http://localhost:5173
http://localhost:5173/email-confirmed
```

### Email Templates
Go to **Supabase Dashboard** → **Authentication** → **Email Templates**

Upload these branded templates from `docs/email-templates/`:
- [ ] Confirm signup (`confirm-signup.html`)
- [ ] Invite user (`invite-user.html`)
- [ ] Change email (`change-email.html`)
- [ ] Reset password (`reset-password.html`)
- [ ] Reauthentication (`reauthentication.html`)
- [ ] Magic link (`magic-link.html`)

**Update support email** in all templates:
- Replace `support@gearbase.app` with your actual email

---

## 2. Database Setup ✅

- [ ] Run initial schema (`docs/INITIAL_DATABASE_SCHEMA.md`)
- [ ] Run multi-tenancy migration (`docs/MULTI_TENANCY_MIGRATION_STEP_BY_STEP.md`)
- [ ] Verify your profile has `organization_id`
- [ ] Delete test users/profiles
- [ ] Verify Row Level Security is enabled

**Quick Check:**
```sql
-- Should see your organization
SELECT * FROM organizations;

-- Should see RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('profiles', 'inventory_items', 'jobs', 'transactions');
```

---

## 3. Vercel Deployment ✅

### Custom Domain Setup
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Add domain: `mygearbase.com`
3. Add www subdomain: `www.mygearbase.com`
4. Follow Vercel's DNS instructions to point your domain

### Environment Variables
Verify in **Vercel Dashboard** → **Settings** → **Environment Variables**:
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### Deploy Code
```bash
git add .
git commit -m "Production ready: multi-tenancy, email templates, custom domain"
git push
```

Vercel will auto-deploy to `mygearbase.com`

---

## 4. DNS Configuration (at your domain registrar)

Point your domain to Vercel:

**A Record:**
```
Host: @
Value: 76.76.21.21 (Vercel's IP)
```

**CNAME Record (www):**
```
Host: www
Value: cname.vercel-dns.com
```

*Note: Vercel provides specific DNS instructions - use those if different*

---

## 5. Testing Checklist ✅

### Test Multi-Tenancy
- [ ] Your existing account logs in successfully
- [ ] You see all your original inventory/jobs
- [ ] Create a NEW test account (different email)
- [ ] New account has EMPTY inventory (success!)
- [ ] New account cannot see your data
- [ ] You cannot see new account's data

### Test Email Flow
- [ ] Sign up with real email
- [ ] Receive confirmation email (check spam if not in inbox)
- [ ] Email has branded template with emerald colors
- [ ] Click confirmation link
- [ ] Land on "Email Confirmed" page
- [ ] Auto-redirects after 3 seconds
- [ ] Can log in successfully

### Test QR Codes
- [ ] Generate QR code for an item
- [ ] QR code URL uses `https://mygearbase.com`
- [ ] Scanning QR code opens item detail page
- [ ] Works on mobile devices

### Test Features
- [ ] Add inventory item
- [ ] Create job
- [ ] Check-out items
- [ ] Check-in items
- [ ] Digital signatures work
- [ ] Transaction history displays
- [ ] Calendar view loads
- [ ] Team management works

---

## 6. Production Optimizations (Optional)

### Email Delivery (Recommended)
Set up custom SMTP for reliable email delivery:
- [ ] Configure SendGrid, Postmark, or AWS SES
- [ ] Update Supabase SMTP settings
- [ ] Test email delivery

### Performance
- [ ] Enable Vercel Analytics
- [ ] Check Lighthouse scores
- [ ] Optimize images if needed

### Monitoring
- [ ] Set up Sentry for error tracking (optional)
- [ ] Monitor Supabase usage
- [ ] Check for rate limit warnings

---

## 7. Launch Checklist ✅

Before announcing:
- [ ] All database migrations complete
- [ ] Custom domain working (mygearbase.com)
- [ ] SSL certificate active (https)
- [ ] Email confirmation working
- [ ] Multi-tenancy tested and working
- [ ] QR codes generate correctly
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] All features tested end-to-end

### Soft Launch
- [ ] Invite 2-3 beta users to test
- [ ] Collect feedback
- [ ] Fix any issues
- [ ] Monitor for errors

### Public Launch
- [ ] Update landing page with launch announcement
- [ ] Share on social media
- [ ] Post in relevant communities
- [ ] Monitor signups and usage

---

## Quick Deploy Commands

```bash
# Check status
git status

# Stage all changes
git add .

# Commit
git commit -m "Production ready: multi-tenancy and branding"

# Deploy
git push

# Vercel will auto-deploy to mygearbase.com
```

---

## Troubleshooting

### Domain not working
- Check DNS propagation (can take 24-48 hours)
- Verify Vercel domain configuration
- Check SSL certificate status

### Emails not sending
- Check Supabase email rate limits
- Verify redirect URLs are correct
- Set up custom SMTP for production

### Multi-tenancy not working
- Verify RLS policies are enabled
- Check organization_id exists on all tables
- Run verification queries from migration docs

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Your Guides**:
  - Multi-tenancy: `docs/MULTI_TENANCY_IMPLEMENTATION.md`
  - Email Setup: `docs/EMAIL_CONFIRMATION_SETUP.md`
  - Database: `docs/INITIAL_DATABASE_SCHEMA.md`

---

## Post-Launch

Monitor and optimize:
- User signups
- Error rates
- Database usage
- Email deliverability
- Feature usage

Congratulations on launching GearBase! 🎉
