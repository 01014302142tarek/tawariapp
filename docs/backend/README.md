# Backend Documentation

This folder contains detailed backend implementation specifications for TawariApp.

## Contents

| File | Description | Status |
|------|-------------|--------|
| [backend-plan.md](./backend-plan.md) | Core architecture, user roles, permissions, policy decisions | Current |
| [development-roadmap.md](./development-roadmap.md) | 8-phase sequential implementation plan | Current |
| [database-schema.md](./database-schema.md) | Complete ERD with 35 tables | Current |
| [setup-plan.md](./setup-plan.md) | Step-by-step service account setup | Current |
| [api-endpoints.md](./api-endpoints.md) | REST API endpoints specification | Needs Update |
| [integrations.md](./integrations.md) | External service integration code | Needs Update |
| [environment-variables.md](./environment-variables.md) | All environment variables | Current |

## Architecture Overview

TawariApp uses a **serverless backend** approach:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Application                          │
├─────────────────────────────────────────────────────────────────┤
│  Server Components    │  API Routes    │  Server Actions       │
│  (Data fetching)      │  (REST APIs)   │  (Mutations)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Supabase   │  │    Jitsi     │  │   Paymob     │          │
│  │ (Data+Auth)  │  │   (Video)    │  │  (Payments)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Twilio     │  │   Resend     │  │   Sentry     │          │
│  │   (SMS)      │  │   (Email)    │  │  (Errors)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Services

| Service | Purpose | Setup |
|---------|---------|-------|
| **Supabase** | Database, Storage, Auth | Vercel Marketplace |
| **Sentry** | Error Monitoring | Vercel Marketplace |
| **Paymob** | Payments (Egypt) | Manual (2-4 weeks) |
| **Twilio** | SMS Notifications | Manual |
| **Resend** | Email | Manual |
| **Jitsi** | Video Calls | None (free) |

## Authentication

- **Phase 1 (Current):** Email/Password via Supabase Auth
- **Phase 2 (Future):** Phone OTP via Supabase + Twilio

## Key Principles

1. **No Separate Backend Server** - Everything runs on Vercel
2. **Database-First Security** - Supabase RLS enforces access control
3. **Type-Safe End-to-End** - TypeScript from database to frontend
4. **Edge-Ready** - Critical APIs can run on Vercel Edge

## User Roles

TawariApp supports 5 user types:
- **Patients** - Primary users seeking medical consultations
- **Doctors** - Licensed medical professionals (require verification)
- **Admins** - Platform managers with elevated access
- **Doctor Assistants** - Support staff for doctors (optional delegation)
- **Admin Assistants** - Support staff for administrative operations

See [backend-plan.md](./backend-plan.md) for detailed permissions matrix.

## Quick Start

1. Follow [setup-plan.md](./setup-plan.md) to create all accounts
2. Run database schema from [database-schema.md](./database-schema.md)
3. Add environment variables per [environment-variables.md](./environment-variables.md)
4. Install dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr twilio resend
npx @sentry/wizard@latest -i nextjs
```

## Development Roadmap

See [development-roadmap.md](./development-roadmap.md) for the 8-phase implementation plan:
1. Foundation (Database + Auth)
2. User Management
3. Medical Data
4. Scheduling
5. Real-Time Features
6. Payments
7. Platform Operations
8. Administration
