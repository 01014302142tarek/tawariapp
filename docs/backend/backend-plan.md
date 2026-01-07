# TawariApp Backend Database Plan

## Overview

This document outlines the high-level database architecture and permission system for TawariApp, a telemedicine platform serving patients, doctors, and administrators in Egypt.

---

## User Types and Roles

### 1. Patients
- Primary users seeking medical consultations
- Can book appointments with doctors
- Access their own medical records, prescriptions, and consultation history
- Make payments for consultations
- Rate and review doctors after consultations

### 2. Doctors
- Licensed medical professionals providing consultations
- Must complete verification/onboarding before practicing
- Manage their availability and schedule
- Conduct video consultations with patients
- Write prescriptions and medical notes
- View patient medical history during consultations
- Receive payments for services

### 3. Administrators
- Platform managers with elevated access
- Verify and approve doctor credentials
- Handle disputes and support tickets
- Monitor platform activity and analytics
- Manage user accounts (suspend, ban, reinstate)
- Configure platform settings and pricing

### 4. Doctor Assistants
- Support staff working on behalf of specific doctors
- Assigned to one or more doctors by the doctor or admin
- Optional role (doctors can operate without assistants)
- Actions are logged with both assistant and doctor IDs
- Manage doctor schedules and availability
- Handle appointment rescheduling and patient communications
- Prepare patient information before consultations
- Follow up with patients post-consultation
- Flag prescription refill requests for doctor approval
- Cannot write prescriptions or medical notes directly
- Cannot access patient records without active appointment context

### 5. Admin Assistants
- Support staff for administrative operations
- Assigned to departments or working in a general pool
- Optional role (admins retain full capability)
- Actions are logged with both assistant and admin IDs
- Handle first-level support ticket triage
- Perform initial document review for doctor verification
- Process routine user inquiries
- Monitor basic platform metrics
- Escalate complex decisions to full admins
- Cannot approve doctor verification (can prepare)
- Cannot modify platform settings or pricing
- Cannot perform account suspensions or bans

---

## Core Database Entities

### User Management
- Users (base table for all user types)
- Profiles (extended information per role)
- Doctor Credentials (licenses, specializations, verification status)
- Admin Permissions (granular admin access levels)
- Assistant Assignments (doctor-assistant and admin-assistant relationships)
- Assistant Action Logs (track actions performed on behalf of principals)

### Medical Data
- Medical Records (patient health information)
- Prescriptions (medications prescribed by doctors)
- Consultation Notes (doctor notes from appointments)
- Lab Results (uploaded test results)
- Allergies and Conditions (patient medical history)

### Appointments and Scheduling
- Appointments (scheduled consultations)
- Doctor Availability (working hours, blocked times)
- Consultation Sessions (video call records)
- Appointment History (completed, cancelled, no-show)

### Payments and Billing
- Transactions (payment records)
- Doctor Payouts (earnings and withdrawals)
- Pricing Plans (consultation fees by specialty)
- Invoices (receipts for patients)
- Refunds (cancelled appointment refunds)

### Communication
- Messages (in-app messaging between users)
- Notifications (push and in-app notifications)
- Support Tickets (user issues and complaints)

### Reviews and Ratings
- Doctor Reviews (patient feedback)
- Doctor Ratings (aggregated scores)

### Platform Administration
- Audit Logs (track all sensitive actions)
- System Settings (configurable platform parameters)
- Announcements (platform-wide notifications)

---

## Permission Matrix

### Patient Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Own Profile | Yes | Yes | Yes | No |
| Own Medical Records | Yes | Yes | Yes | No |
| Own Appointments | Yes | Yes | Yes (cancel only) | No |
| Own Prescriptions | No | Yes | No | No |
| Doctor Listings | No | Yes | No | No |
| Own Reviews | Yes | Yes | Yes | Yes |
| Own Messages | Yes | Yes | No | No |
| Own Transactions | No | Yes | No | No |

### Doctor Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Own Profile | Yes | Yes | Yes | No |
| Own Credentials | Yes | Yes | Yes | No |
| Own Availability | Yes | Yes | Yes | Yes |
| Assigned Appointments | No | Yes | Yes (status only) | No |
| Patient Records (during consultation) | No | Yes | No | No |
| Prescriptions | Yes | Yes | Yes (own only) | No |
| Consultation Notes | Yes | Yes | Yes (own only) | No |
| Own Earnings | No | Yes | No | No |
| Own Reviews | No | Yes | No | No |

### Administrator Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| All Users | Yes | Yes | Yes | Yes (soft delete) |
| All Appointments | No | Yes | Yes | No |
| Doctor Verification | No | Yes | Yes | No |
| Transactions | No | Yes | Yes (refunds) | No |
| Support Tickets | Yes | Yes | Yes | Yes |
| Platform Settings | Yes | Yes | Yes | Yes |
| Audit Logs | No | Yes | No | No |
| Analytics | No | Yes | No | No |

### Doctor Assistant Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Assigned Doctor Profile | No | Yes | No | No |
| Doctor Availability | Yes | Yes | Yes | Yes |
| Doctor Appointments | No | Yes | Yes (reschedule only) | No |
| Patient Records (during consultation) | No | Yes | No | No |
| Prescriptions | No | Yes | No | No |
| Consultation Notes | No | Yes | No | No |
| Doctor Messages | Yes | Yes | No | No |
| Prescription Refill Requests | Yes (flag only) | Yes | No | No |

Note: Doctor assistants inherit a subset of permissions from their assigned doctors. They cannot perform actions that require medical licensure.

### Admin Assistant Permissions

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| User Profiles | No | Yes | No | No |
| Appointments | No | Yes | No | No |
| Doctor Verification | No | Yes | Yes (prepare notes only) | No |
| Support Tickets | Yes | Yes | Yes (triage/respond) | No |
| Transactions | No | Yes | No | No |
| Platform Settings | No | No | No | No |
| Audit Logs | No | Yes (limited scope) | No | No |
| Analytics | No | Yes (basic metrics) | No | No |

Note: Admin assistants cannot finalize verification decisions, suspend users, or modify system settings. They prepare and escalate to full admins.

---

## Data Access Rules

### Row Level Security Principles

1. Patients can only access their own data
2. Doctors can access patient data only during active consultations
3. Doctors can only modify records they created
4. Admins have read access to all data but limited write access
5. Sensitive medical data requires additional verification
6. All data modifications are logged for audit purposes
7. Assistants inherit scoped permissions from their assigned principals
8. Assistant actions are logged with both assistant ID and principal ID

### Data Isolation

- Patient medical records are isolated per patient
- Doctor earnings and schedules are isolated per doctor
- Cross-user data access only through explicit relationships (appointments)

### Time-Based Access

- Doctors gain access to patient records when appointment starts
- Access automatically revokes after consultation ends (with grace period)
- Historical consultation data remains accessible to both parties

---

## Verification and Trust Levels

### Patient Verification Levels
1. Unverified (email only)
2. Phone Verified
3. ID Verified (for sensitive medical procedures)

### Doctor Verification Levels
1. Pending (application submitted)
2. Documents Under Review
3. Verified (approved to practice)
4. Suspended (temporarily disabled)
5. Rejected (application denied)

### Admin Trust Levels
1. Support Agent (limited access)
2. Moderator (user management)
3. Full Admin (all permissions)
4. Super Admin (system configuration)

### Doctor Assistant Status
1. Pending (invited, not yet accepted)
2. Active (can perform delegated tasks)
3. Suspended (temporarily disabled by doctor or admin)
4. Revoked (access removed)

### Admin Assistant Status
1. Pending (invited, not yet accepted)
2. Active (can perform delegated tasks)
3. Suspended (temporarily disabled)
4. Revoked (access removed)

---

## Assistant Assignment Model

### Doctor-Assistant Relationships
- A doctor can have zero, one, or multiple assistants
- An assistant can be assigned to one or multiple doctors
- Each assignment has its own status and permission scope
- Doctors can customize which permissions each assistant receives
- Doctors can revoke assistant access at any time
- Assignment history is retained for audit purposes

### Admin-Assistant Relationships
- Admin assistants may be assigned to specific departments
- Alternatively, they work in a general support pool
- Assignments are managed by full admins or super admins
- Each assignment has defined scope (support, verification, billing)
- Admins can revoke assistant access at any time

### Delegation Controls
- Principals (doctors/admins) retain full permissions regardless of assistant status
- Assistants cannot exceed the permissions of their principal
- Some actions require principal approval before taking effect
- Pending approval items are visible to both assistant and principal
- Approval timeouts can be configured per action type

---

## Data Retention Policies

### Active Data
- User profiles: Retained while account is active
- Appointments: Retained for 7 years (medical compliance)
- Medical records: Retained for 10 years minimum
- Prescriptions: Retained for 7 years

### Archived Data
- Cancelled appointments: Archived after 1 year
- Inactive user accounts: Archived after 2 years of inactivity
- Audit logs: Retained for 5 years

### Deleted Data
- Soft delete for all user-facing data
- Hard delete only for test/spam accounts (admin action)
- GDPR/data protection compliance for deletion requests

---

## Security Considerations

### Authentication
- Email/password authentication via Supabase Auth
- OAuth providers (Google)
- Phone number verification for sensitive actions
- Two-factor authentication for doctors and admins

### Authorization
- Role-based access control (RBAC) at application level
- Row Level Security (RLS) at database level
- API rate limiting per user role
- Session management and token refresh

### Data Protection
- Encryption at rest for sensitive medical data
- Encryption in transit (HTTPS/TLS)
- Field-level encryption for highly sensitive data
- Regular security audits and penetration testing

### Compliance
- Egyptian medical data regulations
- Patient consent management
- Data portability (export own data)
- Right to deletion (with legal retention exceptions)

---

## Integration Points

### External Services
- Paymob (payment processing)
- Jitsi Meet (video consultations)
- SMS Gateway (phone verification, notifications)
- Email Service (transactional emails)
- Cloud Storage (medical documents, images)

### API Design Principles
- RESTful endpoints for CRUD operations
- Real-time subscriptions for appointments and messages
- Webhook support for payment notifications
- Versioned API for backward compatibility

---

## Scalability Considerations

### Database Optimization
- Indexing strategy for frequently queried fields
- Partitioning for large tables (appointments, audit logs)
- Read replicas for analytics queries
- Connection pooling for high concurrency

### Performance Targets
- Appointment booking: Under 500ms
- Medical record retrieval: Under 200ms
- Search results: Under 1 second
- Real-time updates: Under 100ms latency

---

## Policy Decisions

### 1. Doctor Pricing Model
Doctors have different specialization tiers with different pricing.
- Base pricing by specialty category (general practitioner, specialist, sub-specialist)
- Individual doctors can set their own rates within platform-defined ranges
- Premium pricing for doctors with higher ratings, more experience, or specialized certifications

### 2. Refund Policy
Tiered refund based on timing and cancellation party.
- Patient cancels 24+ hours before: Full refund
- Patient cancels 12-24 hours before: 75% refund
- Patient cancels 2-12 hours before: 50% refund
- Patient cancels less than 2 hours before: No refund
- Doctor cancels: Always full refund plus priority rebooking
- Technical issues during consultation: Full refund or free rebooking

### 3. Cancellation Window
Patients can cancel without penalty up to 24 hours before appointment.
- Balances patient flexibility with respect for doctor time
- Gives doctors enough notice to potentially fill the slot
- One penalty-free late cancellation allowed per patient per quarter for goodwill

### 4. Waiting Room Feature
Yes, implement a waiting room before consultations.
- Provides buffer for doctor running slightly late
- Allows patient to verify audio/video before consultation starts
- Displays estimated wait time and position
- Shows pre-consultation instructions or forms to complete
- Doctor can see who is waiting and admit when ready

### 5. Prescription Renewals
Implement a prescription renewal request system.
- Patient can request renewal for existing prescriptions
- Doctor reviews request asynchronously (no video call needed)
- Doctor can approve, deny, or require full consultation
- Reduced fee (20-30% of consultation fee)
- Limited to medications previously prescribed by that doctor
- Full consultation required at least once per year for ongoing prescriptions
- Controlled substances always require full consultation

### 6. Doctor Analytics
Comprehensive but privacy-respecting metrics visible to doctors.

Visible metrics:
- Total consultations (daily, weekly, monthly, yearly)
- Revenue and earnings breakdown
- Average consultation duration
- Patient satisfaction ratings and trends
- Cancellation and no-show rates
- Busiest time slots and days
- Repeat patient rate
- Response time to messages

Not visible:
- Individual patient financial details
- Comparative rankings against other doctors

### 7. Family Record Sharing
Patients can share medical records with family members.
- Patient can designate authorized family members with different access levels
- View-only access (can see records but not modify)
- Full access (can book appointments on behalf, see all records)
- Emergency contact access (limited to critical information)
- Patient can revoke access at any time
- All access is logged for transparency

### 8. On-Demand Consultations
Platform operates with continuous doctor availability (24/7 model).
- Patients can request immediate consultations at any time
- System matches them with available doctors based on specialty needed
- No distinction between scheduled hours and emergency hours
- Priority queue with urgent flag option for patients (self-reported urgency)
- Flagged consultations get priority in the queue
- No premium pricing for urgency - same rates apply
- Doctors set themselves as available now or scheduled only
- Clear disclaimer that telemedicine is not a replacement for emergency room
- Triage questions to identify cases requiring in-person care

### 9. Assistant Video Consultation Access
Doctor assistants can join video consultations as observers with patient consent.
- Patient must explicitly consent before each consultation
- Assistant appears as named participant (not hidden)
- Useful for training, note-taking, and follow-up coordination
- Doctor can enable/disable this capability per assistant
- All observer participation is logged
- Patient can request assistant to leave at any time during consultation

### 10. Assistant Limits
Platform limit of 5 assistants per doctor, with ability to request increase.
- Most doctors will need 1-2 assistants
- Cap prevents abuse and ensures meaningful oversight
- Doctors with legitimate clinic operations can request higher limits
- Admin approval required for more than 5 assistants
- Each assistant still requires individual verification

### 11. Assistant Dashboard
Assistants use a modified version of their principal's dashboard.
- Reduces development complexity
- Maintains consistent user experience
- Shows only data and actions within assistant's permission scope
- Clear visual indicator that they are acting as assistant (banner showing Acting on behalf of Dr. X)
- Activity feed shows pending items requiring approval
- Easy switching if assistant works for multiple doctors

### 12. Assistant Performance Tracking
Built-in metrics with principal review.

Automatically tracked:
- Tasks completed (appointments managed, messages sent)
- Response times
- Error rates (appointments that needed to be corrected)
- Patient feedback specific to assistant interactions

Review process:
- Principal (doctor/admin) can view assistant activity log
- Quarterly summary reports generated automatically
- No patient ratings of assistants directly (avoids confusion)
- Principals can add notes and flag performance issues

### 13. Shared Assistants
Assistants can be shared between doctors in a practice/clinic setting.
- Reflects real clinic operations where staff support multiple doctors
- Each doctor-assistant assignment is independent
- Doctor A can give different permissions than Doctor B to the same assistant
- Assistant's dashboard shows which doctor context they're currently working in
- Clear switching mechanism between doctor contexts
- All actions logged to correct doctor's records
- Consider clinic entity in future that groups doctors and shares staff pool

---

## Next Steps

1. Finalize entity relationships and create detailed ERD
2. Define exact fields for each table
3. Implement Row Level Security policies
4. Create database migrations
5. Build API endpoints for each entity
6. Implement real-time subscriptions
7. Set up audit logging system
8. Configure backup and recovery procedures
