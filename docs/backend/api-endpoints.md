# API Endpoints Specification

**Last Updated:** December 11, 2025  
**Base URL:** `https://tawariapp.vercel.app/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Doctors](#doctors)
4. [Availability](#availability)
5. [Consultations](#consultations)
6. [Prescriptions](#prescriptions)
7. [Payments](#payments)
8. [Admin](#admin)
9. [Webhooks](#webhooks)

---

## API Conventions

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <firebase_id_token>
Accept-Language: ar  # or 'en'
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": null
}

// Error response
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "رقم الهاتف غير صحيح",
    "details": { ... }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Authentication

### Register User

Create a new user account after Firebase phone verification.

```http
POST /api/auth/register
```

**Request:**
```json
{
  "firebaseToken": "eyJhbGci...",
  "name_ar": "أحمد محمد",
  "name_en": "Ahmed Mohamed",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+201012345678",
      "name_ar": "أحمد محمد",
      "role": "patient"
    },
    "patient": {
      "id": "uuid",
      "user_id": "uuid"
    }
  }
}
```

---

### Get Current User

Get the authenticated user's profile.

```http
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+201012345678",
      "name_ar": "أحمد محمد",
      "role": "patient",
      "avatar_url": "https://..."
    },
    "profile": {
      "id": "uuid",
      "date_of_birth": "1990-01-15",
      "gender": "male"
    }
  }
}
```

---

### Update Profile

Update the authenticated user's profile.

```http
PUT /api/auth/profile
```

**Request:**
```json
{
  "name_ar": "أحمد محمد علي",
  "avatar_url": "https://...",
  "date_of_birth": "1990-01-15",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "profile": { ... }
  }
}
```

---

## Users

### Upload Avatar

Upload a user profile photo.

```http
POST /api/users/avatar
Content-Type: multipart/form-data
```

**Request:**
```
file: <image file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "avatar_url": "https://supabase.co/storage/v1/object/public/avatars/..."
  }
}
```

---

## Doctors

### List Doctors

Get paginated list of verified doctors.

```http
GET /api/doctors
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `specialty` | string | Filter by specialty |
| `gender` | string | Filter by doctor gender |
| `is_online` | boolean | Only show online doctors |
| `min_rating` | number | Minimum rating (1-5) |
| `search` | string | Search by name |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "name_ar": "د. سارة أحمد",
        "specialty": "طب أطفال",
        "bio_ar": "طبيبة أطفال متخصصة...",
        "consultation_fee": 200,
        "rating_avg": 4.8,
        "rating_count": 150,
        "is_online": true,
        "avatar_url": "https://..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### Get Doctor Details

Get detailed doctor profile.

```http
GET /api/doctors/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "uuid",
      "name_ar": "د. سارة أحمد",
      "name_en": "Dr. Sara Ahmed",
      "specialty": "طب أطفال",
      "bio_ar": "طبيبة أطفال متخصصة في...",
      "years_experience": 10,
      "consultation_fee": 200,
      "rating_avg": 4.8,
      "rating_count": 150,
      "total_consultations": 500,
      "is_online": true,
      "is_accepting_patients": true,
      "avatar_url": "https://..."
    },
    "reviews": [
      {
        "patient_name": "م. أحمد",
        "rating": 5,
        "review": "طبيبة ممتازة...",
        "created_at": "2025-12-01T10:00:00Z"
      }
    ]
  }
}
```

---

### Register as Doctor

Register the current user as a doctor.

```http
POST /api/doctors/register
```

**Request:**
```json
{
  "specialty": "طب أطفال",
  "license_number": "EMS-12345",
  "years_experience": 10,
  "bio_ar": "طبيب متخصص في...",
  "consultation_fee": 200
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "uuid",
      "verification_status": "pending"
    }
  }
}
```

---

### Update Doctor Profile

Update doctor profile (for verified doctors).

```http
PUT /api/doctors/profile
```

**Request:**
```json
{
  "bio_ar": "Updated bio...",
  "consultation_fee": 250,
  "is_online": true,
  "is_accepting_patients": true
}
```

---

### Upload Doctor Document

Upload verification document.

```http
POST /api/doctors/documents
Content-Type: multipart/form-data
```

**Request:**
```
file: <document file>
type: medical_license | national_id | certificate | profile_photo
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "type": "medical_license",
      "file_url": "https://...",
      "is_verified": false
    }
  }
}
```

---

## Availability

### Get Doctor Availability

Get a doctor's weekly availability schedule.

```http
GET /api/availability/:doctorId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "slots": [
      {
        "id": "uuid",
        "day_of_week": 0,
        "day_name_ar": "الأحد",
        "start_time": "09:00",
        "end_time": "12:00",
        "is_active": true
      }
    ]
  }
}
```

---

### Get Available Time Slots

Get available booking slots for a specific date.

```http
GET /api/availability/:doctorId/slots
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `date` | string | Date in YYYY-MM-DD format |

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-12-15",
    "slots": [
      { "start": "09:00", "end": "09:30", "available": true },
      { "start": "09:30", "end": "10:00", "available": false },
      { "start": "10:00", "end": "10:30", "available": true }
    ]
  }
}
```

---

### Create Availability Slot

Create a new availability slot (doctor only).

```http
POST /api/availability
```

**Request:**
```json
{
  "day_of_week": 0,
  "start_time": "09:00",
  "end_time": "12:00"
}
```

---

### Update Availability Slot

```http
PUT /api/availability/:id
```

**Request:**
```json
{
  "start_time": "10:00",
  "end_time": "14:00",
  "is_active": true
}
```

---

### Delete Availability Slot

```http
DELETE /api/availability/:id
```

---

## Consultations

### Book Consultation

Create a new consultation booking.

```http
POST /api/consultations
```

**Request:**
```json
{
  "doctor_id": "uuid",
  "scheduled_at": "2025-12-15T10:00:00+02:00",
  "patient_complaint": "أعاني من صداع مستمر..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consultation": {
      "id": "uuid",
      "status": "scheduled",
      "scheduled_at": "2025-12-15T10:00:00+02:00",
      "jitsi_room_id": "tawari-abc123",
      "consultation_fee": 200
    },
    "payment": {
      "id": "uuid",
      "amount": 200,
      "vat": 28,
      "total": 228,
      "payment_url": "https://accept.paymob.com/..."
    }
  }
}
```

---

### Get Consultations

Get user's consultation history.

```http
GET /api/consultations
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `upcoming` | boolean | Only future consultations |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "consultations": [
      {
        "id": "uuid",
        "doctor": {
          "id": "uuid",
          "name_ar": "د. سارة أحمد",
          "specialty": "طب أطفال",
          "avatar_url": "https://..."
        },
        "status": "scheduled",
        "scheduled_at": "2025-12-15T10:00:00+02:00",
        "consultation_fee": 200
      }
    ],
    "pagination": { ... }
  }
}
```

---

### Get Consultation Details

```http
GET /api/consultations/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consultation": {
      "id": "uuid",
      "status": "scheduled",
      "scheduled_at": "2025-12-15T10:00:00+02:00",
      "jitsi_room_id": "tawari-abc123",
      "doctor": { ... },
      "patient": { ... },
      "prescription": { ... },
      "payment": { ... }
    }
  }
}
```

---

### Update Consultation Status

Update consultation status (for doctors).

```http
PUT /api/consultations/:id/status
```

**Request:**
```json
{
  "status": "in_progress"
}
```

---

### Cancel Consultation

Cancel a scheduled consultation.

```http
POST /api/consultations/:id/cancel
```

**Request:**
```json
{
  "reason": "لقد تغيرت ظروفي"
}
```

---

### Rate Consultation

Submit a rating after consultation.

```http
POST /api/consultations/:id/rate
```

**Request:**
```json
{
  "rating": 5,
  "review": "طبيبة ممتازة ومتفهمة"
}
```

---

## Prescriptions

### Create Prescription

Create a prescription for a consultation (doctor only).

```http
POST /api/prescriptions
```

**Request:**
```json
{
  "consultation_id": "uuid",
  "medications": [
    {
      "name_ar": "باراسيتامول",
      "name_en": "Paracetamol",
      "dosage": "500mg",
      "frequency": "3 مرات يومياً",
      "duration": "5 أيام",
      "instructions_ar": "بعد الأكل"
    }
  ],
  "diagnosis_ar": "التهاب في الحلق",
  "notes_ar": "ينصح بالراحة والإكثار من السوائل"
}
```

---

### Get Prescription

Get prescription details.

```http
GET /api/prescriptions/:id
```

---

### Download Prescription PDF

Download prescription as PDF.

```http
GET /api/prescriptions/:id/pdf
```

**Response:** PDF file

---

## Payments

### Initiate Payment

Start payment process for a consultation.

```http
POST /api/payments/initiate
```

**Request:**
```json
{
  "consultation_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_url": "https://accept.paymob.com/api/acceptance/iframes/...",
    "payment_id": "uuid"
  }
}
```

---

### Get Payment Status

Check payment status.

```http
GET /api/payments/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "status": "success",
      "amount": 200,
      "vat": 28,
      "total": 228,
      "paid_at": "2025-12-15T09:30:00Z"
    }
  }
}
```

---

### Get Payment History

Get user's payment history.

```http
GET /api/payments/history
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "consultation": { ... },
        "amount": 200,
        "vat": 28,
        "total": 228,
        "status": "success",
        "paid_at": "2025-12-15T09:30:00Z"
      }
    ]
  }
}
```

---

## Admin

### Get Pending Doctors

Get list of doctors pending verification.

```http
GET /api/admin/doctors/pending
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "name_ar": "د. محمد أحمد",
        "specialty": "طب عام",
        "license_number": "EMS-12345",
        "submitted_at": "2025-12-10T10:00:00Z",
        "documents": [
          {
            "type": "medical_license",
            "file_url": "https://..."
          }
        ]
      }
    ]
  }
}
```

---

### Verify Doctor

Approve or reject a doctor.

```http
POST /api/admin/doctors/:id/verify
```

**Request:**
```json
{
  "action": "approve",  // or "reject"
  "rejection_reason": "الوثائق غير واضحة"  // required if reject
}
```

---

### Get All Users

Get paginated list of all users.

```http
GET /api/admin/users
```

**Query Parameters:**
- `role`: Filter by role
- `search`: Search by name or phone
- `page`, `limit`: Pagination

---

### Suspend User

Suspend a user account.

```http
POST /api/admin/users/:id/suspend
```

**Request:**
```json
{
  "reason": "انتهاك شروط الاستخدام"
}
```

---

### Get Transactions

Get all payment transactions.

```http
GET /api/admin/transactions
```

**Query Parameters:**
- `status`: Filter by payment status
- `from`, `to`: Date range
- `page`, `limit`: Pagination

---

### Process Refund

Process a refund for a payment.

```http
POST /api/admin/payments/:id/refund
```

**Request:**
```json
{
  "reason": "إلغاء الاستشارة"
}
```

---

## Webhooks

### Paymob Webhook

Handle Paymob payment callbacks.

```http
POST /api/webhooks/paymob
```

**Headers:**
```http
X-Paymob-Signature: hmac_signature
```

**Request (from Paymob):**
```json
{
  "obj": {
    "id": 123456,
    "pending": false,
    "success": true,
    "order": {
      "id": 789012,
      "merchant_order_id": "consultation_uuid"
    },
    "amount_cents": 22800,
    "currency": "EGP"
  },
  "type": "TRANSACTION"
}
```

**Processing:**
1. Verify HMAC signature
2. Update payment status
3. Update consultation status
4. Send confirmation (SMS/notification)

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10 requests/minute |
| `/api/doctors` | 60 requests/minute |
| `/api/consultations` | 30 requests/minute |
| `/api/payments/*` | 10 requests/minute |
| `/api/admin/*` | 30 requests/minute |

---

## Pagination

All list endpoints support pagination:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

*This API specification provides the foundation for TawariApp's backend services.*
