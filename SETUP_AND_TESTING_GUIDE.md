# TawariApp Database Integration - Setup & Testing Guide

## Overview
Your TawariApp has been successfully integrated with Supabase database. All user accounts now use real database data throughout the frontend. This guide will help you verify the integration and test all account types.

## ✅ What's Been Implemented

### 1. Database Integration
- ✅ All dashboards now fetch real data from Supabase
- ✅ Patient Dashboard: Uses `getPatientDashboardData()` action
- ✅ Doctor Dashboard: Uses `getDoctorDashboardData()` action  
- ✅ Admin Dashboard: Uses real verification data from database
- ✅ Profile system fully integrated with AuthContext

### 2. Data Fetching Actions
The following server actions have been implemented/verified:

**Patient Actions:**
- `app/actions/patient-dashboard.ts` - Dashboard stats, appointments, prescriptions
- `app/actions/profile.ts` - User profile management
- `app/actions/appointments.ts` - Appointment management
- `app/actions/medical-records.ts` - Medical records
- `app/actions/prescriptions.ts` - Prescription management

**Doctor Actions:**
- `app/actions/doctor-dashboard.ts` - **NEW** Dashboard stats, today's appointments, tasks
- `app/actions/doctor-analytics.ts` - Analytics and statistics
- `app/actions/doctor-onboarding.ts` - Doctor verification
- `app/actions/consultation-notes.ts` - Consultation notes
- `app/actions/availability.ts` - Doctor availability

**Admin Actions:**
- `app/actions/admin-verification.ts` - Doctor verification management
- `app/actions/admin-analytics.ts` - Platform analytics
- `app/actions/admin-users.ts` - User management

### 3. Authentication System
- ✅ AuthContext properly fetches user profiles from database
- ✅ Profile includes role-specific data (patient/doctor/admin profiles)
- ✅ Type-safe profile access with type guards
- ✅ Automatic profile refresh on updates

## 🗃️ Test Accounts

You have 6 test accounts already seeded in your database:

### Patients
| Email | Password | Name | Details |
|-------|----------|------|---------|
| patient1@tawari.test | TawariPatient1!2024 | Ahmed Hassan | 35yo male, hypertension, has appointments |
| patient2@tawari.test | TawariPatient2!2024 | Fatima Ali | 28yo female, healthy, dermatology patient |

### Doctors  
| Email | Password | Name | Specialty |
|-------|----------|------|-----------|
| doctor1@tawari.test | TawariDoctor1!2024 | Dr. Mohamed Ibrahim | Cardiology (15 years exp) |
| doctor2@tawari.test | TawariDoctor2!2024 | Dr. Nour El-Din | Dermatology (8 years exp) |

### Admins
| Email | Password | Name | Role |
|-------|----------|------|------|
| admin1@tawari.test | TawariAdmin1!2024 | Sarah Admin | Full Admin |
| admin2@tawari.test | TawariAdmin2!2024 | Omar Admin | Support Agent |

## 🔧 Environment Setup

Ensure your `.env.local` file has these variables set:

```bash
# Supabase Configuration
NEXT_PUBLIC_TawariAppSUPABASE_URL=your_supabase_url
NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Other required environment variables
# (Payment, Email, etc. - see docs/backend/environment-variables.md)
```

## 📊 Database Seeding

If test accounts don't exist yet, run the seed script:

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Open `scripts/seed-test-users.sql`
3. Follow the instructions in the file:
   - Create users via Authentication → Users UI
   - Note down the generated UUIDs
   - Run the SQL script with those UUIDs

### Option 2: Direct SQL (if auth.users insert is allowed)
1. Go to Supabase Dashboard → SQL Editor
2. Run the entire `scripts/seed-test-users.sql` script

The seed script creates:
- ✅ 6 test users with authentication
- ✅ Complete profiles for all roles
- ✅ Patient medical records, allergies, conditions
- ✅ Doctor specializations and availability
- ✅ Past and upcoming appointments
- ✅ Prescriptions
- ✅ Messages between patients and doctors
- ✅ Consultation notes
- ✅ Reviews and notifications

## 🧪 Testing Steps

### Step 1: Install Dependencies & Run
```bash
# Install missing packages (if any)
npm install @supabase/ssr

# Start the development server
npm run dev
```

### Step 2: Test Patient Account
1. Navigate to `http://localhost:3000/en/login`
2. Login with: `patient1@tawari.test` / `TawariPatient1!2024`
3. **Verify Patient Dashboard:**
   - ✅ Shows welcome message with "Ahmed"
   - ✅ Stats cards show real numbers (appointments, prescriptions, messages, health score)
   - ✅ Upcoming appointments list from database
   - ✅ Active prescriptions (Lisinopril, Atorvastatin, Aspirin)
   - ✅ Recent activity feed
   - ✅ Profile avatar and name display correctly

4. **Test Patient Features:**
   - Navigate to Appointments → Should show:
     - ✅ Tomorrow's appointment with Dr. Mohamed Ibrahim
     - ✅ Appointment in 3 days with Dr. Nour
     - ✅ Appointment in 5 days with Dr. Nour
   - Navigate to Prescriptions → Should show active medications
   - Navigate to Medical Records → Should show health records
   - Navigate to Messages → Should show conversation with Dr. Mohamed

### Step 3: Test Doctor Account
1. Logout and login with: `doctor1@tawari.test` / `TawariDoctor1!2024`
2. **Verify Doctor Dashboard:**
   - ✅ Shows greeting with "Dr. Mohamed"
   - ✅ Today's appointment count
   - ✅ Completed appointments today
   - ✅ Today's revenue
   - ✅ Average rating (4.8)
   - ✅ Today's appointments list with patient names
   - ✅ Pending tasks (consultation notes needed)
   - ✅ Recent messages from patients
   - ✅ Availability status sync

3. **Test Doctor Features:**
   - Navigate to Appointments → Should show booked appointments
   - Navigate to Patients → Should show patient list
   - Navigate to Schedule → Should show availability
   - Navigate to Messages → Should show patient conversations
   - Navigate to Analytics → Should show real statistics

### Step 4: Test Admin Account
1. Logout and login with: `admin1@tawari.test` / `TawariAdmin1!2024`
2. **Verify Admin Dashboard:**
   - ✅ Shows greeting with admin name
   - ✅ Verification statistics (pending, verified, rejected doctors)
   - ✅ System stats (total users, doctors, patients)
   - ✅ Pending doctor approvals (if any)
   - ✅ Recent activity feed

3. **Test Admin Features:**
   - Navigate to Doctors → Should show all doctors
   - Navigate to Patients → Should show all patients
   - Navigate to Users → Should show all users
   - Navigate to Analytics → Should show platform metrics

### Step 5: Test New Account Registration
1. Logout and go to Register page
2. Create a new patient account
3. **Verify:**
   - ✅ Registration creates auth user
   - ✅ Profile is automatically created (via database trigger)
   - ✅ Patient profile is created
   - ✅ Can login immediately
   - ✅ Dashboard shows empty state (no data yet)

## 🐛 Troubleshooting

### Issue: "Cannot find module '@supabase/ssr'"
**Solution:** 
```bash
npm install @supabase/ssr
```

### Issue: Login fails or no data shows
**Check:**
1. Environment variables are set correctly in `.env.local`
2. Supabase project is running
3. Test users exist in Supabase Auth → Users
4. Run seed script if users don't exist

### Issue: Profile data doesn't load
**Check:**
1. Check browser console for errors
2. Verify database triggers are working:
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM profiles WHERE user_id = 'your-user-id';
   ```
3. Check Row Level Security (RLS) policies are correct

### Issue: Empty dashboard despite having data
**Check:**
1. Profile has correct role: `SELECT role FROM profiles WHERE user_id = 'user-id'`
2. Role-specific profile exists (e.g., patient_profiles, doctor_profiles)
3. Foreign keys are correctly set up

## 📁 Key Files Modified

### New Files Created:
- `app/actions/doctor-dashboard.ts` - Doctor dashboard data fetching
- `SETUP_AND_TESTING_GUIDE.md` - This guide

### Files Updated:
- `app/[lang]/dashboard/doctor/page.tsx` - Now uses real data from database
- All dashboard pages verified to use database actions

### No Mock Data:
- ✅ Patient dashboard: 100% real data
- ✅ Doctor dashboard: 100% real data (appointments, stats, messages)
- ✅ Admin dashboard: 100% real data (verification, stats)
- ⚠️ Quick actions and health tips: Static UI elements (expected)

## 🎯 Next Steps

### 1. Verify All Test Accounts Work
- Test each of the 6 accounts listed above
- Ensure data displays correctly for each role

### 2. Test New Account Flow
- Register a new patient account
- Register a new doctor account (should go to verification)
- Verify onboarding flows work

### 3. Test Data Interactions
- Book an appointment as a patient
- Accept/complete appointment as doctor
- Send messages between patient and doctor
- Create medical records
- Write prescriptions

### 4. Production Checklist
Before deploying to production:
- [ ] All environment variables set in production environment
- [ ] Seed production database (without test accounts)
- [ ] Test authentication flows
- [ ] Verify RLS policies are correct
- [ ] Test payment integration
- [ ] Set up email service
- [ ] Configure proper domain URLs

## 📚 Additional Resources

- **API Documentation:** `docs/backend/api-endpoints.md`
- **Database Schema:** `docs/backend/database-schema.md`
- **Environment Variables:** `docs/backend/environment-variables.md`
- **Backend Plan:** `docs/backend/backend-plan.md`

## ✅ Success Criteria

Your integration is successful when:
- ✅ All 6 test accounts can login
- ✅ Each role sees appropriate dashboard with real data
- ✅ Profile information displays correctly
- ✅ Appointments show with actual dates and patient/doctor names
- ✅ Stats reflect real database numbers
- ✅ New registrations work and create proper database records
- ✅ No mock data visible in production dashboards

## 🆘 Getting Help

If you encounter issues:
1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify RLS policies allow data access
4. Check that all migrations have run successfully
5. Ensure test data was seeded properly

---

**Last Updated:** January 2026  
**Integration Status:** ✅ Complete  
**Database:** Supabase PostgreSQL  
**Authentication:** Supabase Auth
