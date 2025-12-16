# TawariApp - Implementation Plan & Feature Specifications

**Document Type:** Unified Implementation Plan  
**Platform:** Next.js 14+ (Vercel) - Single Web Application  
**Target Market:** Egyptian Healthcare  
**Created:** December 11, 2025

---

## 📋 Executive Summary

TawariApp is a medical telemedicine platform for the Egyptian healthcare market. This document defines the complete scope, features, and implementation strategy for the MVP.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Platform** | Next.js on Vercel | Fast deployment, free tier, responsive web |
| **Architecture** | Single unified web app | All roles (patient/doctor/admin) in one app |
| **Database** | Supabase | PostgreSQL + Storage + Real-time, free tier |
| **Auth** | Firebase Phone Auth | Egyptian phone verification, proven reliability |
| **Video Calls** | Jitsi Meet | Free, reliable, customizable |
| **Payments** | Paymob (MVP) | Modern API, cards + mobile wallets |

---

## 📱 Application Architecture

### Single Web App - All Roles

```
tawariapp.vercel.app/
├── / (Landing/Marketing)
├── /login
├── /register
├── /doctors (Public browse)
├── /patient/* (Patient dashboard)
├── /doctor/* (Doctor dashboard)
└── /admin/* (Admin dashboard)
```

All pages are **fully responsive** (desktop, tablet, mobile).

---

## ✅ MVP Scope Definition

### What's IN the MVP

| Category | Features |
|----------|----------|
| **Authentication** | Phone-based registration, OTP verification, role-based access |
| **Patient Features** | Search doctors, book consultations, pay online, video calls, receive prescriptions |
| **Doctor Features** | Register & upload documents, set availability, conduct consultations, write prescriptions |
| **Admin Features** | Verify doctors, manage users, view transactions |
| **Payments** | Paymob integration (cards, wallets), transaction history, Arabic receipts |
| **Video Calls** | Jitsi Meet integration, waiting room, in-call chat |
| **Localization** | Full Arabic interface, RTL layout, Egyptian content |

### What's OUT of MVP (Post-Launch)

- Emergency services integration (122/123/180)
- AI symptom analysis
- Family profiles
- Insurance integration
- Fawry cash payments
- Pharmacy network
- Mobile native apps
- Offline mode
- Consultation recording

---

## 👥 User Roles & Permissions

### Patient (مريض)
- Search and browse doctors
- Book and pay for consultations
- Join video consultations
- View prescriptions and history
- Manage own profile

### Doctor (طبيب)
- Register and upload credentials
- Set availability schedule
- Conduct video consultations
- Write digital prescriptions
- Track earnings

### Admin (مدير النظام)
- Verify doctor applications
- Manage all users
- Monitor transactions
- View analytics

---

## 🔄 Core User Flows

### Flow 1: Patient Registration
1. Enter Egyptian phone number (+20)
2. Receive and enter OTP
3. Fill profile (name, gender, DOB)
4. Accept terms → Dashboard

### Flow 2: Book Consultation
1. Search/filter doctors
2. View doctor profile
3. Select available time slot
4. Pay via Paymob
5. Receive confirmation

### Flow 3: Video Consultation
1. Enter waiting room at scheduled time
2. Doctor joins → Call starts
3. Consultation via Jitsi Meet
4. Doctor ends call → Writes prescription
5. Patient receives prescription

### Flow 4: Doctor Registration
1. Sign up with phone + basic info
2. Upload license & ID documents
3. Add specialty, bio, photo
4. Submit → Awaits admin verification
5. Admin approves → Doctor can practice

### Flow 5: Doctor Conducts Consultation
1. View upcoming appointments
2. Start consultation at scheduled time
3. Patient auto-joins from waiting room
4. Conduct consultation, take notes
5. End call → Write prescription → Send to patient

---

## 📄 Page Specifications

### Public Pages
| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing with features, CTA |
| About | `/about` | Company info |
| Doctors Browse | `/doctors` | Public listing (login to book) |
| Doctor Profile | `/doctors/[id]` | Full doctor details |
| Login | `/login` | Phone + OTP auth |
| Register | `/register` | New user signup |
| Register Doctor | `/register/doctor` | Doctor signup flow |

### Patient Dashboard
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/patient` | Overview, quick actions |
| Find Doctors | `/patient/doctors` | Search with booking |
| Appointments | `/patient/appointments` | Manage bookings |
| Consultation | `/patient/consultation/[id]` | Video call |
| Prescriptions | `/patient/prescriptions` | View/download |
| Payments | `/patient/payments` | Transaction history |
| Profile | `/patient/profile` | Edit settings |

### Doctor Dashboard
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/doctor` | Today's schedule, stats |
| Availability | `/doctor/availability` | Manage time slots |
| Appointments | `/doctor/appointments` | Patient list |
| Consultation | `/doctor/consultation/[id]` | Video + notes |
| Prescriptions | `/doctor/prescriptions` | Create/history |
| Earnings | `/doctor/earnings` | Revenue tracking |
| Profile | `/doctor/profile` | Edit bio, docs |

### Admin Dashboard
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/admin` | Stats overview |
| Pending Doctors | `/admin/doctors/pending` | Verification queue |
| All Doctors | `/admin/doctors` | Doctor management |
| All Patients | `/admin/patients` | Patient management |
| Transactions | `/admin/transactions` | Payment monitoring |

---

## 🗃️ Data Models

### Core Entities

```typescript
// User (base)
interface User {
  id: string;
  phone: string;
  name_ar: string;
  role: 'patient' | 'doctor' | 'admin';
  created_at: Date;
}

// Doctor Profile
interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  license_number: string;
  bio_ar: string;
  consultation_fee: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  is_online: boolean;
}

// Consultation
interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed';
  scheduled_at: Date;
  jitsi_room_id: string;
  consultation_fee: number;
}

// Prescription
interface Prescription {
  id: string;
  consultation_id: string;
  medications: Medication[];
  notes_ar: string;
  created_at: Date;
}

// Payment
interface Payment {
  id: string;
  consultation_id: string;
  amount: number;
  vat: number;
  status: 'pending' | 'success' | 'failed';
  gateway_reference: string;
}
```

---

## 🔧 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    TawariApp Tech Stack                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend                                                    │
│  ├── Next.js 14+ (App Router)                               │
│  ├── TypeScript                                              │
│  ├── Tailwind CSS + RTL                                      │
│  └── Arabic fonts (Cairo, Noto Sans Arabic)                 │
├─────────────────────────────────────────────────────────────┤
│  Backend/Database                                            │
│  ├── Supabase (PostgreSQL + Storage + Real-time)            │
│  └── Next.js API Routes                                      │
├─────────────────────────────────────────────────────────────┤
│  Authentication                                              │
│  └── Firebase Phone Auth                                     │
├─────────────────────────────────────────────────────────────┤
│  Video Calling                                               │
│  └── Jitsi Meet (iframe embed)                              │
├─────────────────────────────────────────────────────────────┤
│  Payments                                                    │
│  └── Paymob (cards + mobile wallets)                        │
├─────────────────────────────────────────────────────────────┤
│  Hosting                                                     │
│  └── Vercel (free tier)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Estimation (MVP)

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| Vercel | 100GB bandwidth | **$0** |
| Supabase | 500MB DB, 1GB storage | **$0** |
| Firebase | 10K verifications/month | **$0** initially |
| Jitsi Meet | Unlimited | **$0** |
| Paymob | 2.75% + EGP 3/transaction | **Variable** |
| **Total** | | **~$0-20/month** for MVP |

---

## 📅 Development Timeline (16 Weeks)

### Phase 1: Foundation (Weeks 1-4)
- Environment setup (Next.js, Supabase, Firebase)
- Authentication (phone + OTP)
- Database schema
- Core UI components

### Phase 2: Doctor Management (Weeks 5-8)
- Doctor registration flow
- Admin verification workflow
- Availability management
- Doctor discovery for patients

### Phase 3: Payments (Weeks 9-10)
- Paymob integration
- Payment flow for consultations
- Transaction history

### Phase 4: Video Consultations (Weeks 11-13)
- Jitsi Meet integration
- Waiting room
- Consultation workflow
- Digital prescriptions

### Phase 5: Polish & Launch (Weeks 14-16)
- Testing & bug fixes
- Arabic content review
- Performance optimization
- Soft launch with beta users

---

## 🎯 Success Metrics

| Metric | MVP Target |
|--------|------------|
| Registered Patients | 500+ |
| Verified Doctors | 50+ |
| Completed Consultations | 200+ |
| Payment Success Rate | >90% |
| User Rating | >4.5/5 |

---

## ⚠️ Key Dependencies

1. **Paymob Account** - Need Egyptian entity or Stripe Atlas
2. **Firebase Project** - For phone auth
3. **Supabase Project** - For database
4. **Domain Name** - For production deployment

---

*This plan serves as the single source of truth for TawariApp MVP development.*
