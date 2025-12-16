# Environment Variables

**Last Updated:** December 11, 2025

This document lists all environment variables required for TawariApp.

---

## Quick Reference

| Category | Count | Required for MVP |
|----------|-------|------------------|
| Supabase | 3 | ✅ All |
| Firebase Client | 3 | ✅ All |
| Firebase Admin | 3 | ✅ All |
| Paymob | 4 | ✅ All |
| Jitsi | 1 | ✅ |
| App | 1 | ✅ |

---

## Required Variables

### Supabase

```env
# Supabase Project URL
# Found in: Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co

# Supabase Anon Key (safe for client-side)
# Found in: Supabase Dashboard > Settings > API > Project API keys
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (server-side only, NEVER expose to client)
# Found in: Supabase Dashboard > Settings > API > Project API keys
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the values

---

### Firebase Client (Public)

```env
# Firebase API Key
# Found in: Firebase Console > Project Settings > General > Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC-abcdefghijklmnopqrstuvwxyz

# Firebase Auth Domain
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tawariapp.firebaseapp.com

# Firebase Project ID
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tawariapp
```

**How to get:**
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. If no app exists, create a Web app
6. Copy the config values

---

### Firebase Admin (Server-side)

```env
# Firebase Project ID (same as client)
FIREBASE_PROJECT_ID=tawariapp

# Firebase Service Account Email
# Found in: Firebase Console > Project Settings > Service Accounts
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tawariapp.iam.gserviceaccount.com

# Firebase Private Key (from service account JSON)
# IMPORTANT: Keep the quotes and \n characters
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0B...\n-----END PRIVATE KEY-----\n"
```

**How to get:**
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract `client_email` and `private_key` from the JSON

**Important Notes:**
- The private key must include `\n` for newlines
- Wrap the entire key in double quotes
- Never commit this to version control

---

### Paymob

```env
# Paymob API Key
# Found in: Paymob Dashboard > Developers > API Key
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5...

# Paymob Integration ID
# Found in: Paymob Dashboard > Developers > Integration IDs
# Use the "Card" integration ID for card payments
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
2. Complete merchant verification
3. Go to Developers section
4. Copy each value from the respective tabs

**Note:** Paymob merchant registration may take 2-4 weeks for verification.

---

### Jitsi

```env
# Jitsi Meet Domain
# For MVP: Use public meet.jit.si
# For Production: Use 8x8 JaaS or self-hosted
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
```

**Options:**
- `meet.jit.si` - Free public server (MVP)
- `8x8.vc` - 8x8 Jitsi-as-a-Service (Production)
- `your.self-hosted.domain` - Self-hosted Jitsi

---

### App Configuration

```env
# Application URL
# For development: http://localhost:3000
# For production: Your Vercel domain
NEXT_PUBLIC_APP_URL=https://tawariapp.vercel.app
```

---

## Optional Variables

### Development

```env
# Enable debug logging
DEBUG=true

# Skip phone verification (development only)
SKIP_PHONE_VERIFICATION=false
```

### Analytics (Post-MVP)

```env
# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Error Tracking (Post-MVP)

```env
# Sentry
SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

---

## Environment Files

### File Structure

```
tawariapp/
├── .env.local          # Local development (gitignored)
├── .env.example        # Template for developers
└── .env.production     # Production values (set in Vercel)
```

### .env.example

```env
# Copy this file to .env.local and fill in the values

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Paymob
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
PAYMOB_HMAC_SECRET=

# Jitsi
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Vercel Configuration

### Setting Environment Variables in Vercel

1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add each variable with appropriate scope:
   - **Production**: Only production deployments
   - **Preview**: Preview deployments (PRs)
   - **Development**: Local development (optional)

### Sensitive Variables

Mark these as **Sensitive** in Vercel:
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_PRIVATE_KEY`
- `PAYMOB_API_KEY`
- `PAYMOB_HMAC_SECRET`

### Variable Type

Set `FIREBASE_PRIVATE_KEY` as a **multi-line** variable in Vercel, or ensure `\n` characters are preserved.

---

## Validation Script

Add this to validate environment variables on app start:

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Firebase Client
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  
  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().includes('-----BEGIN PRIVATE KEY-----'),
  
  // Paymob
  PAYMOB_API_KEY: z.string().min(1),
  PAYMOB_INTEGRATION_ID: z.string().min(1),
  PAYMOB_IFRAME_ID: z.string().min(1),
  PAYMOB_HMAC_SECRET: z.string().min(1),
  
  // Jitsi
  NEXT_PUBLIC_JITSI_DOMAIN: z.string().min(1),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
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
- [ ] Rotate keys periodically
- [ ] Limit Supabase anon key permissions via RLS
- [ ] Monitor Firebase Auth usage
- [ ] Keep Paymob credentials secure
- [ ] Document all variables in `.env.example`

---

*This environment variables guide ensures consistent configuration across development and production.*
