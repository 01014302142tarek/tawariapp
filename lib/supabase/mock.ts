import type { Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const MOCK_SESSION_COOKIE = "tawari_mock_session";

export function isSupabaseConfigured(url?: string, key?: string): boolean {
    if (!url || !key) return false;
    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();
    if (!trimmedUrl || !trimmedKey) return false;
    if (
        trimmedUrl.includes("your-project.supabase.co") ||
        trimmedUrl.includes("YOUR_PROJECT_REF") ||
        trimmedKey === "your-anon-key" ||
        trimmedKey === "your-service-role-key"
    ) {
        return false;
    }
    return trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://");
}

interface MockAccount {
    id: string;
    email: string;
    password: string;
    role: "patient" | "doctor" | "admin";
    full_name: string;
    phone: string;
    avatar_url?: string;
    profile_id: string;
    patient_profile_id?: string;
    doctor_profile_id?: string;
    admin_profile_id?: string;
}

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const tomorrowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString();
const twoDaysLater = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
const twoDaysLaterEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString();
const todayLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
const todayLaterEnd = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

const MOCK_ACCOUNTS: MockAccount[] = [
    {
        id: "00000000-0000-4000-a000-000000000001",
        email: "patient1@tawari.test",
        password: "TawariPatient1!2024",
        role: "patient",
        full_name: "Ahmed Hassan",
        phone: "+201012345678",
        profile_id: "10000000-0000-4000-a000-000000000001",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
    },
    {
        id: "00000000-0000-4000-a000-000000000002",
        email: "patient2@tawari.test",
        password: "TawariPatient2!2024",
        role: "patient",
        full_name: "Fatima Ali",
        phone: "+201023456789",
        profile_id: "10000000-0000-4000-a000-000000000002",
        patient_profile_id: "20000000-0000-4000-a000-000000000002",
    },
    {
        id: "00000000-0000-4000-a000-000000000003",
        email: "doctor1@tawari.test",
        password: "TawariDoctor1!2024",
        role: "doctor",
        full_name: "Dr. Mohamed Ibrahim",
        phone: "+201034567890",
        avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
        profile_id: "10000000-0000-4000-a000-000000000003",
        doctor_profile_id: "30000000-0000-4000-a000-000000000001",
    },
    {
        id: "00000000-0000-4000-a000-000000000004",
        email: "doctor2@tawari.test",
        password: "TawariDoctor2!2024",
        role: "doctor",
        full_name: "Dr. Nour El-Din",
        phone: "+201045678901",
        avatar_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
        profile_id: "10000000-0000-4000-a000-000000000004",
        doctor_profile_id: "30000000-0000-4000-a000-000000000002",
    },
    {
        id: "00000000-0000-4000-a000-000000000005",
        email: "admin1@tawari.test",
        password: "TawariAdmin1!2024",
        role: "admin",
        full_name: "Sarah Admin",
        phone: "+201056789012",
        profile_id: "10000000-0000-4000-a000-000000000005",
        admin_profile_id: "40000000-0000-4000-a000-000000000001",
    },
    {
        id: "00000000-0000-4000-a000-000000000010",
        email: "tbakr373@gmail.com",
        password: "TawariGoogleUser!2024",
        role: "patient",
        full_name: "Tarek Bakr",
        phone: "+201014302142",
        profile_id: "10000000-0000-4000-a000-000000000010",
        patient_profile_id: "20000000-0000-4000-a000-000000000010",
    },
];

const SPECIALIZATIONS = [
    { id: "spec-1", name_en: "Cardiology", name_ar: "أمراض القلب والأوعية الدموية", is_active: true },
    { id: "spec-2", name_en: "Dermatology", name_ar: "الأمراض الجلدية والتناسلية", is_active: true },
    { id: "spec-3", name_en: "Pediatrics", name_ar: "طب الأطفال وحديثي الولادة", is_active: true },
    { id: "spec-4", name_en: "Psychiatry", name_ar: "الطب النفسي وعلاج الإدمان", is_active: true },
    { id: "spec-5", name_en: "Internal Medicine", name_ar: "الطب الباطني وطب الأسرة", is_active: true },
    { id: "spec-6", name_en: "Nutrition", name_ar: "التغذية العلاجية والسمنة", is_active: true },
];

const DOCTOR_PROFILES = [
    {
        id: "30000000-0000-4000-a000-000000000001",
        profile_id: "10000000-0000-4000-a000-000000000003",
        slug: "dr-mohamed-ibrahim",
        syndicate_number: "SYN-10021",
        bio: "Senior Consultant Cardiologist with 15+ years of clinical experience in preventive cardiology, hypertension management, and acute cardiac care at Cairo University Hospitals.",
        years_of_experience: 15,
        consultation_fee: 350,
        follow_up_fee: 175,
        verification_status: "verified",
        is_available_now: true,
        avg_consultation_minutes: 25,
        total_consultations: 243,
        rating_average: 4.8,
        rating_count: 127,
        clinic_name: "Cairo Heart Center",
        clinic_address: "Dokki, Giza, Egypt",
        clinic_phone: "+201034567890",
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000003",
            user_id: "00000000-0000-4000-a000-000000000003",
            role: "doctor",
            full_name: "Dr. Mohamed Ibrahim",
            avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
        },
        doctor_specializations: [
            { specializations: { id: "spec-1", name_en: "Cardiology", name_ar: "أمراض القلب والأوعية الدموية" }, is_primary: true },
            { specializations: { id: "spec-5", name_en: "Internal Medicine", name_ar: "الطب الباطني وطب الأسرة" }, is_primary: false },
        ],
    },
    {
        id: "30000000-0000-4000-a000-000000000002",
        profile_id: "10000000-0000-4000-a000-000000000004",
        slug: "dr-nour-el-din",
        syndicate_number: "SYN-10022",
        bio: "Specialist in clinical dermatology, eczema, acne therapy, and pediatric skin conditions with 8 years of telemedicine and hospital experience.",
        years_of_experience: 8,
        consultation_fee: 250,
        follow_up_fee: 125,
        verification_status: "verified",
        is_available_now: true,
        avg_consultation_minutes: 20,
        total_consultations: 164,
        rating_average: 4.6,
        rating_count: 89,
        clinic_name: "Al-Nour Skin & Laser Clinic",
        clinic_address: "Heliopolis, Cairo, Egypt",
        clinic_phone: "+201045678901",
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000004",
            user_id: "00000000-0000-4000-a000-000000000004",
            role: "doctor",
            full_name: "Dr. Nour El-Din",
            avatar_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
        },
        doctor_specializations: [
            { specializations: { id: "spec-2", name_en: "Dermatology", name_ar: "الأمراض الجلدية والتناسلية" }, is_primary: true },
        ],
    },
    {
        id: "30000000-0000-4000-a000-000000000003",
        profile_id: "10000000-0000-4000-a000-000000000006",
        slug: "dr-sara-el-masry",
        syndicate_number: "SYN-10023",
        bio: "Consultant Pediatrician & Neonatologist specializing in infant nutrition, acute childhood fevers, respiratory infections, and developmental tracking.",
        years_of_experience: 11,
        consultation_fee: 300,
        follow_up_fee: 150,
        verification_status: "verified",
        is_available_now: true,
        avg_consultation_minutes: 20,
        total_consultations: 198,
        rating_average: 4.9,
        rating_count: 142,
        clinic_name: "Maadi Children Care Clinic",
        clinic_address: "Maadi, Cairo, Egypt",
        clinic_phone: "+201067890123",
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000006",
            user_id: "00000000-0000-4000-a000-000000000006",
            role: "doctor",
            full_name: "Dr. Sara El-Masry",
            avatar_url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
        },
        doctor_specializations: [
            { specializations: { id: "spec-3", name_en: "Pediatrics", name_ar: "طب الأطفال وحديثي الولادة" }, is_primary: true },
        ],
    },
    {
        id: "30000000-0000-4000-a000-000000000004",
        profile_id: "10000000-0000-4000-a000-000000000007",
        slug: "dr-layla-mansour",
        syndicate_number: "SYN-10024",
        bio: "Consultant Psychiatrist & CBT Therapist providing confidential online sessions for anxiety, panic disorders, depression, and sleep disturbances.",
        years_of_experience: 10,
        consultation_fee: 400,
        follow_up_fee: 250,
        verification_status: "verified",
        is_available_now: false,
        avg_consultation_minutes: 45,
        total_consultations: 175,
        rating_average: 4.9,
        rating_count: 112,
        clinic_name: "Serenity Mind Clinic",
        clinic_address: "Zamalek, Cairo, Egypt",
        clinic_phone: "+201078901234",
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000007",
            user_id: "00000000-0000-4000-a000-000000000007",
            role: "doctor",
            full_name: "Dr. Layla Mansour",
            avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
        },
        doctor_specializations: [
            { specializations: { id: "spec-4", name_en: "Psychiatry", name_ar: "الطب النفسي وعلاج الإدمان" }, is_primary: true },
        ],
    },
    {
        id: "30000000-0000-4000-a000-000000000005",
        profile_id: "10000000-0000-4000-a000-000000000008",
        slug: "dr-karim-fawzy",
        syndicate_number: "SYN-10025",
        bio: "Internal Medicine & Family Physician managing diabetes, gastrointestinal disorders, thyroid diseases, and urgent general consultations.",
        years_of_experience: 14,
        consultation_fee: 280,
        follow_up_fee: 140,
        verification_status: "verified",
        is_available_now: true,
        avg_consultation_minutes: 25,
        total_consultations: 310,
        rating_average: 4.8,
        rating_count: 156,
        clinic_name: "Nile Internal Medicine Center",
        clinic_address: "Mohandessin, Giza, Egypt",
        clinic_phone: "+201089012345",
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000008",
            user_id: "00000000-0000-4000-a000-000000000008",
            role: "doctor",
            full_name: "Dr. Karim Fawzy",
            avatar_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
        },
        doctor_specializations: [
            { specializations: { id: "spec-5", name_en: "Internal Medicine", name_ar: "الطب الباطني وطب الأسرة" }, is_primary: true },
        ],
    },
    {
        id: "30000000-0000-4000-a000-000000000006",
        profile_id: "10000000-0000-4000-a000-000000000009",
        slug: "dr-mariam-adel",
        syndicate_number: "SYN-10026",
        bio: "Clinical Nutritionist & Metabolic Specialist crafting evidence-based therapeutic weight management and diabetic nutrition plans.",
        years_of_experience: 9,
        consultation_fee: 220,
        follow_up_fee: 110,
        verification_status: "verified",
        is_available_now: true,
        avg_consultation_minutes: 30,
        total_consultations: 135,
        rating_average: 4.9,
        rating_count: 94,
        clinic_name: "Vitality Clinical Nutrition",
        clinic_address: "New Cairo, Egypt",
        clinic_phone: "+201090123456",
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000009",
            user_id: "00000000-0000-4000-a000-000000000009",
            role: "doctor",
            full_name: "Dr. Mariam Adel",
            avatar_url: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
        },
        doctor_specializations: [
            { specializations: { id: "spec-6", name_en: "Nutrition", name_ar: "التغذية العلاجية والسمنة" }, is_primary: true },
        ],
    },
];

const PATIENT_PROFILES = [
    {
        id: "20000000-0000-4000-a000-000000000001",
        profile_id: "10000000-0000-4000-a000-000000000001",
        date_of_birth: "1991-04-15",
        gender: "male",
        blood_type: "O+",
        allergies: ["Penicillin"],
        chronic_conditions: ["Hypertension"],
        emergency_contact_name: "Mona Hassan",
        emergency_contact_phone: "+201099887766",
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000001",
            user_id: "00000000-0000-4000-a000-000000000001",
            role: "patient",
            full_name: "Ahmed Hassan",
            phone: "+201012345678",
        },
    },
    {
        id: "20000000-0000-4000-a000-000000000002",
        profile_id: "10000000-0000-4000-a000-000000000002",
        date_of_birth: "1998-09-20",
        gender: "female",
        blood_type: "A+",
        allergies: [],
        chronic_conditions: [],
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000002",
            user_id: "00000000-0000-4000-a000-000000000002",
            role: "patient",
            full_name: "Fatima Ali",
            phone: "+201023456789",
        },
    },
    {
        id: "20000000-0000-4000-a000-000000000010",
        profile_id: "10000000-0000-4000-a000-000000000010",
        date_of_birth: "1995-06-15",
        gender: "male",
        blood_type: "O+",
        allergies: [],
        chronic_conditions: [],
        created_at: yesterday,
        updated_at: now.toISOString(),
        profiles: {
            id: "10000000-0000-4000-a000-000000000010",
            user_id: "00000000-0000-4000-a000-000000000010",
            role: "patient",
            full_name: "Tarek Bakr",
            phone: "+201014302142",
        },
    },
];

const ADMIN_PROFILES = [
    {
        id: "40000000-0000-4000-a000-000000000001",
        profile_id: "10000000-0000-4000-a000-000000000005",
        admin_role: "full_admin",
        department: "General",
        can_verify_doctors: true,
        can_manage_users: true,
        can_view_analytics: true,
        can_manage_payments: true,
        can_handle_disputes: true,
        two_factor_enabled: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
    },
];

const PROFILES = [
    {
        id: "10000000-0000-4000-a000-000000000001",
        user_id: "00000000-0000-4000-a000-000000000001",
        role: "patient",
        full_name: "Ahmed Hassan",
        phone: "+201012345678",
        phone_verified: true,
        preferred_language: "en",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        patient_profiles: [PATIENT_PROFILES[0]],
    },
    {
        id: "10000000-0000-4000-a000-000000000002",
        user_id: "00000000-0000-4000-a000-000000000002",
        role: "patient",
        full_name: "Fatima Ali",
        phone: "+201023456789",
        phone_verified: true,
        preferred_language: "ar",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        patient_profiles: [PATIENT_PROFILES[1]],
    },
    {
        id: "10000000-0000-4000-a000-000000000003",
        user_id: "00000000-0000-4000-a000-000000000003",
        role: "doctor",
        full_name: "Dr. Mohamed Ibrahim",
        phone: "+201034567890",
        avatar_url: DOCTOR_PROFILES[0].profiles.avatar_url,
        phone_verified: true,
        preferred_language: "en",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        doctor_profiles: [DOCTOR_PROFILES[0]],
    },
    {
        id: "10000000-0000-4000-a000-000000000004",
        user_id: "00000000-0000-4000-a000-000000000004",
        role: "doctor",
        full_name: "Dr. Nour El-Din",
        phone: "+201045678901",
        avatar_url: DOCTOR_PROFILES[1].profiles.avatar_url,
        phone_verified: true,
        preferred_language: "ar",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        doctor_profiles: [DOCTOR_PROFILES[1]],
    },
    {
        id: "10000000-0000-4000-a000-000000000005",
        user_id: "00000000-0000-4000-a000-000000000005",
        role: "admin",
        full_name: "Sarah Admin",
        phone: "+201056789012",
        phone_verified: true,
        preferred_language: "en",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        admin_profiles: [ADMIN_PROFILES[0]],
    },
    {
        id: "10000000-0000-4000-a000-000000000006",
        user_id: "00000000-0000-4000-a000-000000000006",
        role: "doctor",
        full_name: "Dr. Sara El-Masry",
        phone: "+201067890123",
        avatar_url: DOCTOR_PROFILES[2].profiles.avatar_url,
        phone_verified: true,
        preferred_language: "ar",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        doctor_profiles: [DOCTOR_PROFILES[2]],
    },
    {
        id: "10000000-0000-4000-a000-000000000007",
        user_id: "00000000-0000-4000-a000-000000000007",
        role: "doctor",
        full_name: "Dr. Layla Mansour",
        phone: "+201078901234",
        avatar_url: DOCTOR_PROFILES[3].profiles.avatar_url,
        phone_verified: true,
        preferred_language: "ar",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        doctor_profiles: [DOCTOR_PROFILES[3]],
    },
    {
        id: "10000000-0000-4000-a000-000000000008",
        user_id: "00000000-0000-4000-a000-000000000008",
        role: "doctor",
        full_name: "Dr. Karim Fawzy",
        phone: "+201089012345",
        avatar_url: DOCTOR_PROFILES[4].profiles.avatar_url,
        phone_verified: true,
        preferred_language: "en",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        doctor_profiles: [DOCTOR_PROFILES[4]],
    },
    {
        id: "10000000-0000-4000-a000-000000000009",
        user_id: "00000000-0000-4000-a000-000000000009",
        role: "doctor",
        full_name: "Dr. Mariam Adel",
        phone: "+201090123456",
        avatar_url: DOCTOR_PROFILES[5].profiles.avatar_url,
        phone_verified: true,
        preferred_language: "ar",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        doctor_profiles: [DOCTOR_PROFILES[5]],
    },
    {
        id: "10000000-0000-4000-a000-000000000010",
        user_id: "00000000-0000-4000-a000-000000000010",
        role: "patient",
        full_name: "Tarek Bakr",
        phone: "+201014302142",
        phone_verified: true,
        preferred_language: "ar",
        is_active: true,
        created_at: yesterday,
        updated_at: now.toISOString(),
        patient_profiles: [PATIENT_PROFILES[2]],
    },
];

const APPOINTMENTS = [
    {
        id: "50000000-0000-4000-a000-000000000001",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        doctor_profile_id: "30000000-0000-4000-a000-000000000001",
        scheduled_start: todayLater,
        scheduled_end: todayLaterEnd,
        status: "scheduled",
        appointment_type: "scheduled",
        consultation_fee: 350,
        chief_complaint: "Blood pressure follow-up & medication review",
        created_at: yesterday,
        updated_at: yesterday,
        doctor_profiles: DOCTOR_PROFILES[0],
        patient_profiles: PATIENT_PROFILES[0],
    },
    {
        id: "50000000-0000-4000-a000-000000000002",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        doctor_profile_id: "30000000-0000-4000-a000-000000000002",
        scheduled_start: tomorrow,
        scheduled_end: tomorrowEnd,
        status: "scheduled",
        appointment_type: "scheduled",
        consultation_fee: 250,
        chief_complaint: "Seasonal skin rash evaluation",
        created_at: yesterday,
        updated_at: yesterday,
        doctor_profiles: DOCTOR_PROFILES[1],
        patient_profiles: PATIENT_PROFILES[0],
    },
    {
        id: "50000000-0000-4000-a000-000000000003",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        doctor_profile_id: "30000000-0000-4000-a000-000000000005",
        scheduled_start: twoDaysLater,
        scheduled_end: twoDaysLaterEnd,
        status: "scheduled",
        appointment_type: "scheduled",
        consultation_fee: 280,
        chief_complaint: "Annual comprehensive lab results review",
        created_at: yesterday,
        updated_at: yesterday,
        doctor_profiles: DOCTOR_PROFILES[4],
        patient_profiles: PATIENT_PROFILES[0],
    },
];

const PRESCRIPTIONS = [
    {
        id: "60000000-0000-4000-a000-000000000001",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        doctor_profile_id: "30000000-0000-4000-a000-000000000001",
        medication_name: "Lisinopril 10mg",
        dosage: "10mg tablet",
        frequency: "Once daily in the morning",
        duration_days: 30,
        status: "active",
        prescribed_at: yesterday,
        valid_until: twoDaysLater,
        doctor_profiles: DOCTOR_PROFILES[0],
        patient_profiles: PATIENT_PROFILES[0],
    },
    {
        id: "60000000-0000-4000-a000-000000000002",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        doctor_profile_id: "30000000-0000-4000-a000-000000000001",
        medication_name: "Atorvastatin 20mg",
        dosage: "20mg tablet",
        frequency: "Once daily at bedtime",
        duration_days: 30,
        status: "active",
        prescribed_at: yesterday,
        valid_until: twoDaysLater,
        doctor_profiles: DOCTOR_PROFILES[0],
        patient_profiles: PATIENT_PROFILES[0],
    },
    {
        id: "60000000-0000-4000-a000-000000000003",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        doctor_profile_id: "30000000-0000-4000-a000-000000000001",
        medication_name: "Aspirin Protect 100mg",
        dosage: "100mg enteric-coated",
        frequency: "Once daily after lunch",
        duration_days: 30,
        status: "active",
        prescribed_at: yesterday,
        valid_until: twoDaysLater,
        doctor_profiles: DOCTOR_PROFILES[0],
        patient_profiles: PATIENT_PROFILES[0],
    },
];

const REVIEWS = [
    {
        id: "70000000-0000-4000-a000-000000000001",
        doctor_profile_id: "30000000-0000-4000-a000-000000000001",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        rating: 5,
        comment: "Dr. Mohamed listened carefully to all my symptoms and adjusted my blood pressure plan clearly.",
        is_visible: true,
        created_at: yesterday,
        patient_profiles: PATIENT_PROFILES[0],
    },
    {
        id: "70000000-0000-4000-a000-000000000002",
        doctor_profile_id: "30000000-0000-4000-a000-000000000002",
        patient_profile_id: "20000000-0000-4000-a000-000000000002",
        rating: 5,
        comment: "Very thorough dermatology consultation and effective prescription.",
        is_visible: true,
        created_at: yesterday,
        patient_profiles: PATIENT_PROFILES[1],
    },
];

const MEDICAL_RECORDS = [
    {
        id: "80000000-0000-4000-a000-000000000001",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        title: "Hypertension & Lipid Panel Follow-up",
        record_type: "lab_result",
        description: "Blood pressure well controlled on Lisinopril 10mg; LDL within target range.",
        created_at: yesterday,
    },
    {
        id: "80000000-0000-4000-a000-000000000002",
        patient_profile_id: "20000000-0000-4000-a000-000000000001",
        title: "Resting 12-Lead ECG Report",
        record_type: "imaging",
        description: "Normal sinus rhythm, no acute ischemic changes.",
        created_at: yesterday,
    },
];

const MESSAGES = [
    {
        id: "90000000-0000-4000-a000-000000000001",
        conversation_id: "conv-1",
        sender_profile_id: "10000000-0000-4000-a000-000000000003",
        recipient_profile_id: "10000000-0000-4000-a000-000000000001",
        content: "Hello Ahmed, please remember to log your morning blood pressure reading before our call.",
        is_read: false,
        created_at: yesterday,
        sender: PROFILES[2],
        recipient: PROFILES[0],
    },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TABLES: Record<string, any[]> = {
    profiles: PROFILES,
    patient_profiles: PATIENT_PROFILES,
    doctor_profiles: DOCTOR_PROFILES,
    admin_profiles: ADMIN_PROFILES,
    specializations: SPECIALIZATIONS,
    appointments: APPOINTMENTS,
    prescriptions: PRESCRIPTIONS,
    reviews: REVIEWS,
    medical_records: MEDICAL_RECORDS,
    messages: MESSAGES,
    notifications: [],
    consultation_notes: [],
    consultation_sessions: [],
    consultation_queue: [],
    doctor_availability: [
        { id: "avail-1", doctor_profile_id: "30000000-0000-4000-a000-000000000001", day_of_week: 0, start_time: "09:00:00", end_time: "17:00:00", is_available: true, slot_duration_minutes: 30 },
        { id: "avail-2", doctor_profile_id: "30000000-0000-4000-a000-000000000001", day_of_week: 1, start_time: "09:00:00", end_time: "17:00:00", is_available: true, slot_duration_minutes: 30 },
        { id: "avail-3", doctor_profile_id: "30000000-0000-4000-a000-000000000001", day_of_week: 2, start_time: "09:00:00", end_time: "17:00:00", is_available: true, slot_duration_minutes: 30 },
        { id: "avail-4", doctor_profile_id: "30000000-0000-4000-a000-000000000001", day_of_week: 3, start_time: "09:00:00", end_time: "17:00:00", is_available: true, slot_duration_minutes: 30 },
        { id: "avail-5", doctor_profile_id: "30000000-0000-4000-a000-000000000001", day_of_week: 4, start_time: "09:00:00", end_time: "17:00:00", is_available: true, slot_duration_minutes: 30 },
    ],
    contact_submissions: [],
    payments: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createQueryBuilder(tableName: string, initialRows?: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rows: any[] = [...(initialRows ?? TABLES[tableName] ?? [])];
    let isSingle = false;
    let isMaybeSingle = false;
    let isHead = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = {
        select(_columns?: string, opts?: { count?: string; head?: boolean }) {
            if (opts?.head) isHead = true;
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        insert(payload: any) {
            const items = Array.isArray(payload) ? payload : [payload];
            const inserted = items.map((item) => ({
                id: item.id || crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...item,
            }));
            if (!TABLES[tableName]) TABLES[tableName] = [];
            TABLES[tableName].push(...inserted);
            rows = inserted;
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        update(payload: any) {
            rows = rows.map((r) => Object.assign(r, payload, { updated_at: new Date().toISOString() }));
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        upsert(payload: any) {
            return builder.insert(payload);
        },
        delete() {
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq(col: string, val: any) {
            const cleanCol = col.includes(".") ? col.split(".").pop()! : col;
            rows = rows.filter((r) => r?.[cleanCol] === val || r?.[col] === val);
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        neq(col: string, val: any) {
            rows = rows.filter((r) => r?.[col] !== val);
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gt(col: string, val: any) {
            rows = rows.filter((r) => r?.[col] > val);
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gte(col: string, val: any) {
            rows = rows.filter((r) => r?.[col] >= val);
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lt(col: string, val: any) {
            rows = rows.filter((r) => r?.[col] < val);
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lte(col: string, val: any) {
            rows = rows.filter((r) => r?.[col] <= val);
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        in(col: string, vals: any[]) {
            if (Array.isArray(vals)) {
                rows = rows.filter((r) => vals.includes(r?.[col]));
            }
            return builder;
        },
        not() {
            return builder;
        },
        is() {
            return builder;
        },
        ilike(col: string, pattern: string) {
            const needle = pattern.replace(/%/g, "").toLowerCase();
            rows = rows.filter((r) => String(r?.[col] ?? "").toLowerCase().includes(needle));
            return builder;
        },
        like(col: string, pattern: string) {
            return builder.ilike(col, pattern);
        },
        or() {
            return builder;
        },
        contains() {
            return builder;
        },
        order(col: string, opts?: { ascending?: boolean }) {
            const asc = opts?.ascending !== false;
            rows = [...rows].sort((a, b) => {
                const va = a?.[col] ?? 0;
                const vb = b?.[col] ?? 0;
                if (va < vb) return asc ? -1 : 1;
                if (va > vb) return asc ? 1 : -1;
                return 0;
            });
            return builder;
        },
        limit(n: number) {
            rows = rows.slice(0, n);
            return builder;
        },
        range(from: number, to: number) {
            rows = rows.slice(from, to + 1);
            return builder;
        },
        single() {
            isSingle = true;
            return builder;
        },
        maybeSingle() {
            isMaybeSingle = true;
            return builder;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
            let result;
            if (isSingle) {
                const item = rows[0] ?? null;
                result = {
                    data: item,
                    error: item ? null : { code: "PGRST116", message: "No rows found" },
                    count: rows.length,
                };
            } else if (isMaybeSingle) {
                result = {
                    data: rows[0] ?? null,
                    error: null,
                    count: rows.length,
                };
            } else if (isHead) {
                result = {
                    data: null,
                    error: null,
                    count: rows.length,
                };
            } else {
                result = {
                    data: rows,
                    error: null,
                    count: rows.length,
                };
            }
            return Promise.resolve(result).then(onFulfilled, onRejected);
        },
    };

    return builder;
}

function buildMockUser(account: MockAccount) {
    return {
        id: account.id,
        email: account.email,
        role: "authenticated",
        aud: "authenticated",
        email_confirmed_at: yesterday,
        created_at: yesterday,
        updated_at: now.toISOString(),
        app_metadata: { provider: "email" },
        user_metadata: {
            full_name: account.full_name,
            phone: account.phone,
            role: account.role,
        },
    };
}

function deterministicUuid(seed: string, prefix: string): string {
    let h1 = 0xdeadbeef ^ seed.length;
    let h2 = 0x41c6ce57 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
        const ch = seed.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
    return `${prefix}-0000-4000-a000-${hex(h1).slice(0, 4)}${hex(h2)}`;
}

export function getMockAccountByEmail(email?: string | null): MockAccount | null {
    if (!email) return null;
    const normalized = decodeURIComponent(email).toLowerCase().trim();
    return MOCK_ACCOUNTS.find((a) => a.email.toLowerCase() === normalized) ?? null;
}

export function upsertMockGoogleAccount(input: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role?: "patient" | "doctor";
    phone?: string;
}): MockAccount {
    const normalized = decodeURIComponent(input.email).toLowerCase().trim();
    const existing = getMockAccountByEmail(normalized);
    if (existing) {
        if (input.fullName && input.fullName.trim()) {
            existing.full_name = input.fullName.trim();
        }
        if (input.avatarUrl) {
            existing.avatar_url = input.avatarUrl;
        }
        const existingProfile = PROFILES.find((p) => p.id === existing.profile_id);
        if (existingProfile && input.fullName && input.fullName.trim()) {
            existingProfile.full_name = input.fullName.trim();
        }
        return existing;
    }

    const userId = deterministicUuid(normalized, "00000000");
    const profileId = deterministicUuid(normalized, "10000000");
    const role: "patient" | "doctor" = input.role === "doctor" ? "doctor" : "patient";
    const derivedName =
        input.fullName?.trim() ||
        normalized
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    const phone = input.phone?.trim() || "+201000000000";

    const account: MockAccount = {
        id: userId,
        email: normalized,
        password: "TawariGoogleUser!2024",
        role,
        full_name: derivedName,
        phone,
        avatar_url: input.avatarUrl,
        profile_id: profileId,
    };

    if (role === "doctor") {
        const doctorProfileId = deterministicUuid(normalized, "30000000");
        account.doctor_profile_id = doctorProfileId;
        const newDoctorProfile = {
            id: doctorProfileId,
            profile_id: profileId,
            slug: `dr-${normalized.split("@")[0].replace(/[^a-z0-9]+/g, "-")}`,
            syndicate_number: `SYN-${doctorProfileId.slice(-5).toUpperCase()}`,
            bio: "Medical Specialist on Tabibi Telemedicine Platform.",
            years_of_experience: 5,
            consultation_fee: 300,
            follow_up_fee: 150,
            verification_status: "verified",
            is_available_now: true,
            avg_consultation_minutes: 20,
            total_consultations: 0,
            rating_average: 5.0,
            rating_count: 1,
            clinic_name: "Tabibi Digital Clinic",
            clinic_address: "Cairo, Egypt",
            clinic_phone: phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profiles: {
                id: profileId,
                user_id: userId,
                role: "doctor",
                full_name: derivedName,
                avatar_url:
                    input.avatarUrl ||
                    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
            },
            doctor_specializations: [
                {
                    specializations: SPECIALIZATIONS[4],
                    is_primary: true,
                },
            ],
        };
        DOCTOR_PROFILES.push(newDoctorProfile);
        PROFILES.push({
            id: profileId,
            user_id: userId,
            role: "doctor",
            full_name: derivedName,
            phone,
            avatar_url: newDoctorProfile.profiles.avatar_url,
            phone_verified: true,
            preferred_language: "ar",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            doctor_profiles: [newDoctorProfile],
        });
    } else {
        const patientProfileId = deterministicUuid(normalized, "20000000");
        account.patient_profile_id = patientProfileId;
        const newPatientProfile = {
            id: patientProfileId,
            profile_id: profileId,
            date_of_birth: "1995-01-01",
            gender: "male",
            blood_type: "O+",
            allergies: [],
            chronic_conditions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profiles: {
                id: profileId,
                user_id: userId,
                role: "patient",
                full_name: derivedName,
                phone,
            },
        };
        PATIENT_PROFILES.push(newPatientProfile);
        PROFILES.push({
            id: profileId,
            user_id: userId,
            role: "patient",
            full_name: derivedName,
            phone,
            phone_verified: true,
            preferred_language: "ar",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            patient_profiles: [newPatientProfile],
        });
    }

    MOCK_ACCOUNTS.push(account);
    return account;
}

export function createMockSupabaseClient(options?: {
    getSessionEmail?: () => string | null;
    setSessionEmail?: (email: string | null) => void;
}): SupabaseClient<Database> {
    const authListeners = new Set<(event: string, session: unknown) => void>();
    let lastKnownEmail: string | null | undefined = undefined;

    const getActiveAccount = (): MockAccount | null => {
        const email = options?.getSessionEmail?.();
        if (!email) return null;
        return getMockAccountByEmail(email) ?? upsertMockGoogleAccount({ email });
    };

    const getActiveSession = () => {
        const account = getActiveAccount();
        if (!account) return null;
        const user = buildMockUser(account);
        return {
            access_token: `mock-token-${account.id}`,
            refresh_token: `mock-refresh-${account.id}`,
            expires_in: 3600,
            token_type: "bearer",
            user,
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = {
        from(tableName: string) {
            return createQueryBuilder(tableName);
        },
        rpc() {
            return Promise.resolve({ data: null, error: null });
        },
        channel() {
            const ch = {
                on: () => ch,
                subscribe: () => ch,
                unsubscribe: () => Promise.resolve("ok"),
            };
            return ch;
        },
        removeChannel() {
            return Promise.resolve("ok");
        },
        storage: {
            from() {
                return {
                    upload: async () => ({ data: { path: "mock-upload.png" }, error: null }),
                    getPublicUrl: () => ({ data: { publicUrl: "/logo.png" } }),
                    createSignedUrl: async () => ({ data: { signedUrl: "/logo.png" }, error: null }),
                    remove: async () => ({ data: [], error: null }),
                };
            },
        },
        auth: {
            async getUser() {
                const account = getActiveAccount();
                return {
                    data: { user: account ? buildMockUser(account) : null },
                    error: null,
                };
            },
            async getSession() {
                const currentEmail = options?.getSessionEmail?.() ?? null;
                const session = getActiveSession();
                if (lastKnownEmail !== undefined && lastKnownEmail !== currentEmail) {
                    const event = session ? "SIGNED_IN" : "SIGNED_OUT";
                    authListeners.forEach((cb) => cb(event, session));
                }
                lastKnownEmail = currentEmail;
                return {
                    data: { session },
                    error: null,
                };
            },
            async signInWithPassword({ email, password }: { email: string; password: string }) {
                const account = getMockAccountByEmail(email);
                if (!account || account.password !== password) {
                    return {
                        data: { user: null, session: null },
                        error: { message: "Invalid email or password", status: 400 },
                    };
                }
                options?.setSessionEmail?.(account.email);
                const session = getActiveSession();
                authListeners.forEach((cb) => cb("SIGNED_IN", session));
                return {
                    data: { user: buildMockUser(account), session },
                    error: null,
                };
            },
            async signUp({
                email,
                password,
                options: signUpOpts,
            }: {
                email: string;
                password: string;
                options?: { data?: { full_name?: string; phone?: string; role?: string } };
            }) {
                const normalized = email.toLowerCase().trim();
                let account = getMockAccountByEmail(normalized);
                if (!account) {
                    const userId = crypto.randomUUID();
                    const profileId = crypto.randomUUID();
                    const role = (signUpOpts?.data?.role as "patient" | "doctor" | "admin") || "patient";
                    account = {
                        id: userId,
                        email: normalized,
                        password,
                        role,
                        full_name: signUpOpts?.data?.full_name || normalized.split("@")[0],
                        phone: signUpOpts?.data?.phone || "+201000000000",
                        profile_id: profileId,
                    };
                    MOCK_ACCOUNTS.push(account);
                    PROFILES.push({
                        id: profileId,
                        user_id: userId,
                        role,
                        full_name: account.full_name,
                        phone: account.phone,
                        phone_verified: true,
                        preferred_language: "en",
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        patient_profiles: [],
                    });
                }
                options?.setSessionEmail?.(account.email);
                const session = getActiveSession();
                authListeners.forEach((cb) => cb("SIGNED_IN", session));
                return {
                    data: { user: buildMockUser(account), session },
                    error: null,
                };
            },
            async signOut() {
                options?.setSessionEmail?.(null);
                authListeners.forEach((cb) => cb("SIGNED_OUT", null));
                return { error: null };
            },
            async resetPasswordForEmail() {
                return { data: {}, error: null };
            },
            async updateUser() {
                const account = getActiveAccount();
                return {
                    data: { user: account ? buildMockUser(account) : null },
                    error: null,
                };
            },
            async signInWithOAuth() {
                return { data: { provider: "google", url: "/en/login" }, error: null };
            },
            async exchangeCodeForSession() {
                return { data: { session: getActiveSession() }, error: null };
            },
            onAuthStateChange(callback: (event: string, session: unknown) => void) {
                authListeners.add(callback);
                return {
                    data: {
                        subscription: {
                            unsubscribe: () => {
                                authListeners.delete(callback);
                            },
                        },
                    },
                };
            },
            admin: {
                async createUser({
                    email,
                    password,
                    user_metadata,
                }: {
                    email: string;
                    password?: string;
                    user_metadata?: { full_name?: string; phone?: string; role?: string };
                }) {
                    const normalized = email.toLowerCase().trim();
                    const existing = getMockAccountByEmail(normalized);
                    if (existing) {
                        return { data: { user: null }, error: { message: "User already registered" } };
                    }
                    const userId = crypto.randomUUID();
                    const profileId = crypto.randomUUID();
                    const role = (user_metadata?.role as "patient" | "doctor" | "admin") || "patient";
                    const account: MockAccount = {
                        id: userId,
                        email: normalized,
                        password: password || "TawariPass!2024",
                        role,
                        full_name: user_metadata?.full_name || normalized.split("@")[0],
                        phone: user_metadata?.phone || "+201000000000",
                        profile_id: profileId,
                    };
                    MOCK_ACCOUNTS.push(account);
                    const patientProfileId = crypto.randomUUID();
                    const newPatientProfile = {
                        id: patientProfileId,
                        profile_id: profileId,
                        date_of_birth: "1995-01-01",
                        gender: "male",
                        blood_type: "O+",
                        allergies: [],
                        chronic_conditions: [],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        profiles: {
                            id: profileId,
                            user_id: userId,
                            role,
                            full_name: account.full_name,
                            phone: account.phone,
                        },
                    };
                    PATIENT_PROFILES.push(newPatientProfile);
                    PROFILES.push({
                        id: profileId,
                        user_id: userId,
                        role,
                        full_name: account.full_name,
                        phone: account.phone,
                        phone_verified: true,
                        preferred_language: "en",
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        patient_profiles: [newPatientProfile],
                    });
                    return { data: { user: buildMockUser(account) }, error: null };
                },
                async deleteUser() {
                    return { data: {}, error: null };
                },
                async listUsers() {
                    return {
                        data: { users: MOCK_ACCOUNTS.map(buildMockUser) },
                        error: null,
                    };
                },
                async getUserById(id: string) {
                    const acc = MOCK_ACCOUNTS.find((a) => a.id === id);
                    return {
                        data: { user: acc ? buildMockUser(acc) : null },
                        error: null,
                    };
                },
            },
        },
    };

    return client as SupabaseClient<Database>;
}
