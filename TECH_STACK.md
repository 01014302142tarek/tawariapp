# TawariApp - Detailed Technology Stack

**Document Type:** Technology Stack Specification  
**Created:** December 11, 2025  
**Last Updated:** December 11, 2025  
**Platform:** Web Application (Next.js on Vercel)

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Frontend Technologies](#frontend-technologies)
3. [Backend Technologies](#backend-technologies)
4. [Database & Storage](#database--storage)
5. [Authentication](#authentication)
6. [Video Calling](#video-calling)
7. [Payments](#payments)
8. [DevOps & Hosting](#devops--hosting)
9. [Development Tools](#development-tools)
10. [Version Matrix](#version-matrix)

---

## Stack Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         TawariApp Architecture                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        FRONTEND                                   │   │
│   │  Next.js 15 │ React 19 │ TypeScript │ Tailwind CSS │ RTL        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      BACKEND LAYER                                │   │
│   │  Next.js API Routes │ Server Actions │ Edge Functions            │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│   ┌──────────────┬──────────────┬──────────────┬──────────────┐        │
│   │   SUPABASE   │   FIREBASE   │    JITSI     │   PAYMOB     │        │
│   │  PostgreSQL  │  Phone Auth  │  Video Calls │  Payments    │        │
│   │  Storage     │  Push Notif  │              │              │        │
│   │  Real-time   │              │              │              │        │
│   └──────────────┴──────────────┴──────────────┴──────────────┘        │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                         HOSTING                                   │   │
│   │                    Vercel (Edge Network)                          │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Technologies

### Core Framework

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Next.js** | 15.x | Full-stack React framework | App Router, Server Components, API routes, great DX |
| **React** | 19.x | UI library | Latest features, concurrent rendering, Server Components |
| **TypeScript** | 5.x | Type safety | Catch errors early, better IDE support, safer refactoring |

### Styling

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Tailwind CSS** | 3.4.x | Utility-first CSS | Fast development, small bundle, RTL plugin available |
| **tailwindcss-rtl** | 3.x | RTL support | Automatic RTL utilities for Arabic layout |
| **Headless UI** | 2.x | Accessible components | Unstyled, accessible primitives (modals, dropdowns) |

### Arabic & Fonts

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Cairo Font** | Google Fonts | Arabic typography | Modern, clean, excellent Arabic support |
| **Noto Sans Arabic** | Google Fonts | Fallback font | Wide character coverage |
| **next/font** | Built-in | Font optimization | Automatic font subsetting, no layout shift |

### State Management

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **React Query** | 5.x | Server state | Caching, background refetching, optimistic updates |
| **Zustand** | 4.x | Client state | Simple, minimal boilerplate, TypeScript-friendly |
| **nuqs** | 1.x | URL state | Type-safe URL search params for filters |

### Forms & Validation

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **React Hook Form** | 7.x | Form handling | Minimal re-renders, great performance |
| **Zod** | 3.x | Schema validation | TypeScript-first, runtime validation, works with RHF |
| **@hookform/resolvers** | 3.x | RHF + Zod bridge | Connect Zod schemas to React Hook Form |

### UI Components

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Lucide React** | Latest | Icons | Clean icons, tree-shakeable, RTL-friendly |
| **Sonner** | 1.x | Toast notifications | Beautiful, accessible, RTL support |
| **date-fns** | 3.x | Date formatting | Modular, Arabic locale support |

---

## Backend Technologies

### API Layer

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Next.js API Routes** | 15.x | REST APIs | Same deployment, edge-ready, TypeScript |
| **Next.js Server Actions** | 15.x | Mutations | Type-safe, no API boilerplate, progressive enhancement |
| **Edge Functions** | Vercel | Webhooks | Low latency, global distribution |

### Backend Utilities

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Zod** | 3.x | Request validation | Validate API inputs, generate types |
| **jose** | 5.x | JWT handling | Edge-compatible JWT verification |
| **nanoid** | 5.x | ID generation | Short, URL-safe unique IDs |

---

## Database & Storage

### Supabase Platform

| Service | Purpose | Details |
|---------|---------|---------|
| **PostgreSQL** | Primary database | Managed PostgreSQL, Row-Level Security |
| **Supabase Storage** | File storage | Doctor documents, avatars, prescriptions |
| **Supabase Realtime** | Live updates | Doctor availability, consultation status |

### Database Specifications

```yaml
Database: PostgreSQL 15
Extensions:
  - uuid-ossp (UUID generation)
  - pgcrypto (encryption functions)
  
Supabase Tier: Free (MVP)
Limits:
  - Database: 500 MB
  - Storage: 1 GB
  - Bandwidth: 2 GB/month
  - API requests: Unlimited
  - Realtime: 200 concurrent connections
```

### Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | Public | User profile photos |
| `documents` | Private | Doctor licenses, IDs (admin-only access) |
| `prescriptions` | Private | Signed prescription PDFs |

---

## Authentication

### Firebase Authentication

| Feature | Purpose | Details |
|---------|---------|---------|
| **Phone Auth** | Primary login | Egyptian phone numbers (+20) |
| **SMS OTP** | Verification | 6-digit codes via SMS |
| **Custom Claims** | Role-based access | `role: 'patient' | 'doctor' | 'admin'` |
| **ID Tokens** | API authentication | JWT tokens for backend verification |

### Authentication Flow

```
1. User enters phone number (+20XXXXXXXXXX)
2. Firebase sends SMS OTP
3. User enters 6-digit code
4. Firebase verifies and returns ID token
5. Frontend stores token (httpOnly cookie)
6. API routes verify token with Firebase Admin SDK
7. Supabase RLS uses token claims for authorization
```

### Firebase Configuration

```yaml
Project: tawariapp
Region: europe-west1 (closest to Egypt)
Authentication:
  - Phone auth: Enabled
  - Email auth: Disabled (MVP)
  
Firebase Admin SDK: 
  - Used in Next.js API routes
  - Verifies ID tokens
  - Sets custom claims for roles
```

---

## Video Calling

### Jitsi Meet Integration

| Approach | MVP | Production |
|----------|-----|------------|
| **Service** | Public meet.jit.si | 8x8 JaaS (Jitsi-as-a-Service) |
| **Integration** | IFrame API | IFrame API + JWT auth |
| **Cost** | Free | $0.0018/participant-minute |
| **Recording** | Not available | Available with JaaS |

### Jitsi Configuration

```javascript
// MVP Configuration
const jitsiConfig = {
  domain: 'meet.jit.si',
  roomName: `tawari-${consultationId}`,
  configOverwrite: {
    startWithAudioMuted: true,
    startWithVideoMuted: false,
    prejoinPageEnabled: false,
    disableDeepLinking: true,
    lang: 'ar', // Arabic interface
  },
  interfaceConfigOverwrite: {
    SHOW_JITSI_WATERMARK: false,
    TOOLBAR_BUTTONS: [
      'microphone', 'camera', 'chat',
      'hangup', 'tileview', 'fullscreen'
    ],
  },
};
```

### Video Call Features (MVP)

| Feature | Status | Notes |
|---------|--------|-------|
| Video call | ✅ | Jitsi iframe |
| Audio-only | ✅ | Toggle video off |
| Chat | ✅ | Built into Jitsi |
| Screen share | ⚠️ | Available but not promoted |
| Recording | ❌ | Post-MVP (requires JaaS) |
| Custom branding | ❌ | Post-MVP (requires JaaS) |

---

## Payments

### Paymob Integration (Primary Gateway)

| Aspect | Details |
|--------|---------|
| **Provider** | Paymob (accept.paymob.com) |
| **Integration** | Hosted payment page (iframe) |
| **Methods** | Cards, mobile wallets (Vodafone Cash, etc.) |
| **Fees** | 2.75% + EGP 3 per transaction |
| **Settlement** | T+1 (next business day) |

### Payment Flow

```
1. Patient clicks "Pay Now"
2. Backend calls Paymob Auth API (get token)
3. Backend creates Paymob order
4. Backend requests payment key
5. Frontend opens Paymob iframe with payment key
6. Patient completes payment
7. Paymob redirects to callback URL
8. Paymob sends webhook to /api/webhooks/paymob
9. Backend updates payment status
10. Consultation status updated to "scheduled"
```

### Paymob API Endpoints

```yaml
Authentication:
  URL: https://accept.paymob.com/api/auth/tokens
  Method: POST
  
Order Registration:
  URL: https://accept.paymob.com/api/ecommerce/orders
  Method: POST
  
Payment Key:
  URL: https://accept.paymob.com/api/acceptance/payment_keys
  Method: POST
  
Iframe:
  URL: https://accept.paymob.com/api/acceptance/iframes/{iframe_id}
  Param: payment_token={payment_key}
```

### Payment Methods (MVP)

| Method | Status | Notes |
|--------|--------|-------|
| Visa/Mastercard | ✅ | Default |
| Vodafone Cash | ✅ | Via Paymob |
| Orange Money | ✅ | Via Paymob |
| Fawry | ❌ | Phase 2 (separate integration) |
| ValU BNPL | ❌ | Phase 3 |

---

## DevOps & Hosting

### Vercel (Primary Host)

| Feature | Details |
|---------|---------|
| **Plan** | Hobby (Free) → Pro when scale |
| **Edge Network** | Global CDN, ~40ms to Egypt |
| **Serverless Functions** | Next.js API routes |
| **Edge Functions** | Webhooks, middleware |
| **Analytics** | Built-in web analytics |

### Deployment

```yaml
Production:
  Branch: main
  Domain: tawariapp.vercel.app (then custom domain)
  
Preview:
  Branch: feature/*
  Domain: Auto-generated preview URLs
  
Build:
  Command: npm run build
  Output: .next/
  
Environment Variables:
  - Stored in Vercel dashboard
  - Different values per environment
```

### CI/CD Pipeline

```
1. Push to GitHub
2. Vercel detects changes
3. Runs: npm install
4. Runs: npm run build
5. Runs: npm run lint (if configured)
6. Deploys to edge network
7. Preview URL generated (for PRs)
8. Auto-promote to production (main branch)
```

---

## Development Tools

### Code Quality

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 8.x | Linting |
| **Prettier** | 3.x | Formatting |
| **TypeScript** | 5.x | Type checking |
| **Husky** | 9.x | Git hooks |
| **lint-staged** | 15.x | Pre-commit checks |

### Testing (Post-MVP)

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing |
| **React Testing Library** | Component testing |
| **Playwright** | E2E testing |

### IDE

| Tool | Extensions |
|------|------------|
| **VS Code** | ESLint, Prettier, Tailwind IntelliSense |
| **Cursor** | AI assistance, same extensions |

---

## Version Matrix

### Production Dependencies

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.6.0",
  
  "tailwindcss": "^3.4.0",
  "tailwindcss-rtl": "^3.0.0",
  
  "@supabase/supabase-js": "^2.45.0",
  "@supabase/ssr": "^0.5.0",
  
  "firebase": "^10.14.0",
  "firebase-admin": "^12.6.0",
  
  "@tanstack/react-query": "^5.59.0",
  "zustand": "^4.5.0",
  
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.0",
  "@hookform/resolvers": "^3.9.0",
  
  "@jitsi/react-sdk": "^1.4.0",
  
  "date-fns": "^3.6.0",
  "lucide-react": "^0.453.0",
  "sonner": "^1.5.0",
  "nanoid": "^5.0.0"
}
```

### Development Dependencies

```json
{
  "@types/node": "^22.0.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  
  "eslint": "^8.57.0",
  "eslint-config-next": "^15.0.0",
  "prettier": "^3.3.0",
  "prettier-plugin-tailwindcss": "^0.6.0",
  
  "husky": "^9.1.0",
  "lint-staged": "^15.2.0"
}
```

---

## Environment Variables

### Required for MVP

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tawariapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tawariapp

# Firebase Admin
FIREBASE_PROJECT_ID=tawariapp
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tawariapp.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Paymob
PAYMOB_API_KEY=ZXlKaGtHl...
PAYMOB_INTEGRATION_ID=123456
PAYMOB_IFRAME_ID=654321
PAYMOB_HMAC_SECRET=abc123...

# Jitsi
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# App
NEXT_PUBLIC_APP_URL=https://tawariapp.vercel.app
```

---

## Cost Analysis (MVP)

| Service | Free Tier | Estimated Monthly |
|---------|-----------|-------------------|
| **Vercel** | 100GB bandwidth | $0 |
| **Supabase** | 500MB DB, 1GB storage | $0 |
| **Firebase Auth** | 10K verifications | $0 |
| **Jitsi (public)** | Unlimited | $0 |
| **Paymob** | Per-transaction | Variable |
| **Domain** | - | ~$1/month |
| **Total** | - | **~$0-10/month** |

### Scaling Costs (When Needed)

| Service | Paid Tier | Cost |
|---------|-----------|------|
| Vercel Pro | More bandwidth | $20/month |
| Supabase Pro | 8GB DB, 100GB storage | $25/month |
| Firebase Blaze | Pay-as-you-go | ~$0.06 per verification |
| 8x8 JaaS | Jitsi managed | $0.0018/min |

---

## Security Considerations

### Authentication Security
- ✅ Firebase handles phone verification security
- ✅ ID tokens verified server-side
- ✅ httpOnly cookies for session storage
- ✅ CSRF protection via SameSite cookies

### Database Security
- ✅ Supabase RLS enforces row-level access
- ✅ Service role key only used server-side
- ✅ Anon key has limited access (defined by RLS)

### API Security
- ✅ All mutations require authentication
- ✅ Input validation with Zod
- ✅ Rate limiting via Vercel/middleware
- ✅ CORS configured for production domain

### Frontend Security
- ✅ Next.js built-in XSS protection
- ✅ Content Security Policy headers
- ✅ No sensitive data in client-side state

---

*This technology stack provides a modern, cost-effective, and scalable foundation for TawariApp's MVP and future growth.*
