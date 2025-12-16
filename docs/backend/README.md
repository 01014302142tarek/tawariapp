# Backend Documentation

This folder contains detailed backend implementation specifications for TawariApp.

## Contents

| File | Description |
|------|-------------|
| [database-schema.md](./database-schema.md) | Complete PostgreSQL schema with SQL |
| [api-endpoints.md](./api-endpoints.md) | All API endpoints specification |
| [integrations.md](./integrations.md) | External service integration details |
| [environment-variables.md](./environment-variables.md) | All environment variables |

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
│  │   Supabase   │  │   Firebase   │  │   Paymob     │          │
│  │   (Data)     │  │   (Auth)     │  │   (Payments) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **No Separate Backend Server** - Everything runs on Vercel
2. **Database-First Security** - Supabase RLS enforces access control
3. **Type-Safe End-to-End** - TypeScript from database to frontend
4. **Edge-Ready** - Critical APIs can run on Vercel Edge
