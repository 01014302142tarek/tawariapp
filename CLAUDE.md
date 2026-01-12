# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TawariApp is a telemedicine platform for Egypt, connecting patients with licensed doctors via video consultations. It supports three user roles: patients, doctors, and admins, each with their own dashboard.

## Tech Stack

- **Framework**: Next.js 16 with App Router (not Pages Router)
- **Language**: TypeScript with strict mode
- **React**: 19.x with Server Components
- **Styling**: Tailwind CSS 4 with Framer Motion animations
- **Internationalization**: Custom i18n with English/Arabic and full RTL support
- **Deployment**: Vercel (uses `--webpack` flag to disable Turbopack for stability)

Backend services (planned/documented):
- Supabase PostgreSQL for database
- Firebase for phone authentication
- Paymob for Egypt payment processing
- Daily.co for video calls

## Video Calls (Daily.co)

Video consultations use Daily.co. To set up:

1. Create account at https://www.daily.co
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```
   DAILY_API_KEY=your_api_key_here
   NEXT_PUBLIC_DAILY_DOMAIN=your-domain.daily.co
   ```

Free tier includes 2,000 participant minutes/month.

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build (uses --webpack flag)
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Project Structure

```
app/
├── [lang]/                    # Dynamic locale segment (en/ar)
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout with I18nProvider
│   ├── dashboard/
│   │   ├── patient/          # Patient dashboard pages
│   │   ├── doctor/           # Doctor dashboard pages
│   │   └── admin/            # Admin dashboard pages
│   └── doctor-onboarding/    # Doctor registration flow
├── i18n.tsx                  # I18n context and translations
└── globals.css               # Global styles and Tailwind config

components/ui/                # Reusable UI components (Aceternity-style)
lib/utils.ts                 # cn() utility (clsx + tailwind-merge)
middleware.ts                # Locale detection and routing
```

## Key Architectural Patterns

### Internationalization (i18n)
- All routes are prefixed with `[lang]` parameter (`/en/...` or `/ar/...`)
- Middleware detects locale from: cookie (`NEXT_LOCALE`) → Accept-Language header → default (en)
- Use `useI18n()` hook for translations and RTL detection:
  ```typescript
  const { t, isRTL, language, setLanguage } = useI18n();
  ```
- HTML `dir` attribute is set dynamically based on language

### Theme System
- Each dashboard role (patient, doctor, admin) has its own ThemeContext
- Theme preference stored in localStorage per role
- System preference detection supported

### Component Patterns
- Root layouts are async server components
- Dashboard pages use `"use client"` for interactivity
- Sidebar width: 72px on desktop, hidden on mobile with hamburger menu
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes

### RTL Support
When adding UI elements, ensure they work for both LTR (English) and RTL (Arabic):
- Use logical properties (start/end) instead of left/right where appropriate
- Test layouts in both `/en/` and `/ar/` routes

## Test Users

Pre-seeded test accounts (16 total). All passwords follow the pattern `Tawari[Role][Number]!2024`.

| Email | Password | Role | Name |
|-------|----------|------|------|
| patient1@tawari.test | TawariPatient1!2024 | Patient | Ahmed Hassan |
| patient2@tawari.test | TawariPatient2!2024 | Patient | Fatima Ali |
| patient3@tawari.test | TawariPatient3!2024 | Patient | Omar Khalil |
| patient4@tawari.test | TawariPatient4!2024 | Patient | Mariam Saeed (elderly) |
| patient5@tawari.test | TawariPatient5!2024 | Patient | Youssef Nasser (child) |
| patient6@tawari.test | TawariPatient6!2024 | Patient | Nadia Mostafa (pregnant) |
| doctor1@tawari.test | TawariDoctor1!2024 | Doctor | Dr. Mohamed Ibrahim (Cardiology, verified) |
| doctor2@tawari.test | TawariDoctor2!2024 | Doctor | Dr. Nour El-Din (Dermatology, verified) |
| doctor3@tawari.test | TawariDoctor3!2024 | Doctor | Dr. Sara Ahmed (GP, verified) |
| doctor4@tawari.test | TawariDoctor4!2024 | Doctor | Dr. Hassan Mahmoud (Pediatrics, pending) |
| doctor5@tawari.test | TawariDoctor5!2024 | Doctor | Dr. Layla Farouk (Internal Med, under_review) |
| doctor6@tawari.test | TawariDoctor6!2024 | Doctor | Dr. Karim Youssef (Psychiatry, suspended) |
| admin1@tawari.test | TawariAdmin1!2024 | Admin | Sarah Admin (full_admin) |
| admin2@tawari.test | TawariAdmin2!2024 | Admin | Omar Admin (support_agent) |
| admin3@tawari.test | TawariAdmin3!2024 | Admin | Khaled Support (verification team) |
| assistant1@tawari.test | TawariAssistant1!2024 | Assistant | Heba (assigned to Dr. Mohamed) |

**Seeding Commands:**
```bash
# Basic seeding (6 core users + profiles)
npx tsx scripts/seed-test-users.ts

# Comprehensive demo seeding (16 users + full demo data)
npx tsx scripts/seed-comprehensive-demo.ts
# Then run: psql "$POSTGRES_URL_NON_POOLING" -f scripts/seed-comprehensive-demo.sql
```

## Documentation

Detailed specifications are available in:
- `TECH_STACK.md` - Complete technology stack with version matrix
- `docs/backend/` - Database schema, API endpoints, integrations
- `IMPLEMENTATION_PLAN.md` - Feature specifications and MVP scope
