# Backend Setup Plan

A step-by-step guide to create all required accounts and obtain environment variables for TawariApp.

---

## Services to Setup

| # | Service | Purpose | Setup Via | Cost (MVP) |
|---|---------|---------|-----------|------------|
| 1 | Supabase | Database + Storage + Auth | Vercel Marketplace | Free |
| 2 | Sentry | Error Monitoring | Vercel Marketplace | Free |
| 3 | Paymob | Payments (Egypt) | Manual | Per-transaction |
| 4 | Twilio | SMS Notifications | Manual | ~$0.05/SMS |
| 5 | Resend | Email | Manual | Free (3K/month) |
| 6 | Jitsi | Video Calls | None needed | Free |

> **Note:** Starting with Supabase email auth. Phone auth will be added later.

**Total Variables:** 15

---

## Part 1: Vercel Marketplace (Auto-configured)

These integrate directly with Vercel - env vars sync automatically!

### Step 1: Supabase (via Vercel)

Supabase handles: Database, File Storage, and Email Authentication.

1. Go to https://vercel.com/marketplace/supabase
2. Click **Add Integration**
3. Select your Vercel project (TawariApp)
4. Create new Supabase project:
   - Name: `tawariapp`
   - Region: `EU West`
5. Done! Env vars are auto-synced:

```env
# Auto-added to Vercel:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

6. Go to Supabase dashboard → **Authentication → Providers**
   - Email is enabled by default ✓
   - Configure email templates (optional)

7. Go to **Storage** → Create buckets:
   - `avatars` (Public)
   - `documents` (Private)
   - `prescriptions` (Private)

---

### Step 2: Sentry (via Vercel)

1. Go to https://vercel.com/marketplace/sentry
2. Click **Add Integration**
3. Select your Vercel project
4. Create Sentry project: `tawariapp-web`
5. Done! Env vars are auto-synced:

```env
# Auto-added to Vercel:
SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
```

---

## Part 2: Manual Setup

### Step 3: Paymob

**URL:** https://accept.paymob.com

> ⚠️ Takes 2-4 weeks for verification. Start this first!

1. Click **Register**
2. Fill business details
3. Submit documents:
   - Commercial Registration
   - Tax Card
   - National ID
   - Bank statement
4. Wait for approval
5. After approval, go to **Developers** and copy:

```env
PAYMOB_API_KEY=ZXlK...
PAYMOB_INTEGRATION_ID=123456
PAYMOB_IFRAME_ID=654321
PAYMOB_HMAC_SECRET=abc123...
```

6. Go to **Webhooks** → Add: `https://tawariapp.vercel.app/api/webhooks/paymob`

---

### Step 4: Twilio

**URL:** https://www.twilio.com/try-twilio

For appointment reminders and notifications (not auth).

1. Sign up with email
2. Verify your phone
3. Go to **Console Dashboard** and copy:
   - Account SID
   - Auth Token
4. Go to **Phone Numbers → Buy a number** (SMS capable)

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

### Step 5: Resend

**URL:** https://resend.com

For transactional emails (receipts, notifications).

1. Sign up with GitHub
2. Go to **API Keys → Create API Key**
3. Name: `tawariapp`
4. Copy key (shown once!):

```env
RESEND_API_KEY=re_xxxxxxxx
```

---

### Step 6: Jitsi

No account needed! Uses free public server.

```env
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
```

---

## Environment Variables Summary

### Auto-synced by Vercel Marketplace:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

### Add manually to Vercel:

```env
# PAYMOB
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
PAYMOB_HMAC_SECRET=

# TWILIO
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# RESEND
RESEND_API_KEY=

# JITSI
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# APP
NEXT_PUBLIC_APP_URL=https://tawariapp.vercel.app
```

---

## Setup Checklist

### Via Vercel Marketplace (auto-config)
- [ ] Add Supabase integration
- [ ] Enable email auth in Supabase
- [ ] Create storage buckets in Supabase
- [x] Add Sentry integration (DONE)

### Manual Setup
- [ ] Register Paymob merchant (start early - takes weeks!)
- [ ] Create Twilio account + buy number
- [ ] Create Resend account
- [ ] Add manual env vars to Vercel

### Database Setup
- [ ] Run database schema SQL in Supabase (see supabase/migrations/)

---

## Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr twilio resend

npx @sentry/wizard@latest -i nextjs
```

---

## Future: Adding Phone Auth

When ready to add phone authentication:

1. Go to Supabase → **Authentication → Providers**
2. Enable **Phone** provider
3. Configure Twilio credentials in Supabase:
   - Account SID
   - Auth Token
   - Message Service SID
4. Update login UI to support phone + OTP
