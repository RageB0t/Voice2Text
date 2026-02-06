# Vanta Dictate SaaS Implementation Plan

## Overview
This document outlines the complete implementation plan for transforming Vanta Dictate into a full SaaS product with authentication, subscriptions, and usage limits.

## Architecture

### Monorepo Structure
```
vanta-dictate/
├── desktop/                 # Existing Tauri app
│   ├── src/
│   ├── src-tauri/
│   └── package.json
├── website/                 # New Next.js website
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── shared/                  # Shared types/utils
│   └── types.ts
└── package.json            # Root workspace
```

### Tech Stack

**Website (Next.js)**
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Components: shadcn/ui
- Language: TypeScript
- Deployment: Railway.com

**Authentication**
- Provider: Clerk
- Methods: Email/password, Magic link
- Session: JWT tokens
- Integration: Clerk webhooks

**Billing**
- Provider: Stripe
- Model: Subscriptions ($15/month)
- Portal: Stripe Customer Portal
- Integration: Stripe webhooks

**Database**
- Provider: Supabase (PostgreSQL)
- ORM: Prisma or Supabase client
- Tables:
  - `users` (synced from Clerk)
  - `subscriptions` (synced from Stripe)
  - `usage_logs` (from desktop app)
  - `devices` (optional, for multi-device)

**Desktop App**
- Auth: OAuth-style web flow
- Storage: Tauri secure storage
- API: REST client to Next.js API routes
- Tracking: Usage events sent to backend

## Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT DEFAULT 'free', -- 'free' or 'pro'
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### usage_logs
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW(),
  date DATE NOT NULL, -- for daily aggregation
  device_id TEXT, -- optional
  INDEX idx_user_date (user_id, date)
);
```

## Implementation Phases

### Phase 1: Website Foundation (Week 1)
**Goal**: Set up Next.js website with basic pages

**Tasks**:
1. Create Next.js project in `website/` directory
2. Set up Tailwind CSS and shadcn/ui
3. Create landing page with hero, features, pricing
4. Create sign-up page (inspired by design reference)
5. Create login page (matching sign-up design)
6. Set up dark mode theme
7. Deploy to Railway.com

**Deliverables**:
- Landing page live
- Sign-up/login pages (UI only, no auth yet)
- Responsive design
- Fast load times

### Phase 2: Authentication (Week 2)
**Goal**: Implement Clerk authentication

**Tasks**:
1. Set up Clerk account and project
2. Install Clerk SDK in Next.js
3. Configure Clerk middleware
4. Implement sign-up flow
5. Implement login flow
6. Implement magic link
7. Set up Clerk webhooks
8. Create Supabase project and users table
9. Sync Clerk users to Supabase via webhook
10. Test authentication flows

**Deliverables**:
- Working sign-up/login
- User data synced to database
- Session management
- Protected routes

### Phase 3: Dashboard (Week 3)
**Goal**: Build user dashboard with glassmorphism design

**Tasks**:
1. Create dashboard layout with sidebar
2. Implement glassmorphism styling
3. Create Overview page (plan, usage, CTA)
4. Create Account page (profile, settings)
5. Create Billing page (placeholder)
6. Add navigation and routing
7. Add "Download App" button
8. Make dashboard responsive
9. Add loading states
10. Test on multiple devices

**Deliverables**:
- Functional dashboard
- Glassmorphism design
- All pages accessible
- Mobile-friendly

### Phase 4: Stripe Integration (Week 4)
**Goal**: Implement subscription billing

**Tasks**:
1. Set up Stripe account
2. Create Stripe products and prices
3. Install Stripe SDK in Next.js
4. Create Stripe Checkout session endpoint
5. Implement "Upgrade to Pro" flow
6. Set up Stripe webhooks
7. Create subscriptions table
8. Sync Stripe subscriptions to database
9. Implement Stripe Customer Portal
10. Add billing page with portal link
11. Test subscription lifecycle
12. Test webhook handling

**Deliverables**:
- Working subscription flow
- Stripe portal integration
- Subscription data synced
- Invoice generation

### Phase 5: Desktop App Auth (Week 5)
**Goal**: Integrate desktop app with web authentication

**Tasks**:
1. Create OAuth callback endpoint in Next.js
2. Generate auth tokens for desktop app
3. Add "Sign in" screen to desktop app
4. Implement browser-based login flow
5. Store auth token in Tauri secure storage
6. Create API client in desktop app
7. Validate token on app startup
8. Handle token expiration
9. Implement logout
10. Test auth flow end-to-end

**Deliverables**:
- Desktop app can authenticate
- Secure token storage
- Token validation
- Logout functionality

### Phase 6: Usage Tracking (Week 6)
**Goal**: Track dictation usage and enforce limits

**Tasks**:
1. Create usage_logs table
2. Create usage tracking API endpoints
3. Implement usage tracking in desktop app
4. Send usage events to backend
5. Calculate daily usage
6. Query remaining quota before recording
7. Show remaining time in desktop app
8. Implement limit enforcement
9. Show upgrade message when limit reached
10. Test usage tracking accuracy
11. Test daily reset logic
12. Test Pro unlimited access

**Deliverables**:
- Usage tracking working
- Free tier limits enforced
- Pro users unlimited
- Accurate time tracking

### Phase 7: Polish & Testing (Week 7)
**Goal**: Refine UX and fix bugs

**Tasks**:
1. Add loading states everywhere
2. Improve error messages
3. Add success notifications
4. Optimize page load times
5. Test all user flows
6. Fix responsive design issues
7. Add analytics (optional)
8. Write user documentation
9. Create FAQ page
10. Final security audit

**Deliverables**:
- Polished UX
- All bugs fixed
- Documentation complete
- Ready for launch

## API Endpoints

### Authentication
- `POST /api/auth/callback` - Desktop app auth callback
- `POST /api/auth/validate` - Validate auth token
- `POST /api/auth/refresh` - Refresh expired token
- `POST /api/auth/logout` - Invalidate token

### User
- `GET /api/user/me` - Get current user info
- `GET /api/user/plan` - Get user's plan and limits
- `PATCH /api/user/profile` - Update user profile
- `DELETE /api/user/account` - Delete account

### Usage
- `POST /api/usage/log` - Log dictation usage
- `GET /api/usage/today` - Get today's usage
- `GET /api/usage/quota` - Get remaining quota
- `GET /api/usage/history` - Get usage history

### Billing
- `POST /api/billing/checkout` - Create Stripe Checkout session
- `POST /api/billing/portal` - Create Stripe Portal session
- `GET /api/billing/subscription` - Get subscription details
- `POST /api/billing/cancel` - Cancel subscription

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user events
- `POST /api/webhooks/stripe` - Stripe subscription events

## Desktop App Changes

### New Files
- `src-tauri/src/auth.rs` - Authentication logic
- `src-tauri/src/api_client.rs` - Backend API client
- `src-tauri/src/usage_tracker.rs` - Usage tracking
- `src/components/LoginScreen.tsx` - Login UI
- `src/components/PlanBadge.tsx` - Show plan status
- `src/components/UsageIndicator.tsx` - Show remaining time

### Modified Files
- `src-tauri/src/lib.rs` - Add auth and usage modules
- `src-tauri/src/main.rs` - Check auth on startup
- `src-tauri/src/transcription/mod.rs` - Check quota before recording
- `src/App.tsx` - Add login screen routing
- `src/components/SettingsWindow.tsx` - Add plan/usage display

### New Tauri Commands
- `check_auth_status()` - Check if user is logged in
- `open_login()` - Open browser for login
- `logout()` - Clear auth token
- `get_user_plan()` - Get user's plan
- `get_remaining_quota()` - Get remaining free tier time
- `log_usage(duration)` - Log dictation usage

## Environment Variables

### Website (.env.local)
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://vantadictate.railway.app
DESKTOP_AUTH_SECRET=
```

### Desktop App (.env)
```
VITE_API_URL=https://vantadictate.railway.app
```

## Security Considerations

1. **Token Security**
   - Use short-lived JWT tokens (1 hour)
   - Implement refresh tokens (30 days)
   - Store tokens in Tauri secure storage
   - Validate tokens on every API request

2. **API Security**
   - Rate limit all endpoints
   - Validate request signatures
   - Use CORS properly
   - Sanitize all inputs

3. **Webhook Security**
   - Verify Clerk webhook signatures
   - Verify Stripe webhook signatures
   - Use HTTPS only
   - Log all webhook events

4. **Data Privacy**
   - Never send audio to backend
   - Never send transcriptions to backend
   - Only track usage duration
   - Allow account deletion

## Deployment Checklist

### Before Launch
- [ ] Set up Railway.com project
- [ ] Configure environment variables
- [ ] Set up Clerk production instance
- [ ] Set up Stripe production account
- [ ] Set up Supabase production project
- [ ] Configure custom domain (future)
- [ ] Test all user flows in production
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (optional)
- [ ] Write privacy policy
- [ ] Write terms of service
- [ ] Create support email

### Launch Day
- [ ] Deploy website to Railway
- [ ] Update desktop app with production API URL
- [ ] Build and sign desktop app v0.3.0
- [ ] Upload to GitHub releases
- [ ] Update updater.json
- [ ] Announce on social media
- [ ] Monitor for errors

## Success Metrics

### Week 1
- 100+ signups
- 50+ desktop app installs
- 10+ Pro subscriptions

### Month 1
- 1,000+ signups
- 500+ active users
- 50+ Pro subscriptions
- $750 MRR

### Month 3
- 5,000+ signups
- 2,000+ active users
- 200+ Pro subscriptions
- $3,000 MRR

## Support & Maintenance

### Ongoing Tasks
- Monitor Stripe webhooks
- Monitor Clerk webhooks
- Review usage patterns
- Respond to support emails
- Fix bugs
- Add requested features
- Update dependencies
- Security patches

### Monthly Reviews
- Review conversion rates
- Review churn rates
- Review usage patterns
- Review support tickets
- Plan feature roadmap

## Next Steps

1. **Review this plan** - Make sure everything aligns with your vision
2. **Set up accounts** - Clerk, Stripe, Supabase, Railway
3. **Start Phase 1** - Build website foundation
4. **Iterate quickly** - Ship MVP, gather feedback, improve

## Questions to Answer

1. What should the website URL be? (e.g., vantadictate.railway.app)
2. Do you want analytics from day 1? (Plausible, Umami, etc.)
3. Should we add a referral program? (future)
4. Should we add team accounts? (future)
5. What's the support email? (support@vantadictate.com)

---

**Ready to build a serious SaaS product!** 🚀
