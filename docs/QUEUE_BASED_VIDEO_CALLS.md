# Queue-Based Video Call System Implementation Plan

## Overview

Tawari (from Arabic "طوارئ" meaning "emergency") is designed for urgent telemedicine where doctors are available 24/7. This document outlines the implementation of a real-time queue-based video consultation system.

---

## Core Concepts

### Current State (Appointment-Based)
- Patients book appointments for specific times
- Doctor and patient join at scheduled time
- Not suitable for urgent/emergency care

### Target State (Queue-Based)
- Doctors go "online" when available
- Patients see all online doctors with live queue info
- Patients join a doctor's queue
- Doctor processes queue one patient at a time
- Real-time updates for queue position and wait times

---

## System Components

### 1. Doctor Availability System

**What it does:**
- Allows doctors to toggle their availability status
- Tracks which doctors are currently online and accepting patients
- Shows doctor's current state: Available, In Consultation, or Offline

**Database changes:**
- Add `is_online` boolean to `doctor_profiles` (real-time status)
- Add `went_online_at` timestamp (for session tracking)
- Add `current_consultation_id` reference (who they're currently with)

**Doctor Dashboard changes:**
- Add prominent "Go Online" / "Go Offline" toggle button
- Show current status clearly
- Display queue count when online

---

### 2. Patient Queue System

**What it does:**
- Maintains an ordered queue of waiting patients per doctor
- Tracks queue position and estimated wait times
- Handles queue joins, leaves, and position updates

**Database changes:**
- New `consultation_queue` table:
  - `id` (primary key)
  - `doctor_profile_id` (which doctor's queue)
  - `patient_profile_id` (who is waiting)
  - `joined_at` (when they entered queue)
  - `position` (current position, 1 = next)
  - `status` (waiting, called, in_consultation, completed, left)
  - `estimated_wait_minutes` (calculated field)
  - `called_at` (when doctor called them in)

**Queue logic:**
- Position 1 = next to be seen
- When consultation ends, everyone moves up
- Patients can leave queue at any time
- Queue persists if doctor briefly goes offline

---

### 3. Real-Time Updates (Supabase Realtime)

**What it does:**
- Pushes live updates to all connected clients
- No page refresh needed for queue changes
- Instant notification when it's patient's turn

**Channels to implement:**
- `doctor_availability` - broadcasts when doctors go online/offline
- `queue:{doctor_id}` - broadcasts queue changes for specific doctor
- `patient:{patient_id}` - direct notifications to specific patient

**Events to broadcast:**
- Doctor went online/offline
- Queue position changed
- Patient's turn (called into consultation)
- Consultation ended
- Estimated wait time updated

---

### 4. Video Call Privacy (Daily.co)

**What it does:**
- Ensures only authorized doctor and patient can join
- Prevents URL sharing from allowing unauthorized access
- Doctor has moderator controls

**Implementation approach:**
- Use Daily.co private rooms with `enable_knocking: true`
- Generate meeting tokens with user identity
- Doctor token has `is_owner: true` (moderator)
- Patient token is specific to their user
- Room configured to require token for entry
- Only the specific patient in consultation can join

**Token generation:**
- Server-side only (API route)
- Include `user_id` in token
- Set expiration (1 hour max)
- Doctor gets owner token, patient gets participant token

---

### 5. Patient "Start Video Call" Flow

**Screen 1: Available Doctors List**

Shows all online doctors with:
- Doctor photo, name, specialty
- Rating (stars) and review count
- Consultation fee
- Current status:
  - "Available Now" (green) - queue is empty
  - "In Consultation" (yellow) - with someone, queue open
  - "Busy" (red) - queue is full
- Queue info:
  - Number of people waiting
  - Estimated wait time
- "Join Queue" button

**Screen 2: Payment Page (after selecting doctor)**

Shows:
- Selected doctor summary (photo, name, specialty)
- Consultation fee amount
- Payment summary:
  - Consultation fee: X EGP
  - Service fee: X EGP (if any)
  - Total: X EGP
- Payment method selection (placeholder for future Paymob integration)
- **For now (dummy implementation):**
  - Simple card with payment summary
  - "Complete Payment" button
  - Clicking button marks payment as "completed" (mock)
  - Redirects to waiting room
- Cancel button to go back to doctor list

**Screen 3: Waiting Room (after payment)**

Shows:
- Your position in queue (e.g., "You are #3 in line")
- Estimated wait time
- Doctor's current status
- Real-time updates as queue moves
- "Leave Queue" button (with refund note for future)
- When position = 1: "Doctor will call you shortly"
- When called: Auto-redirect to video call OR "Join Now" button

---

### 6. Doctor Queue Management Flow

**Screen 1: Offline State**
- Big "Go Online" button
- Today's stats (consultations completed, earnings)

**Screen 2: Online State**

Shows:
- Current status toggle (Online/Offline)
- "In Consultation" indicator when with patient
- Queue panel:
  - List of waiting patients (name, wait time, chief complaint)
  - "Call Next" button (calls position 1)
  - Ability to reorder queue if needed
  - See patient details before calling
- Current consultation panel (when in call):
  - Patient info
  - Timer showing consultation duration
  - "End Consultation" button
  - Quick notes field

**Screen 3: Video Call View**
- Full-screen video call
- Patient info overlay
- End call button
- Timer
- Mute/camera controls

---

## Implementation Phases

### Phase 1: Database & Backend Foundation

1. Create new database tables:
   - `consultation_queue` table
   - Update `doctor_profiles` with online status fields

2. Create server actions:
   - `toggleDoctorOnline()` - go online/offline
   - `joinDoctorQueue()` - patient joins queue
   - `leaveQueue()` - patient leaves
   - `callNextPatient()` - doctor calls next in queue
   - `getQueueStatus()` - get current queue state
   - `getOnlineDoctors()` - list all online doctors with queue info

3. Create Daily.co token generation:
   - API route to generate secure meeting tokens
   - Doctor token (owner privileges)
   - Patient token (participant, identity-locked)

---

### Phase 2: Real-Time Infrastructure

1. Set up Supabase Realtime subscriptions:
   - Enable realtime on `doctor_profiles` (for online status)
   - Enable realtime on `consultation_queue` (for queue updates)

2. Create React hooks:
   - `useOnlineDoctors()` - live list of online doctors
   - `useDoctorQueue(doctorId)` - live queue for specific doctor
   - `useMyQueuePosition()` - patient's current position
   - `useDoctorStatus()` - doctor's own status

---

### Phase 3: Patient Interface

1. "Start Video Call" page (`/dashboard/patient/urgent-care`):
   - Grid of online doctors
   - Filters (specialty, price range)
   - Sort by (wait time, rating, price)
   - "Select Doctor" button on each card

2. Payment page (`/dashboard/patient/urgent-care/payment/[doctorId]`):
   - Doctor summary card (photo, name, specialty, rating)
   - Payment breakdown:
     - Consultation fee: X EGP
     - Service fee: X EGP (optional)
     - Total: X EGP
   - **Dummy implementation (for now):**
     - Static payment UI with card visual
     - "Complete Payment" button
     - On click: creates queue entry with `payment_status: 'completed_mock'`
     - Redirects to waiting room
   - "Cancel" button returns to doctor list
   - **Future Paymob integration placeholder noted in code**

3. Waiting room page (`/dashboard/patient/urgent-care/waiting/[queueEntryId]`):
   - Queue position display
   - Real-time updates via Supabase
   - Leave queue option (with future refund note)
   - Auto-redirect to video call when called

4. Update video call page:
   - Fetch meeting token from API
   - Join with token instead of raw URL
   - Handle "access denied" gracefully

---

### Phase 4: Doctor Interface

1. Online/Offline toggle:
   - Prominent in header or sidebar
   - Confirmation before going offline with queue

2. Queue management panel:
   - List of waiting patients
   - Call next button
   - Patient preview (complaint, basic info)
   - Queue reordering (optional)

3. Update video call page:
   - Use owner token
   - Show patient info
   - Consultation timer
   - End and call next workflow

---

### Phase 5: Security & Polish

1. Video call security:
   - Implement token-based room access
   - Test that URL sharing doesn't work
   - Add room expiration

2. Edge cases:
   - Doctor goes offline mid-queue (notify waiting patients)
   - Patient disconnects (grace period to rejoin)
   - Connection issues (retry logic)
   - Multiple tabs handling

3. Analytics:
   - Track average wait times
   - Queue abandonment rate
   - Consultation durations
   - Peak hours

---

## Database Schema Changes

### New Table: `consultation_queue`

```
id: uuid (PK)
doctor_profile_id: uuid (FK -> doctor_profiles)
patient_profile_id: uuid (FK -> patient_profiles)
status: enum (waiting, called, in_consultation, completed, cancelled, expired)
position: integer
chief_complaint: text (optional)
joined_at: timestamp
called_at: timestamp (nullable)
consultation_started_at: timestamp (nullable)
consultation_ended_at: timestamp (nullable)
payment_status: enum (pending, completed_mock, completed, refunded, failed)
payment_amount: decimal
payment_reference: text (nullable, for future Paymob transaction ID)
daily_room_name: text (nullable, created when consultation starts)
daily_room_url: text (nullable)
created_at: timestamp
updated_at: timestamp
```

### Updates to `doctor_profiles`

```
is_online: boolean (default false)
went_online_at: timestamp (nullable)
current_queue_entry_id: uuid (FK -> consultation_queue, nullable)
average_consultation_minutes: integer (for wait time estimates)
```

---

## API Routes Needed

### `/api/daily/token`
- POST: Generate meeting token
- Input: `appointmentId` or `queueEntryId`
- Output: `{ token, roomUrl, expiresAt }`
- Validates user is authorized (doctor or specific patient)

---

## Key Decisions

### Wait Time Estimation
- Use doctor's `average_consultation_minutes`
- Multiply by queue position
- Update average after each consultation

### Queue Limits
- Consider max queue size per doctor (e.g., 10)
- Show "Queue Full" when limit reached

### Offline Handling
- If doctor goes offline:
  - Keep queue intact for 5 minutes (break)
  - After 5 min, notify patients queue is paused
  - Patients can stay or leave

### Payment Integration

**Current (Dummy):**
- Simple payment page with doctor info and fee breakdown
- "Complete Payment" button sets `payment_status: 'completed_mock'`
- Patient added to queue immediately after clicking
- No actual payment processing

**Future (Paymob):**
- Replace dummy page with Paymob payment flow
- Hold/authorize amount before joining queue
- Capture payment after consultation completes
- Refund logic if patient leaves queue before being seen
- Store `payment_reference` for transaction tracking

---

## Success Metrics

1. **Patient Experience**
   - Average wait time < 15 minutes
   - Queue abandonment rate < 20%
   - Successful connection rate > 95%

2. **Doctor Experience**
   - Easy to go online/offline
   - Clear queue visibility
   - No unauthorized people joining calls

3. **System Health**
   - Real-time updates < 1 second delay
   - Zero unauthorized room access
   - Queue consistency (no lost patients)

---

## Next Steps

1. Review and approve this plan
2. Create database migrations
3. Implement Phase 1 (backend)
4. Implement Phase 2 (realtime)
5. Implement Phase 3 (patient UI)
6. Implement Phase 4 (doctor UI)
7. Implement Phase 5 (security)
8. Testing with multiple users
9. Deploy and monitor
