# Vanta Dictate SaaS Platform - Requirements

## Overview
Transform Vanta Dictate from a standalone desktop app into a full SaaS product with user accounts, subscription billing, and usage limits. The platform will feel like a serious, premium SaaS with clean design, secure authentication, and seamless desktop app integration.

## User Stories

### 1. User Registration & Authentication
**As a new user**, I want to create an account easily so I can start using Vanta Dictate.

**Acceptance Criteria:**
- 1.1 User can sign up with email and password
- 1.2 User can sign up with magic link (email-only, no password)
- 1.3 Sign-up page follows the design inspiration (centered card, soft shadows, minimal fields)
- 1.4 Email verification is required before first use
- 1.5 User receives welcome email after signup
- 1.6 Sign-up form validates email format and password strength
- 1.7 User is automatically logged in after successful signup

### 2. User Login
**As a returning user**, I want to log in securely so I can access my account.

**Acceptance Criteria:**
- 2.1 User can log in with email and password
- 2.2 User can log in with magic link
- 2.3 Login page matches sign-up design system
- 2.4 "Forgot password" flow is available
- 2.5 User stays logged in across sessions (remember me)
- 2.6 Failed login attempts show clear error messages
- 2.7 User is redirected to dashboard after successful login

### 3. Desktop App Authentication
**As a desktop app user**, I want to log in through my browser so my credentials stay secure.

**Acceptance Criteria:**
- 3.1 Desktop app shows "Sign in to Vanta Dictate" on first launch
- 3.2 Clicking sign-in opens secure web login in default browser
- 3.3 After web login, auth token is returned to desktop app
- 3.4 Desktop app stores auth token securely (encrypted)
- 3.5 Desktop app displays user's plan (Free or Pro)
- 3.6 Desktop app displays remaining quota for free users
- 3.7 Desktop app validates token on startup
- 3.8 Desktop app handles token expiration gracefully
- 3.9 User can log out from desktop app
- 3.10 No password fields are embedded in desktop app

### 4. Free Tier Usage
**As a free user**, I want to use Vanta Dictate with reasonable limits so I can evaluate the product.

**Acceptance Criteria:**
- 4.1 Free users get 60 minutes of dictation per day
- 4.2 Usage counter tracks dictation time accurately
- 4.3 Usage resets daily at midnight (user's timezone)
- 4.4 Desktop app shows remaining time in settings
- 4.5 When limit is reached, user sees calm message: "You've reached today's free limit. Pro removes limits so you can keep going."
- 4.6 No interruptions mid-sentence or mid-recording
- 4.7 No countdown timers or anxiety-inducing UI
- 4.8 Free users can only use local Whisper (base model)
- 4.9 Free users cannot access smart formatting
- 4.10 Free users cannot create custom snippets

### 5. Pro Subscription
**As a user who needs unlimited dictation**, I want to upgrade to Pro so I can use Vanta Dictate all day.

**Acceptance Criteria:**
- 5.1 Pro plan costs $15/month
- 5.2 User can subscribe via Stripe Checkout
- 5.3 Pro users get unlimited dictation time
- 5.4 Pro users can use Lightning Mode (faster/raw)
- 5.5 Pro users can use Smart Formatting
- 5.6 Pro users can create custom snippets
- 5.7 Pro users get multi-language auto-detect
- 5.8 Pro users get priority model options
- 5.9 Pro users get early access to Agent Mode (future)
- 5.10 Subscription status syncs to desktop app within 1 minute
- 5.11 Failed payments show clear notification
- 5.12 User can cancel subscription anytime

### 6. Account Dashboard
**As a logged-in user**, I want to view my account details and usage so I can manage my subscription.

**Acceptance Criteria:**
- 6.1 Dashboard uses glassmorphism sidebar design
- 6.2 Sidebar shows: Overview, Billing, Account, Support
- 6.3 Overview page shows current plan (Free or Pro)
- 6.4 Overview page shows usage stats for free users
- 6.5 Overview page shows "Upgrade to Pro" CTA for free users
- 6.6 Overview page shows "Download App" button
- 6.7 Dashboard is dark mode by default
- 6.8 Dashboard is responsive (mobile-friendly)
- 6.9 User can navigate between sections smoothly
- 6.10 Dashboard loads quickly (<2s)

### 7. Billing Management
**As a Pro user**, I want to manage my subscription so I can update payment or cancel.

**Acceptance Criteria:**
- 7.1 Billing page shows current subscription status
- 7.2 Billing page shows next billing date
- 7.3 Billing page shows payment method (last 4 digits)
- 7.4 User can click "Manage Billing" to open Stripe Customer Portal
- 7.5 Stripe portal opens in new tab
- 7.6 User can update payment method in Stripe portal
- 7.7 User can cancel subscription in Stripe portal
- 7.8 Cancellation takes effect at end of billing period
- 7.9 User receives email confirmation of billing changes
- 7.10 Billing page shows invoice history

### 8. Landing Page
**As a potential user**, I want to understand what Vanta Dictate does so I can decide to sign up.

**Acceptance Criteria:**
- 8.1 Hero section: "Speak. It types. Everywhere."
- 8.2 Short demo GIF showing dictation in action
- 8.3 Privacy-first messaging (local processing, no cloud)
- 8.4 Clear CTA: "Get Started Free"
- 8.5 Pricing section shows Free vs Pro comparison
- 8.6 Features section highlights key benefits
- 8.7 FAQ section answers common questions
- 8.8 Footer with links to privacy policy, terms, support
- 8.9 Landing page is fast (<1s load)
- 8.10 Landing page is SEO-optimized

### 9. Usage Tracking
**As the system**, I need to track user dictation time so I can enforce free tier limits.

**Acceptance Criteria:**
- 9.1 Desktop app sends usage events to backend API
- 9.2 Backend stores usage in database (user_id, duration, timestamp)
- 9.3 Backend calculates daily usage on-demand
- 9.4 Desktop app queries remaining quota before recording
- 9.5 Usage data is accurate within 1 second
- 9.6 Usage data persists across app restarts
- 9.7 Usage data is timezone-aware
- 9.8 Pro users have usage tracked but no limits enforced
- 9.9 Usage API is rate-limited to prevent abuse
- 9.10 Usage data is retained for 90 days

### 10. Security & Privacy
**As a user**, I want my data to be secure so I can trust Vanta Dictate.

**Acceptance Criteria:**
- 10.1 All API requests use HTTPS
- 10.2 Auth tokens are JWT with expiration
- 10.3 Passwords are hashed with bcrypt (handled by Clerk)
- 10.4 Desktop app stores tokens in encrypted storage
- 10.5 No audio data is sent to backend
- 10.6 No transcription data is sent to backend
- 10.7 Usage tracking only sends duration, not content
- 10.8 User can delete account and all data
- 10.9 Privacy policy is clear and accessible
- 10.10 GDPR-compliant data handling

## Technical Requirements

### Frontend (Website)
- Next.js 14+ (App Router)
- Tailwind CSS
- shadcn/ui components
- TypeScript
- Deployed on Vercel or Railway

### Authentication
- Clerk for auth
- Email + password
- Magic link support
- Session management
- Webhook integration for user events

### Billing
- Stripe for payments
- Subscription model ($15/month)
- Customer Portal for self-service
- Webhook integration for subscription events
- Invoice generation

### Backend / Database
- Supabase (PostgreSQL)
- Tables: users, subscriptions, usage_logs
- Row-level security (RLS)
- Real-time subscriptions (optional)
- API routes in Next.js

### Desktop App Integration
- OAuth-style web login flow
- Secure token storage (Tauri secure storage)
- API client for backend communication
- Usage tracking integration
- Plan enforcement logic

## Design System

### Colors
- Background: #0B0E14 (dark)
- Surface: #111621
- Card: #151B2C
- Accent: #6AE3FF (cyan)
- Text Primary: #E6EAF2
- Text Secondary: #9AA4BF

### Typography
- Font: Inter
- Headings: 500 weight
- Body: 400 weight

### Components
- Glassmorphism panels (backdrop blur, subtle borders)
- Soft shadows
- Smooth transitions
- Minimal, clean layouts
- Premium feel

## Success Metrics
- User signup conversion rate > 20%
- Free to Pro conversion rate > 5%
- Average daily usage (free users) > 30 minutes
- Churn rate < 5% monthly
- App login success rate > 99%

## Out of Scope (Future Phases)
- Team accounts
- API access
- Mobile apps
- Cloud transcription
- Agent Mode (mentioned but not implemented yet)
- Custom model training
- Integrations (Slack, Discord, etc.)

## Dependencies
- Clerk account and API keys
- Stripe account and API keys
- Supabase project
- Domain name (future)
- Vercel/Railway deployment

## Risks & Mitigations
- **Risk**: Stripe webhook failures
  - **Mitigation**: Implement retry logic and manual sync endpoint
- **Risk**: Desktop app can't reach backend
  - **Mitigation**: Graceful offline mode, queue usage events
- **Risk**: Free tier abuse
  - **Mitigation**: Rate limiting, device fingerprinting
- **Risk**: Token theft
  - **Mitigation**: Short expiration, refresh tokens, secure storage
