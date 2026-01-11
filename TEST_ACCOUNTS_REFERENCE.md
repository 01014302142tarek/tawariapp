# TawariApp Test Accounts Quick Reference

## 🔐 Login Credentials

### 👤 Patients

**Patient 1 - Ahmed Hassan**
- Email: `patient1@tawari.test`
- Password: `TawariPatient1!2024`
- Profile: 35-year-old male with hypertension
- Has: Appointments, prescriptions, medical records

**Patient 2 - Fatima Ali**
- Email: `patient2@tawari.test`  
- Password: `TawariPatient2!2024`
- Profile: 28-year-old female, generally healthy
- Has: Dermatology appointments and prescriptions

---

### 👨‍⚕️ Doctors

**Doctor 1 - Dr. Mohamed Ibrahim**
- Email: `doctor1@tawari.test`
- Password: `TawariDoctor1!2024`
- Specialty: Cardiology
- Experience: 15 years
- Fee: 350 EGP
- Rating: 4.8/5 (127 reviews)
- Status: Verified

**Doctor 2 - Dr. Nour El-Din**
- Email: `doctor2@tawari.test`
- Password: `TawariDoctor2!2024`
- Specialty: Dermatology
- Experience: 8 years
- Fee: 250 EGP
- Rating: 4.6/5 (89 reviews)
- Status: Verified

---

### 👑 Admins

**Admin 1 - Sarah Admin**
- Email: `admin1@tawari.test`
- Password: `TawariAdmin1!2024`
- Role: Full Admin
- Department: General
- 2FA: Enabled

**Admin 2 - Omar Admin**
- Email: `admin2@tawari.test`
- Password: `TawariAdmin2!2024`
- Role: Support Agent
- Department: Support
- 2FA: Disabled

---

## 🧪 Quick Testing Checklist

### Patient Login Test
- [ ] Login as patient1@tawari.test
- [ ] Dashboard shows appointments (3 upcoming)
- [ ] Dashboard shows prescriptions (3 active)
- [ ] Profile name is "Ahmed Hassan"
- [ ] Can navigate to all patient pages

### Doctor Login Test
- [ ] Login as doctor1@tawari.test
- [ ] Dashboard shows today's stats
- [ ] Dashboard shows today's appointments
- [ ] Dashboard shows pending tasks
- [ ] Profile name is "Dr. Mohamed Ibrahim"
- [ ] Rating shows 4.8/5

### Admin Login Test
- [ ] Login as admin1@tawari.test
- [ ] Dashboard shows verification stats
- [ ] Dashboard shows platform metrics
- [ ] Can access all admin pages
- [ ] Profile name is "Sarah Admin"

---

## 🔗 Quick Links

- Login Page: `/en/login`
- Register Page: `/en/register`
- Patient Dashboard: `/en/dashboard/patient`
- Doctor Dashboard: `/en/dashboard/doctor`
- Admin Dashboard: `/en/dashboard/admin`

---

## 📊 Expected Data

### For patient1@tawari.test:
- **Appointments:** 3 upcoming (1 tomorrow with Dr. Mohamed, 2 more later)
- **Prescriptions:** 3 active (Lisinopril, Atorvastatin, Aspirin)
- **Medical Records:** 3 records (hypertension diagnosis, checkup, family history)
- **Messages:** Conversation with Dr. Mohamed Ibrahim

### For doctor1@tawari.test:
- **Specialization:** Cardiology, Internal Medicine
- **Patients:** Multiple patients including Ahmed Hassan
- **Appointments:** Past completed and upcoming scheduled
- **Availability:** Sunday-Thursday 9 AM - 5 PM
- **Total Consultations:** 243
- **Rating:** 4.8 average from 127 reviews

### For admin1@tawari.test:
- **Access Level:** Full administrative access
- **Can:** Verify doctors, manage users, view analytics
- **Trust Level:** full_admin

---

## 🚨 Common Password

All test accounts use similar password pattern:
- Format: `Tawari{Role}{Number}!2024`
- Examples:
  - Patient: `TawariPatient1!2024`
  - Doctor: `TawariDoctor1!2024`
  - Admin: `TawariAdmin1!2024`

---

## 📝 Notes

- All test accounts have `.test` domain
- All accounts are pre-verified (except new registrations)
- Database is seeded with realistic test data
- Appointments have past, present, and future dates
- Messages include conversations between patients and doctors

---

**Security Notice:** These are TEST accounts only. Do NOT use in production. Change or remove before going live.
