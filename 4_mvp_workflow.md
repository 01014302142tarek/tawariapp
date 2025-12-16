# TawariApp MVP Workflow

**Project:** TawariApp Medical Telemedicine Platform  
**Document Type:** MVP Workflow Specification  
**Last Updated:** December 11, 2025  
**Platform:** Next.js Web Application (Vercel)

---

## MVP Overview

### Core Purpose
Web-first telemedicine platform connecting Egyptian patients with verified doctors through video consultations, featuring Arabic localization and Egyptian payment integration.

### MVP Scope
- **Single Web Application**: All roles in one responsive app
- **Core Features**: Authentication, booking, payments, video calls, prescriptions
- **Egyptian Focus**: Arabic interface, Paymob payments, cultural considerations

---

## Patient MVP Journey

### 1. Discovery → Download
```
User discovers TawariApp → Visits website → Uses directly in browser
(No app download required - works on all devices)
```

### 2. Registration Process
1. Click "إنشاء حساب" (Create Account)
2. Enter Egyptian phone number (+20)
3. Receive OTP via SMS
4. Enter 6-digit code
5. Fill profile: Name (Arabic), Gender, Date of Birth
6. Accept Terms & Privacy Policy
7. Redirect to Dashboard

### 3. Dashboard Home
**What Patient Sees:**
- Welcome message with name
- "احجز استشارة" (Book Consultation) button
- Upcoming appointments (if any)
- Quick specialty selection
- Recent prescriptions

### 4. Find & Book Doctor
1. Browse doctors or search by specialty
2. Apply filters (specialty, gender, availability)
3. View doctor profile (bio, credentials, ratings)
4. Select available time slot
5. Review booking summary
6. Click "ادفع واحجز" (Pay & Book)

### 5. Payment
1. Redirected to Paymob payment page
2. Choose payment method:
   - Credit/Debit Card
   - Mobile Wallet (Vodafone Cash, etc.)
3. Complete payment
4. Return to app with confirmation
5. Receive SMS confirmation

### 6. Video Consultation
**Before Appointment:**
- Wait in dashboard for appointment time
- Join 5 minutes early

**At Appointment Time:**
1. Click "انضم للاستشارة" (Join Consultation)
2. Enter waiting room
3. When doctor joins, call begins
4. Video/voice consultation via Jitsi
5. Chat available during call
6. Doctor ends call when complete

### 7. After Consultation
1. See consultation summary
2. View digital prescription (if issued)
3. Download prescription as PDF
4. Option to rate doctor
5. Payment receipt available

---

## Doctor MVP Journey

### 1. Registration & Verification

**Step 1: Sign Up**
1. Click "سجل كطبيب" (Register as Doctor)
2. Enter phone number, verify with OTP
3. Enter basic information

**Step 2: Professional Details**
1. Select specialty
2. Enter license number
3. Upload documents:
   - Medical Syndicate License
   - National ID
4. Write Arabic bio
5. Upload professional photo
6. Set consultation fee

**Step 3: Await Verification**
- Status shows "قيد المراجعة" (Under Review)
- Admin team reviews documents
- Receive notification when approved

### 2. Dashboard Home (After Approval)
**What Doctor Sees:**
- Today's appointments
- Online/Offline toggle
- Quick stats (consultations, earnings)
- Pending appointments list

### 3. Set Availability
1. Navigate to "المواعيد المتاحة" (Availability)
2. Set weekly recurring schedule
3. Add/remove specific time slots
4. Block times as unavailable

### 4. Conduct Consultation

**Before Appointment:**
- Review patient information
- Check schedule

**At Appointment Time:**
1. Click "ابدأ الاستشارة" (Start Consultation)
2. Patient auto-joins from waiting room
3. Video call begins
4. Take notes during consultation
5. End call when complete

**After Consultation:**
1. Write prescription (optional)
2. Add medications with dosages
3. Sign electronically
4. Send to patient
5. Add consultation notes

### 5. Track Earnings
- View completed consultations
- See earnings breakdown
- Request payout (manual process for MVP)

---

## Admin MVP Journey

### 1. Dashboard Overview
**What Admin Sees:**
- Total users count
- Pending verifications count
- Today's consultations
- Recent transactions

### 2. Doctor Verification

**Process:**
1. View pending doctors list
2. Click doctor to review
3. View uploaded documents:
   - License (open in new tab)
   - National ID
4. Verify credentials
5. Approve or Reject with reason
6. Doctor receives notification

### 3. User Management
- Search users by name/phone
- View user details
- Suspend accounts if needed

### 4. Transaction Monitoring
- View all payments
- Filter by status
- Process refunds if needed

---

## Technical Implementation Flow

### Authentication Flow
```
1. User enters phone → Firebase sends OTP
2. User enters OTP → Firebase verifies
3. Firebase returns ID token
4. Frontend stores token
5. API routes verify token with Firebase Admin
6. User data fetched from Supabase
7. Redirect to appropriate dashboard
```

### Booking Flow
```
1. Patient selects doctor & time slot
2. Frontend creates consultation (status: pending_payment)
3. Frontend calls /api/payments/initiate
4. Backend creates Paymob order, returns payment URL
5. Patient completes payment on Paymob
6. Paymob webhook hits /api/webhooks/paymob
7. Backend updates payment status
8. Consultation status → scheduled
9. Both patient & doctor notified
```

### Consultation Flow
```
1. Patient enters waiting room (/patient/consultation/[id])
2. Frontend generates Jitsi room from consultation ID
3. Doctor joins same room (/doctor/consultation/[id])
4. Jitsi handles video/audio
5. When call ends, consultation status → completed
6. Doctor writes prescription
7. Patient can view/download prescription
```

---

## MVP Success Metrics

### User Goals (First 3 Months)
| Metric | Target |
|--------|--------|
| Patient Registrations | 500+ |
| Doctor Verifications | 50+ |
| Completed Consultations | 200+ |

### Technical Goals
| Metric | Target |
|--------|--------|
| Page Load Time | < 3 seconds |
| Payment Success Rate | > 90% |
| Video Call Completion | > 95% |

### Quality Goals
| Metric | Target |
|--------|--------|
| User Satisfaction | > 4.5/5 |
| Arabic Interface Coverage | 100% |
| Mobile Responsiveness | All pages |

---

## MVP Limitations (Post-MVP)

### Not Included in MVP
- Emergency services (122/123/180)
- AI symptom analysis
- Family profiles
- Insurance integration
- Fawry cash payments
- Pharmacy integration
- Mobile native apps
- Offline mode
- Video recording

### Known MVP Constraints
- Manual doctor payout processing
- Basic analytics only
- No automated reminders (SMS planned for Phase 2)
- Limited admin reporting

---

*This MVP workflow provides a focused, achievable roadmap for TawariApp's market entry, prioritizing essential features while maintaining quality and cultural sensitivity.*
