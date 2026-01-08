# TawariApp API Endpoints

**Base URL:** `https://tawariapp.vercel.app/api`

---

## Conventions

- **Auth:** `Authorization: Bearer <supabase_access_token>`
- **Language:** `Accept-Language: ar` or `en`
- **Response:** `{ success, data, error }`
- **Pagination:** `?page=1&limit=20` → returns `{ pagination: { page, limit, total, total_pages, has_next, has_prev } }`

---

## Authentication (Supabase SDK)

| Action | Method |
|--------|--------|
| Sign Up | `supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })` |
| Sign In | `supabase.auth.signInWithPassword({ email, password })` |
| Sign In with Google | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Sign Out | `supabase.auth.signOut()` |
| Reset Password | `supabase.auth.resetPasswordForEmail(email, { redirectTo })` |
| Update Password | `supabase.auth.updateUser({ password })` |
| Resend Verification | `supabase.auth.resend({ type: 'signup', email })` |
| Get User | `supabase.auth.getUser()` |

**Roles:** `patient`, `doctor`, `admin`, `doctor_assistant`, `admin_assistant`

---

## Profiles

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profiles/me` | GET | Get current user profile |
| `/api/profiles/me` | PUT | Update profile (full_name, avatar_url, preferred_language, timezone) |
| `/api/profiles/avatar` | POST | Upload avatar (multipart/form-data) |

---

## Patient Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/patients/me` | GET | Get patient profile |
| `/api/patients/me` | PUT | Update patient profile |
| `/api/patients/family-access` | GET | List family access grants |
| `/api/patients/family-access` | POST | Grant family access |
| `/api/patients/family-access/:id` | DELETE | Revoke family access |

**Access Levels:** `view_only`, `full`, `emergency`
**Relationships:** `parent`, `child`, `spouse`, `sibling`, `other`

---

## Doctor Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/doctors` | GET | List verified doctors (query: specialization_id, is_available_now, min_rating, search) |
| `/api/doctors/:id` | GET | Get doctor details |
| `/api/doctors/me` | GET | Get own doctor profile |
| `/api/doctors/me` | PUT | Update doctor profile |
| `/api/doctors/register` | POST | Register as doctor |
| `/api/doctors/credentials` | POST | Upload credential (multipart/form-data) |
| `/api/doctors/:id/specializations` | GET | Get doctor's specializations |
| `/api/doctors/me/specializations` | POST | Add specialization |
| `/api/doctors/me/specializations/:id` | PUT | Update specialization (set primary) |
| `/api/doctors/me/specializations/:id` | DELETE | Remove specialization |

**Verification Status:** `pending`, `under_review`, `verified`, `suspended`, `rejected`
**Credential Types:** `license`, `degree`, `certification`, `id_document`

### Specializations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/specializations` | GET | List all specializations |

**Categories:** `general`, `specialist`, `sub_specialist`

---

## Assistant Management

### Doctor Assistants

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/doctors/assistants/invite` | POST | Invite assistant |
| `/api/doctors/assistants` | GET | List my assistants |
| `/api/doctors/assistants/:id` | PUT | Update permissions |
| `/api/doctors/assistants/:id/revoke` | POST | Revoke access |
| `/api/assistants/invitations/:id/accept` | POST | Accept invitation |
| `/api/assistants/doctors` | GET | List my doctor assignments |
| `/api/assistants/action-logs` | GET | Get action logs |

**Permissions:** can_manage_availability, can_reschedule_appointments, can_view_patient_records, can_send_messages, can_observe_consultations

### Admin Assistants

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/assistants/invite` | POST | Invite admin assistant |
| `/api/admin/assistants` | GET | List admin assistants |
| `/api/admin/assistants/:id` | PUT | Update permissions |
| `/api/admin/assistants/:id/revoke` | POST | Revoke access |

**Scopes:** `support`, `verification`, `billing`, `general`
**Assignment Status:** `pending`, `active`, `suspended`, `revoked`

---

## Scheduling & Availability

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/doctors/:id/availability` | GET | Get weekly availability |
| `/api/doctors/:id/slots?date=YYYY-MM-DD` | GET | Get available time slots |
| `/api/doctors/me/availability` | POST | Create availability slot |
| `/api/doctors/me/availability/:id` | PUT | Update slot |
| `/api/doctors/me/availability/:id` | DELETE | Delete slot |
| `/api/doctors/me/blocked-times` | POST | Create blocked time |
| `/api/doctors/me/blocked-times/:id` | DELETE | Delete blocked time |

---

## Appointments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/appointments` | GET | List appointments (query: status, upcoming) |
| `/api/appointments` | POST | Book appointment |
| `/api/appointments/:id` | GET | Get appointment details |
| `/api/appointments/:id/status` | PUT | Update status (doctor) |
| `/api/appointments/:id/cancel` | POST | Cancel appointment |
| `/api/appointments/:id/join-waiting-room` | POST | Join waiting room (patient) |
| `/api/appointments/:id/start` | POST | Start consultation (doctor) |
| `/api/appointments/:id/end` | POST | End consultation (doctor) |
| `/api/appointments/:id/session` | GET | Get session details |
| `/api/appointments/:id/session/recording-consent` | POST | Request recording consent |
| `/api/appointments/:id/notes` | GET | Get consultation notes |
| `/api/appointments/:id/notes` | POST | Create/update notes (doctor) |
| `/api/appointments/:id/observer-consent` | POST | Consent to observer (patient) |

**Status:** `scheduled`, `in_waiting_room`, `in_progress`, `completed`, `cancelled`, `no_show`
**Types:** `scheduled`, `on_demand`

---

## Medical Records

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/medical-records` | GET | List records (query: record_type) |
| `/api/medical-records` | POST | Create record |
| `/api/medical-records/:id` | PUT | Update record |
| `/api/medical-records/:id` | DELETE | Soft delete record |
| `/api/allergies` | GET/POST | List/create allergies |
| `/api/allergies/:id` | PUT/DELETE | Update/delete allergy |
| `/api/conditions` | GET/POST | List/create conditions |
| `/api/conditions/:id` | PUT/DELETE | Update/delete condition |
| `/api/lab-results` | GET | List lab results |
| `/api/lab-results` | POST | Upload lab result (multipart/form-data) |
| `/api/lab-results/:id` | DELETE | Delete lab result |

**Record Types:** `general`, `chronic_condition`, `surgical_history`, `family_history`
**Allergy Severity:** `mild`, `moderate`, `severe`
**Condition Status:** `active`, `managed`, `resolved`

---

## Prescriptions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prescriptions` | GET | List prescriptions |
| `/api/prescriptions` | POST | Create prescription (doctor) |
| `/api/prescriptions/:id` | GET | Get prescription details |
| `/api/prescriptions/:id/pdf` | GET | Download PDF |
| `/api/prescriptions/:id/renewal-request` | POST | Request renewal (patient) |
| `/api/prescription-renewals/:id` | PUT | Respond to renewal (doctor) |

**Status:** `active`, `completed`, `cancelled`
**Renewal Status:** `pending`, `approved`, `denied`, `requires_consultation`

---

## Payments & Transactions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/initiate` | POST | Initiate payment |
| `/api/transactions` | GET | List transactions (patient) |
| `/api/transactions/:id` | GET | Get transaction status |
| `/api/doctors/me/earnings` | GET | Get earnings summary |
| `/api/doctors/me/payouts` | GET | List payouts |
| `/api/doctors/me/payouts` | POST | Request payout |

**Transaction Status:** `pending`, `completed`, `failed`, `refunded`
**Transaction Types:** `consultation`, `renewal`, `refund`
**Earnings Status:** `pending`, `available`, `paid_out`
**Payout Status:** `pending`, `processing`, `completed`, `failed`

---

## Invoices

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/invoices` | GET | List invoices |
| `/api/invoices/:id` | GET | Get invoice details |
| `/api/invoices/:id/pdf` | GET | Download PDF |

---

## Communication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/messages` | GET | List messages (query: conversation_id, with_profile_id) |
| `/api/messages` | POST | Send message |
| `/api/messages/:id/read` | PUT | Mark as read |
| `/api/notifications` | GET | List notifications |
| `/api/notifications/:id/read` | PUT | Mark as read |
| `/api/notifications/read-all` | PUT | Mark all as read |

**Message Types:** `text`, `file`, `system`

---

## Support Tickets

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/support-tickets` | GET | List my tickets |
| `/api/support-tickets` | POST | Create ticket |
| `/api/support-tickets/:id` | GET | Get ticket details |
| `/api/support-tickets/:id/messages` | POST | Add message |
| `/api/support-tickets/:id/internal-notes` | POST | Add internal note (admin) |

**Categories:** `technical`, `billing`, `doctor_complaint`, `other`
**Priorities:** `low`, `normal`, `high`, `urgent`
**Status:** `open`, `in_progress`, `waiting_response`, `resolved`, `closed`

---

## Reviews

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reviews` | POST | Submit review |
| `/api/reviews/:id` | PUT | Update review |
| `/api/doctors/:id/reviews` | GET | Get doctor reviews |
| `/api/reviews/:id/response` | POST | Doctor response |

---

## Announcements

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/announcements` | GET | Get active announcements |

---

## Admin Operations

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | List users (query: role, search, is_active) |
| `/api/admin/users/:id/suspend` | POST | Suspend user |
| `/api/admin/users/:id/reactivate` | POST | Reactivate user |

### Doctor Verification

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/doctors/pending` | GET | List pending verifications |
| `/api/admin/doctors/:id/verify` | POST | Verify doctor (action: approve/reject/request_more_info) |
| `/api/admin/doctors/:id/credentials` | GET | Get credentials |
| `/api/admin/doctors/credentials/:id/verify` | POST | Verify credential |

### Support & Reviews

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/support-tickets` | GET | List all tickets |
| `/api/admin/support-tickets/:id/assign` | PUT | Assign ticket |
| `/api/admin/support-tickets/:id/resolve` | POST | Resolve ticket |
| `/api/admin/reviews/:id/visibility` | PUT | Hide/unhide review |

### Transactions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/transactions` | GET | List transactions |
| `/api/admin/transactions/:id/refund` | POST | Process refund |

### System

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/settings` | GET | Get settings |
| `/api/admin/settings/:key` | PUT | Update setting |
| `/api/admin/announcements` | POST | Create announcement |
| `/api/admin/announcements/:id` | PUT/DELETE | Update/delete announcement |
| `/api/admin/audit-logs` | GET | Get audit logs (query: actor_profile_id, action, resource_type, from, to) |

**Trust Levels:** `support_agent`, `moderator`, `full_admin`, `super_admin`

---

## Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/paymob` | POST | Paymob payment callback (verify X-Paymob-Signature) |

---

## Real-Time Subscriptions

Subscribe to changes using Supabase Realtime:
- `appointments` - appointment status changes
- `messages` - new messages
- `notifications` - new notifications

---

## Rate Limits

| Category | Limit |
|----------|-------|
| Authentication | 10/min |
| Doctor Listings | 60/min |
| Appointments | 30/min |
| Payments | 10/min |
| Admin | 30/min |
| File Uploads | 10/min |

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input |
| CONFLICT | 409 | Resource exists |
| INTERNAL_ERROR | 500 | Server error |

---

*Aligned with database schema (00001_initial_schema.sql) and backend-plan.md*
