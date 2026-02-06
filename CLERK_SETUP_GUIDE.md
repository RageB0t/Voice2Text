# Clerk Setup Guide

## Step 1: Create Clerk Account

1. Go to https://clerk.com
2. Click "Start building for free"
3. Sign up with your email or GitHub
4. Verify your email

## Step 2: Create Application

1. After logging in, click "Create application"
2. Name it: **Vanta Dictate**
3. Select authentication methods:
   - ✅ Email
   - ✅ Password
   - ✅ Email verification code (magic link)
4. Click "Create application"

## Step 3: Get API Keys

1. In your Clerk dashboard, go to **API Keys** (left sidebar)
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
3. Copy both keys

## Step 4: Add Keys to .env.local

1. Open `website/.env.local`
2. Replace the placeholder keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
```

3. Save the file
4. Restart the dev server:
   ```bash
   cd website
   npm run dev
   ```

## Step 5: Configure Clerk Settings

### Appearance (Optional but Recommended)

1. In Clerk dashboard, go to **Customization** → **Appearance**
2. Select **Dark mode** as default
3. Customize colors to match Vanta Dictate:
   - Primary color: `#6AE3FF` (cyan)
   - Background: `#0B0E14`

### Email Templates (Optional)

1. Go to **Emails** in Clerk dashboard
2. Customize welcome email
3. Add Vanta Dictate branding

### Redirect URLs

1. Go to **Paths** in Clerk dashboard
2. Verify these are set:
   - Sign-in URL: `/login`
   - Sign-up URL: `/signup`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

## Step 6: Test Authentication

1. Go to http://localhost:3000/signup
2. Create a test account
3. Verify email (check your inbox)
4. You should be redirected to `/dashboard`
5. Try logging out and back in at `/login`

## Step 7: Set Up Webhooks (For Supabase Sync)

We'll do this in Phase 2 when we set up Supabase.

1. In Clerk dashboard, go to **Webhooks**
2. Click "Add Endpoint"
3. URL will be: `https://your-domain.com/api/webhooks/clerk`
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the webhook secret (starts with `whsec_`)

## Troubleshooting

### "Invalid publishable key"
- Make sure you copied the entire key including `pk_test_`
- Check for extra spaces
- Restart dev server after changing .env.local

### "Clerk is not defined"
- Make sure you installed `@clerk/nextjs`
- Check that ClerkProvider is in app/layout.tsx
- Restart dev server

### Sign-up not working
- Check browser console for errors
- Verify email verification is enabled in Clerk dashboard
- Check spam folder for verification email

### Redirects not working
- Verify paths in Clerk dashboard match .env.local
- Check middleware.ts is configured correctly

## Free Tier Limits

Clerk's free tier includes:
- ✅ 5,000 monthly active users
- ✅ Unlimited sign-ups
- ✅ Email + password auth
- ✅ Magic links
- ✅ Social logins (optional)
- ✅ User management dashboard

This is more than enough to get started!

## Next Steps

Once Clerk is working:
1. ✅ Users can sign up and log in
2. ✅ Users are redirected to dashboard
3. ⏳ Set up Supabase to store user data
4. ⏳ Set up webhooks to sync users
5. ⏳ Add Stripe for subscriptions

---

**Need help?** Check Clerk's docs: https://clerk.com/docs
