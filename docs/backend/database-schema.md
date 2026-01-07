# TawariApp Database Schema

Detailed entity-relationship diagram and field definitions for all database tables.

---

## Entity Relationship Overview

```
users (1) ----< (N) profiles
users (1) ----< (N) patient_profiles
users (1) ----< (N) doctor_profiles
users (1) ----< (N) admin_profiles
users (1) ----< (N) assistant_profiles

doctor_profiles (1) ----< (N) doctor_credentials
doctor_profiles (1) ----< (N) doctor_availability
doctor_profiles (1) ----< (N) doctor_specializations

doctor_profiles (1) ----< (N) assistant_assignments >---- (N) assistant_profiles
admin_profiles (1) ----< (N) admin_assistant_assignments >---- (N) assistant_profiles

patient_profiles (1) ----< (N) medical_records
patient_profiles (1) ----< (N) allergies
patient_profiles (1) ----< (N) conditions
patient_profiles (1) ----< (N) lab_results
patient_profiles (1) ----< (N) family_access_grants

patient_profiles (N) ----< (1) appointments >---- (1) doctor_profiles
appointments (1) ----< (N) consultation_sessions
appointments (1) ----< (N) prescriptions
appointments (1) ----< (N) consultation_notes

patient_profiles (1) ----< (N) transactions
doctor_profiles (1) ----< (N) doctor_earnings
doctor_profiles (1) ----< (N) doctor_payouts

patient_profiles (1) ----< (N) reviews >---- (N) doctor_profiles

users (1) ----< (N) messages
users (1) ----< (N) notifications
users (1) ----< (N) support_tickets

all tables ----< audit_logs
```

---

## User Management Tables

### users
Base authentication table managed by Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Supabase Auth user ID |
| email | varchar(255) | UNIQUE, NOT NULL | User email |
| phone | varchar(20) | UNIQUE | Phone number |
| email_confirmed_at | timestamptz | | Email verification timestamp |
| phone_confirmed_at | timestamptz | | Phone verification timestamp |
| created_at | timestamptz | NOT NULL, DEFAULT now() | Account creation |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | Last update |
| last_sign_in_at | timestamptz | | Last login |
| raw_user_meta_data | jsonb | | Metadata from auth |

### profiles
Base profile information for all users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | Profile ID |
| user_id | uuid | FK users.id, UNIQUE, NOT NULL | Reference to auth user |
| role | varchar(20) | NOT NULL | patient, doctor, admin, doctor_assistant, admin_assistant |
| full_name | varchar(255) | NOT NULL | Display name |
| avatar_url | text | | Profile image URL |
| preferred_language | varchar(5) | DEFAULT 'en' | en or ar |
| timezone | varchar(50) | DEFAULT 'Africa/Cairo' | User timezone |
| is_active | boolean | DEFAULT true | Account active status |
| is_deleted | boolean | DEFAULT false | Soft delete flag |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### patient_profiles
Extended profile for patients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| profile_id | uuid | FK profiles.id, UNIQUE, NOT NULL | |
| date_of_birth | date | | Patient DOB |
| gender | varchar(20) | | male, female, other, prefer_not_to_say |
| blood_type | varchar(5) | | A+, A-, B+, B-, AB+, AB-, O+, O- |
| emergency_contact_name | varchar(255) | | |
| emergency_contact_phone | varchar(20) | | |
| national_id | varchar(20) | | Egyptian national ID |
| national_id_verified | boolean | DEFAULT false | ID verification status |
| verification_level | varchar(20) | DEFAULT 'email_only' | email_only, phone_verified, id_verified |
| late_cancellation_used_at | timestamptz | | Last penalty-free late cancel |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### doctor_profiles
Extended profile for doctors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| profile_id | uuid | FK profiles.id, UNIQUE, NOT NULL | |
| license_number | varchar(50) | UNIQUE | Medical license number |
| years_of_experience | integer | | |
| bio | text | | Doctor biography |
| consultation_fee | decimal(10,2) | | Base consultation fee in EGP |
| verification_status | varchar(20) | DEFAULT 'pending' | pending, under_review, verified, suspended, rejected |
| verification_notes | text | | Admin notes on verification |
| verified_at | timestamptz | | Verification timestamp |
| verified_by | uuid | FK profiles.id | Admin who verified |
| is_available_now | boolean | DEFAULT false | Currently accepting on-demand |
| rating_average | decimal(3,2) | DEFAULT 0 | Calculated rating (0-5) |
| rating_count | integer | DEFAULT 0 | Number of ratings |
| total_consultations | integer | DEFAULT 0 | Lifetime consultation count |
| max_assistants | integer | DEFAULT 5 | Assistant limit |
| two_factor_enabled | boolean | DEFAULT false | 2FA status |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### admin_profiles
Extended profile for administrators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| profile_id | uuid | FK profiles.id, UNIQUE, NOT NULL | |
| trust_level | varchar(20) | DEFAULT 'support_agent' | support_agent, moderator, full_admin, super_admin |
| department | varchar(50) | | support, verification, billing, general |
| two_factor_enabled | boolean | DEFAULT false | 2FA status |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### assistant_profiles
Extended profile for assistants (both doctor and admin assistants).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| profile_id | uuid | FK profiles.id, UNIQUE, NOT NULL | |
| assistant_type | varchar(20) | NOT NULL | doctor_assistant, admin_assistant |
| department | varchar(50) | | For admin assistants: support, verification, billing |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## Doctor Credential Tables

### doctor_credentials
Documents and certifications uploaded by doctors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| credential_type | varchar(50) | NOT NULL | license, degree, certification, id_document |
| document_url | text | NOT NULL | Storage URL |
| document_name | varchar(255) | | Original filename |
| issuing_authority | varchar(255) | | Who issued the credential |
| issue_date | date | | |
| expiry_date | date | | |
| verification_status | varchar(20) | DEFAULT 'pending' | pending, approved, rejected |
| verification_notes | text | | Admin notes |
| verified_at | timestamptz | | |
| verified_by | uuid | FK profiles.id | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### specializations
Master list of medical specializations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name_en | varchar(100) | NOT NULL | English name |
| name_ar | varchar(100) | NOT NULL | Arabic name |
| category | varchar(50) | | general, specialist, sub_specialist |
| min_fee | decimal(10,2) | | Minimum consultation fee |
| max_fee | decimal(10,2) | | Maximum consultation fee |
| is_active | boolean | DEFAULT true | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

### doctor_specializations
Many-to-many: doctors to specializations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| specialization_id | uuid | FK specializations.id, NOT NULL | |
| is_primary | boolean | DEFAULT false | Primary specialization |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

UNIQUE(doctor_profile_id, specialization_id)

---

## Assistant Assignment Tables

### doctor_assistant_assignments
Relationship between doctors and their assistants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| assistant_profile_id | uuid | FK assistant_profiles.id, NOT NULL | |
| status | varchar(20) | DEFAULT 'pending' | pending, active, suspended, revoked |
| permissions | jsonb | DEFAULT '{}' | Custom permission overrides |
| can_manage_availability | boolean | DEFAULT true | |
| can_reschedule_appointments | boolean | DEFAULT true | |
| can_view_patient_records | boolean | DEFAULT true | |
| can_send_messages | boolean | DEFAULT true | |
| can_observe_consultations | boolean | DEFAULT false | |
| invited_at | timestamptz | DEFAULT now() | |
| accepted_at | timestamptz | | |
| suspended_at | timestamptz | | |
| revoked_at | timestamptz | | |
| revoked_reason | text | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

UNIQUE(doctor_profile_id, assistant_profile_id)

### admin_assistant_assignments
Relationship between admins and their assistants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| admin_profile_id | uuid | FK admin_profiles.id | NULL for pool assignments |
| assistant_profile_id | uuid | FK assistant_profiles.id, NOT NULL | |
| status | varchar(20) | DEFAULT 'pending' | pending, active, suspended, revoked |
| scope | varchar(50) | | support, verification, billing, general |
| is_pool_assignment | boolean | DEFAULT false | Works in general pool |
| permissions | jsonb | DEFAULT '{}' | Custom permission overrides |
| can_triage_tickets | boolean | DEFAULT true | |
| can_respond_tickets | boolean | DEFAULT true | |
| can_prepare_verification | boolean | DEFAULT true | |
| can_view_transactions | boolean | DEFAULT true | |
| can_view_basic_analytics | boolean | DEFAULT true | |
| invited_at | timestamptz | DEFAULT now() | |
| accepted_at | timestamptz | | |
| suspended_at | timestamptz | | |
| revoked_at | timestamptz | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### assistant_action_logs
Track all actions performed by assistants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| assistant_profile_id | uuid | FK assistant_profiles.id, NOT NULL | |
| principal_profile_id | uuid | FK profiles.id, NOT NULL | Doctor or admin on whose behalf |
| action_type | varchar(50) | NOT NULL | appointment_rescheduled, message_sent, etc. |
| resource_type | varchar(50) | | appointment, message, availability, etc. |
| resource_id | uuid | | ID of affected resource |
| action_details | jsonb | | Details of the action |
| ip_address | inet | | |
| user_agent | text | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## Medical Data Tables

### medical_records
Patient health information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| record_type | varchar(50) | NOT NULL | general, chronic_condition, surgical_history, family_history |
| title | varchar(255) | NOT NULL | |
| description | text | | |
| date_recorded | date | | |
| recorded_by | uuid | FK profiles.id | Doctor or patient who added |
| is_self_reported | boolean | DEFAULT false | Patient added this |
| attachments | jsonb | DEFAULT '[]' | Array of file URLs |
| is_deleted | boolean | DEFAULT false | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### allergies
Patient allergies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| allergen | varchar(255) | NOT NULL | |
| severity | varchar(20) | | mild, moderate, severe |
| reaction | text | | Description of reaction |
| diagnosed_date | date | | |
| is_active | boolean | DEFAULT true | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### conditions
Chronic conditions and ongoing health issues.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| condition_name | varchar(255) | NOT NULL | |
| icd_code | varchar(20) | | ICD-10 code if applicable |
| diagnosed_date | date | | |
| status | varchar(20) | DEFAULT 'active' | active, managed, resolved |
| notes | text | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### lab_results
Uploaded test results.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| test_name | varchar(255) | NOT NULL | |
| test_date | date | NOT NULL | |
| lab_name | varchar(255) | | |
| document_url | text | | Storage URL |
| results_summary | text | | |
| uploaded_by | uuid | FK profiles.id | |
| is_deleted | boolean | DEFAULT false | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### family_access_grants
Family member access to patient records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | Owner of records |
| granted_to_profile_id | uuid | FK patient_profiles.id, NOT NULL | Family member |
| access_level | varchar(20) | NOT NULL | view_only, full, emergency |
| relationship | varchar(50) | | parent, child, spouse, sibling, other |
| granted_at | timestamptz | DEFAULT now() | |
| expires_at | timestamptz | | NULL for no expiry |
| revoked_at | timestamptz | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

UNIQUE(patient_profile_id, granted_to_profile_id)

---

## Scheduling Tables

### doctor_availability
Doctor working hours and availability.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| day_of_week | integer | CHECK (0-6) | 0=Sunday, 6=Saturday |
| start_time | time | NOT NULL | |
| end_time | time | NOT NULL | |
| is_active | boolean | DEFAULT true | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### doctor_blocked_times
Specific blocked time slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| start_datetime | timestamptz | NOT NULL | |
| end_datetime | timestamptz | NOT NULL | |
| reason | varchar(255) | | |
| created_by | uuid | FK profiles.id | Doctor or assistant |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

### appointments
Scheduled consultations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| scheduled_start | timestamptz | NOT NULL | |
| scheduled_end | timestamptz | NOT NULL | |
| actual_start | timestamptz | | When consultation actually started |
| actual_end | timestamptz | | When consultation actually ended |
| status | varchar(20) | DEFAULT 'scheduled' | scheduled, in_waiting_room, in_progress, completed, cancelled, no_show |
| appointment_type | varchar(20) | DEFAULT 'scheduled' | scheduled, on_demand |
| is_urgent | boolean | DEFAULT false | Patient flagged as urgent |
| chief_complaint | text | | Reason for visit |
| cancellation_reason | text | | |
| cancelled_by | uuid | FK profiles.id | |
| cancelled_at | timestamptz | | |
| refund_amount | decimal(10,2) | | Calculated refund if cancelled |
| refund_status | varchar(20) | | pending, processed, denied |
| booked_by | uuid | FK profiles.id | Patient, family member, or assistant |
| consultation_fee | decimal(10,2) | NOT NULL | Fee at time of booking |
| patient_joined_waiting_room_at | timestamptz | | |
| assistant_observer_id | uuid | FK assistant_profiles.id | If assistant observing |
| patient_consented_to_observer | boolean | DEFAULT false | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

INDEX on (doctor_profile_id, scheduled_start)
INDEX on (patient_profile_id, scheduled_start)
INDEX on (status)

### consultation_sessions
Video call session records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| appointment_id | uuid | FK appointments.id, NOT NULL | |
| jitsi_room_id | varchar(255) | | Jitsi room identifier |
| started_at | timestamptz | | |
| ended_at | timestamptz | | |
| duration_seconds | integer | | Calculated duration |
| patient_joined_at | timestamptz | | |
| doctor_joined_at | timestamptz | | |
| assistant_joined_at | timestamptz | | |
| recording_consent | boolean | DEFAULT false | |
| recording_url | text | | If recorded |
| connection_quality | varchar(20) | | good, fair, poor |
| technical_issues | jsonb | DEFAULT '[]' | Array of issues |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

### prescriptions
Medications prescribed by doctors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| appointment_id | uuid | FK appointments.id | NULL for renewal |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| medication_name | varchar(255) | NOT NULL | |
| dosage | varchar(100) | | |
| frequency | varchar(100) | | |
| duration | varchar(100) | | |
| instructions | text | | |
| quantity | integer | | |
| refills_allowed | integer | DEFAULT 0 | |
| refills_used | integer | DEFAULT 0 | |
| is_controlled_substance | boolean | DEFAULT false | |
| prescribed_at | timestamptz | DEFAULT now() | |
| valid_until | date | | |
| status | varchar(20) | DEFAULT 'active' | active, completed, cancelled |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### prescription_renewal_requests
Async renewal requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| original_prescription_id | uuid | FK prescriptions.id, NOT NULL | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| request_notes | text | | Patient notes |
| status | varchar(20) | DEFAULT 'pending' | pending, approved, denied, requires_consultation |
| doctor_response | text | | Doctor notes |
| responded_at | timestamptz | | |
| new_prescription_id | uuid | FK prescriptions.id | If approved |
| fee_amount | decimal(10,2) | | Renewal fee |
| transaction_id | uuid | FK transactions.id | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### consultation_notes
Doctor notes from appointments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| appointment_id | uuid | FK appointments.id, NOT NULL | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| subjective | text | | Patient reported symptoms |
| objective | text | | Doctor observations |
| assessment | text | | Diagnosis/assessment |
| plan | text | | Treatment plan |
| private_notes | text | | Doctor-only notes |
| follow_up_recommended | boolean | DEFAULT false | |
| follow_up_timeframe | varchar(50) | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## Payment Tables

### transactions
All payment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| appointment_id | uuid | FK appointments.id | |
| amount | decimal(10,2) | NOT NULL | |
| currency | varchar(3) | DEFAULT 'EGP' | |
| transaction_type | varchar(20) | NOT NULL | consultation, renewal, refund |
| status | varchar(20) | DEFAULT 'pending' | pending, completed, failed, refunded |
| paymob_order_id | varchar(100) | | Paymob reference |
| paymob_transaction_id | varchar(100) | | |
| payment_method | varchar(50) | | card, wallet, etc. |
| payment_details | jsonb | | Masked card info, etc. |
| refund_reason | text | | |
| refunded_amount | decimal(10,2) | | |
| refunded_at | timestamptz | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

INDEX on (patient_profile_id)
INDEX on (appointment_id)
INDEX on (paymob_order_id)

### doctor_earnings
Track doctor earnings per consultation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| appointment_id | uuid | FK appointments.id | |
| transaction_id | uuid | FK transactions.id | |
| gross_amount | decimal(10,2) | NOT NULL | Before platform fee |
| platform_fee | decimal(10,2) | NOT NULL | Platform commission |
| net_amount | decimal(10,2) | NOT NULL | Doctor receives |
| status | varchar(20) | DEFAULT 'pending' | pending, available, paid_out |
| available_at | timestamptz | | When funds become available |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

### doctor_payouts
Doctor withdrawal requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| amount | decimal(10,2) | NOT NULL | |
| status | varchar(20) | DEFAULT 'pending' | pending, processing, completed, failed |
| bank_account_details | jsonb | | Encrypted bank info |
| processed_at | timestamptz | | |
| processed_by | uuid | FK profiles.id | Admin who processed |
| reference_number | varchar(100) | | Bank reference |
| failure_reason | text | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### invoices
Receipts for patients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| transaction_id | uuid | FK transactions.id, NOT NULL | |
| invoice_number | varchar(50) | UNIQUE, NOT NULL | |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| doctor_name | varchar(255) | | Snapshot at time of invoice |
| service_description | text | | |
| subtotal | decimal(10,2) | | |
| tax_amount | decimal(10,2) | DEFAULT 0 | |
| total_amount | decimal(10,2) | | |
| pdf_url | text | | Generated PDF |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## Communication Tables

### messages
In-app messaging.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| conversation_id | uuid | NOT NULL | Groups messages |
| sender_profile_id | uuid | FK profiles.id, NOT NULL | |
| recipient_profile_id | uuid | FK profiles.id, NOT NULL | |
| content | text | NOT NULL | |
| message_type | varchar(20) | DEFAULT 'text' | text, file, system |
| attachment_url | text | | |
| attachment_type | varchar(20) | | image, document, etc. |
| is_read | boolean | DEFAULT false | |
| read_at | timestamptz | | |
| sent_on_behalf_of | uuid | FK profiles.id | If assistant sent |
| is_deleted | boolean | DEFAULT false | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

INDEX on (conversation_id, created_at)
INDEX on (recipient_profile_id, is_read)

### notifications
Push and in-app notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| profile_id | uuid | FK profiles.id, NOT NULL | |
| title | varchar(255) | NOT NULL | |
| body | text | | |
| notification_type | varchar(50) | NOT NULL | appointment_reminder, message, payment, etc. |
| data | jsonb | DEFAULT '{}' | Additional data |
| is_read | boolean | DEFAULT false | |
| read_at | timestamptz | | |
| is_pushed | boolean | DEFAULT false | Sent via push |
| pushed_at | timestamptz | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

INDEX on (profile_id, is_read, created_at)

### support_tickets
User issues and complaints.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| ticket_number | varchar(20) | UNIQUE, NOT NULL | Human-readable ID |
| submitted_by | uuid | FK profiles.id, NOT NULL | |
| category | varchar(50) | NOT NULL | technical, billing, doctor_complaint, other |
| subject | varchar(255) | NOT NULL | |
| description | text | NOT NULL | |
| priority | varchar(20) | DEFAULT 'normal' | low, normal, high, urgent |
| status | varchar(20) | DEFAULT 'open' | open, in_progress, waiting_response, resolved, closed |
| assigned_to | uuid | FK profiles.id | Admin or assistant |
| related_appointment_id | uuid | FK appointments.id | |
| resolution | text | | |
| resolved_at | timestamptz | | |
| resolved_by | uuid | FK profiles.id | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### support_ticket_messages
Conversation within a ticket.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| ticket_id | uuid | FK support_tickets.id, NOT NULL | |
| sender_profile_id | uuid | FK profiles.id, NOT NULL | |
| message | text | NOT NULL | |
| is_internal | boolean | DEFAULT false | Admin-only note |
| attachment_url | text | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## Review Tables

### reviews
Patient reviews of doctors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| appointment_id | uuid | FK appointments.id, UNIQUE, NOT NULL | One review per appointment |
| patient_profile_id | uuid | FK patient_profiles.id, NOT NULL | |
| doctor_profile_id | uuid | FK doctor_profiles.id, NOT NULL | |
| rating | integer | NOT NULL, CHECK (1-5) | |
| comment | text | | |
| is_anonymous | boolean | DEFAULT false | |
| is_visible | boolean | DEFAULT true | Admin can hide |
| hidden_reason | text | | |
| doctor_response | text | | Doctor can respond |
| doctor_responded_at | timestamptz | | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

INDEX on (doctor_profile_id, created_at)

---

## Platform Administration Tables

### audit_logs
Track all sensitive actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| actor_profile_id | uuid | FK profiles.id | NULL for system actions |
| actor_role | varchar(20) | | |
| action | varchar(100) | NOT NULL | |
| resource_type | varchar(50) | | |
| resource_id | uuid | | |
| old_values | jsonb | | Before state |
| new_values | jsonb | | After state |
| ip_address | inet | | |
| user_agent | text | | |
| metadata | jsonb | | Additional context |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

INDEX on (actor_profile_id, created_at)
INDEX on (resource_type, resource_id)
INDEX on (action, created_at)

### system_settings
Configurable platform parameters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| key | varchar(100) | UNIQUE, NOT NULL | |
| value | jsonb | NOT NULL | |
| description | text | | |
| updated_by | uuid | FK profiles.id | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

### announcements
Platform-wide notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| title_en | varchar(255) | NOT NULL | |
| title_ar | varchar(255) | NOT NULL | |
| body_en | text | | |
| body_ar | text | | |
| target_roles | varchar[] | DEFAULT '{}' | Empty = all roles |
| is_active | boolean | DEFAULT true | |
| starts_at | timestamptz | | |
| ends_at | timestamptz | | |
| created_by | uuid | FK profiles.id | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## Database Triggers

### updated_at Trigger
Apply to all tables with updated_at column.

```
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Doctor Rating Calculation
Update doctor_profiles.rating_average and rating_count when reviews change.

### Doctor Consultation Count
Update doctor_profiles.total_consultations when appointments complete.

### Invoice Number Generation
Auto-generate invoice_number on insert.

### Ticket Number Generation
Auto-generate ticket_number on insert.

---

## Indexes Summary

Critical indexes for performance:
- appointments(doctor_profile_id, scheduled_start)
- appointments(patient_profile_id, scheduled_start)
- appointments(status)
- transactions(patient_profile_id)
- transactions(paymob_order_id)
- messages(conversation_id, created_at)
- notifications(profile_id, is_read, created_at)
- audit_logs(actor_profile_id, created_at)
- audit_logs(resource_type, resource_id)
- reviews(doctor_profile_id, created_at)

---

## Next Steps

1. Create SQL migration files for each table group
2. Implement Row Level Security policies
3. Create database functions for complex operations
4. Set up real-time subscriptions for appointments and messages
5. Configure backup and point-in-time recovery
