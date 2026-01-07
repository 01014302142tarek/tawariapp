# Environment Variables

**Last Updated:** January 2, 2026

This document lists all environment variables required for TawariApp.

---

## Quick Reference

| Category | Count | Source |
|----------|-------|--------|
| Supabase | 3 | Vercel Marketplace (auto) |
| Sentry | 3 | Vercel Marketplace (auto) |
| Paymob | 4 | Manual |
| Twilio | 3 | Manual |
| Resend | 1 | Manual |
| Jitsi | 1 | Default value |
| App | 1 | Manual |

**Total: 16 variables** (6 auto-synced, 10 manual)

---

## Auto-Synced Variables (Vercel Marketplace)

These are automatically added when you connect via Vercel Marketplace.

### Supabase

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co

# Supabase Anon Key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Setup:** https://vercel.com/marketplace/supabase

---

### Sentry

```env
# Sentry DSN for error tracking
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx

# Sentry organization name
SENTRY_ORG=tawariapp

# Sentry project name
SENTRY_PROJECT=tawariapp-web
```

**Setup:** https://vercel.com/marketplace/sentry

---

## Manual Variables

### Paymob

```env
# Paymob API Key
# Found in: Paymob Dashboard > Developers > API Key
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5...

# Paymob Integration ID (Card payments)
# Found in: Paymob Dashboard > Developers > Integration IDs
PAYMOB_INTEGRATION_ID=1234567

# Paymob IFrame ID
# Found in: Paymob Dashboard > Developers > iFrames
PAYMOB_IFRAME_ID=765432

# Paymob HMAC Secret (for webhook verification)
# Found in: Paymob Dashboard > Developers > HMAC
PAYMOB_HMAC_SECRET=your_hmac_secret_here
```

**How to get:**
1. Register at https://accept.paymob.com
2. Complete merchant verification (2-4 weeks)
3. Go to Developers section
4. Copy each value from the respective tabs

---

### Twilio

```env
# Twilio Account SID
# Found in: Twilio Console Dashboard
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Auth Token
# Found in: Twilio Console Dashboard
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Phone Number (SMS capable)
# Found in: Twilio Console > Phone Numbers
TWILIO_PHONE_NUMBER=+1234567890
```

**How to get:**
1. Sign up at https://www.twilio.com/try-twilio
2. Copy Account SID and Auth Token from dashboard
3. Buy a phone number with SMS capability

---

### Resend

```env
# Resend API Key
# Found in: Resend Dashboard > API Keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get:**
1. Sign up at https://resend.com
2. Go to API Keys
3. Create new key and copy (shown only once!)

---

### Jitsi

```env
# Jitsi Meet Domain
# Uses free public server for MVP
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
```

**Options:**
- `meet.jit.si` - Free public server (MVP)
- `8x8.vc` - 8x8 Jitsi-as-a-Service (Production)

---

### App Configuration

```env
# Application URL
# Development: http://localhost:3000
# Production: Your Vercel domain
NEXT_PUBLIC_APP_URL=https://tawariapp.vercel.app
```

---

## Complete .env.example

```env
# ================================
# AUTO-SYNCED (Vercel Marketplace)
# ================================
# These are automatically set when you connect Supabase and Sentry
# via Vercel Marketplace. You don't need to set them manually.

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sentry
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# ================================
# MANUAL SETUP REQUIRED
# ================================

# Paymob (Payments)
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
PAYMOB_HMAC_SECRET=

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend (Email)
RESEND_API_KEY=

# Jitsi (Video)
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Vercel Configuration

### Adding Variables in Vercel

1. Go to your Vercel project
2. Navigate to **Settings > Environment Variables**
3. Add each manual variable
4. Set appropriate scope:
   - **Production**: Production deployments only
   - **Preview**: PR preview deployments
   - **Development**: Local development

### Sensitive Variables

Mark these as **Sensitive** in Vercel:
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYMOB_API_KEY`
- `PAYMOB_HMAC_SECRET`
- `TWILIO_AUTH_TOKEN`
- `RESEND_API_KEY`

---

## Validation Script

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Paymob
  PAYMOB_API_KEY: z.string().min(1),
  PAYMOB_INTEGRATION_ID: z.string().min(1),
  PAYMOB_IFRAME_ID: z.string().min(1),
  PAYMOB_HMAC_SECRET: z.string().min(1),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().startsWith('AC'),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().startsWith('+'),

  // Resend
  RESEND_API_KEY: z.string().startsWith('re_'),

  // Jitsi
  NEXT_PUBLIC_JITSI_DOMAIN: z.string().min(1),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Invalid environment variables')
  }

  return result.data
}
```

---

## Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Add `.env.local` to `.gitignore`
- [ ] Use environment-specific values (dev vs prod)
- [ ] Mark sensitive variables in Vercel
- [ ] Rotate keys periodically
- [ ] Limit Supabase anon key permissions via RLS
