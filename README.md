# TawariApp (Tabibi) - Telemedicine & Healthcare Web Application

A full-stack telemedicine platform that connects patients with doctors online: browse doctors, book a slot, join a video consultation, and receive a prescription - all in one place. Fully bilingual (Arabic / English).

**Live demo:** https://tawariapp-three.vercel.app

## Features

- **Video consultations** - real-time doctor–patient calls built on WebRTC (Daily.co), with a native-feeling call screen, incoming-call ringtone engine (Web Audio API), and TURN-server connectivity handling
- **Appointment & queue system** - doctor availability, booking, live queue tracking, and in-queue chat
- **E-prescriptions** - doctors issue prescriptions rendered as PDFs (@react-pdf/renderer)
- **Payments & checkout** - consultation checkout flow with receipt verification
- **Realtime notifications** - browser push + realtime updates for calls, queue, and messages
- **Doctor onboarding & dashboards** - separate patient, doctor, and admin experiences
- **Medical triage** - guided symptom intake before consultations
- **Reviews** - post-consultation ratings
- **Bilingual UI** - Arabic and English with localized routing
- **Security** - rate limiting (Upstash Redis with in-memory fallback), Supabase Row Level Security, webhook verification, dedicated security CI workflow

## Tech Stack

| Area | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Backend | Next.js API routes + Express, Supabase (Postgres, Auth, RLS, Realtime) |
| Video / Calls | Daily.co, custom WebRTC layer |
| Styling | Tailwind CSS 4, Framer Motion, Lucide |
| Email | Resend |
| Validation | Zod |
| Testing | Node test runner (unit), Playwright (e2e) |
| CI/CD | GitHub Actions (CI, security, release), Vercel |

## Getting Started

```bash
npm install
npm run setup:local   # checks local env prerequisites
npm run dev           # http://localhost:3000
```

Required environment variables include Supabase keys, Daily.co credentials, Resend API key, and Upstash Redis (optional in development). See `scripts/verify-local-env.ts` (`npm run env:check`).

### Tests

```bash
npm test          # unit tests
npm run test:ci   # CI test suite
```

## Team

Built by a small team. My role ([Tarek Bakr](https://github.com/01014302142tarek)): the real-time consultation system - the WebRTC calling layer, call UI (desktop + mobile), incoming-call notifications and ringtone engine - plus the prescription workflow. See the commit history for details.
