"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface DoctorAnalyticsStats {
    totalPatients: number;
    totalConsultations: number;
    totalRevenue: number;
    avgRating: number;
    ratingCount: number;
    patientChange: number; // percentage change from last month
    consultationChange: number;
    revenueChange: number;
    ratingChange: number;
}

export interface WeeklyDataPoint {
    day: string;
    dayIndex: number;
    consultations: number;
    revenue: number;
}

export interface SatisfactionData {
    overall: number;
    excellent: number;
    good: number;
    average: number;
    poor: number;
}

export interface DiagnosisStats {
    name: string;
    count: number;
    percentage: number;
}

export interface DoctorAnalyticsData {
    stats: DoctorAnalyticsStats;
    weeklyData: WeeklyDataPoint[];
    satisfaction: SatisfactionData;
    topDiagnoses: DiagnosisStats[];
    error?: string;
}

// ============================================
// Helper Functions
// ============================================

async function getDoctorProfileId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") return null;

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    return (doctorProfileData as { id: string } | null)?.id || null;
}

// ============================================
// Main Analytics Function
// ============================================

export async function getDoctorAnalytics(): Promise<DoctorAnalyticsData> {
    const supabase = await createClient();

    const doctorProfileId = await getDoctorProfileId(supabase);
    if (!doctorProfileId) {
        return {
            stats: {
                totalPatients: 0,
                totalConsultations: 0,
                totalRevenue: 0,
                avgRating: 0,
                ratingCount: 0,
                patientChange: 0,
                consultationChange: 0,
                revenueChange: 0,
                ratingChange: 0,
            },
            weeklyData: [],
            satisfaction: { overall: 0, excellent: 0, good: 0, average: 0, poor: 0 },
            topDiagnoses: [],
            error: "Not authenticated or not a doctor",
        };
    }

    // Get date ranges
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    // ============================================
    // Fetch Appointments and Calculate Stats
    // ============================================

    // Get all completed appointments (for total revenue and consultations)
    const { data: allAppointments } = await supabase
        .from("appointments")
        .select("id, patient_profile_id, scheduled_start, consultation_fee, status, patient_notes")
        .eq("doctor_profile_id", doctorProfileId)
        .eq("status", "completed");

    const appointments = allAppointments || [];
    const totalConsultations = appointments.length;
    const totalRevenue = appointments.reduce((sum, apt) => sum + ((apt as { consultation_fee?: number }).consultation_fee || 0), 0);

    // Get unique patients
    const uniquePatients = new Set(appointments.map(apt => (apt as { patient_profile_id: string }).patient_profile_id));
    const totalPatients = uniquePatients.size;

    // Get this month's and last month's stats for comparison
    const thisMonthAppointments = appointments.filter(apt => {
        const aptDate = new Date((apt as { scheduled_start: string }).scheduled_start);
        return aptDate >= startOfThisMonth;
    });

    const lastMonthAppointments = appointments.filter(apt => {
        const aptDate = new Date((apt as { scheduled_start: string }).scheduled_start);
        return aptDate >= startOfLastMonth && aptDate <= endOfLastMonth;
    });

    const thisMonthPatients = new Set(thisMonthAppointments.map(apt => (apt as { patient_profile_id: string }).patient_profile_id)).size;
    const lastMonthPatients = new Set(lastMonthAppointments.map(apt => (apt as { patient_profile_id: string }).patient_profile_id)).size;

    const thisMonthRevenue = thisMonthAppointments.reduce((sum, apt) => sum + ((apt as { consultation_fee?: number }).consultation_fee || 0), 0);
    const lastMonthRevenue = lastMonthAppointments.reduce((sum, apt) => sum + ((apt as { consultation_fee?: number }).consultation_fee || 0), 0);

    // Calculate percentage changes
    const patientChange = lastMonthPatients > 0
        ? Math.round(((thisMonthPatients - lastMonthPatients) / lastMonthPatients) * 100)
        : thisMonthPatients > 0 ? 100 : 0;

    const consultationChange = lastMonthAppointments.length > 0
        ? Math.round(((thisMonthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100)
        : thisMonthAppointments.length > 0 ? 100 : 0;

    const revenueChange = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : thisMonthRevenue > 0 ? 100 : 0;

    // ============================================
    // Get Doctor Rating
    // ============================================

    const { data: doctorData } = await supabase
        .from("doctor_profiles")
        .select("rating_average, rating_count")
        .eq("id", doctorProfileId)
        .single();

    const doctor = doctorData as { rating_average: number | null; rating_count: number | null } | null;
    const avgRating = doctor?.rating_average || 0;
    const ratingCount = doctor?.rating_count || 0;

    // ============================================
    // Weekly Data
    // ============================================

    const weeklyData: WeeklyDataPoint[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        const nextDay = new Date(dayDate);
        nextDay.setDate(dayDate.getDate() + 1);

        const dayAppointments = appointments.filter(apt => {
            const aptDate = new Date((apt as { scheduled_start: string }).scheduled_start);
            return aptDate >= dayDate && aptDate < nextDay;
        });

        weeklyData.push({
            day: dayNames[i],
            dayIndex: i,
            consultations: dayAppointments.length,
            revenue: dayAppointments.reduce((sum, apt) => sum + ((apt as { consultation_fee?: number }).consultation_fee || 0), 0),
        });
    }

    // ============================================
    // Patient Satisfaction from Reviews
    // ============================================

    const { data: reviewsData } = await supabase
        .from("reviews")
        .select("rating")
        .eq("doctor_profile_id", doctorProfileId)
        .eq("is_visible", true);

    const reviews = reviewsData || [];
    const totalReviews = reviews.length;

    let satisfaction: SatisfactionData;
    if (totalReviews > 0) {
        const excellentCount = reviews.filter(r => (r as { rating: number }).rating === 5).length;
        const goodCount = reviews.filter(r => (r as { rating: number }).rating === 4).length;
        const averageCount = reviews.filter(r => (r as { rating: number }).rating === 3).length;
        const poorCount = reviews.filter(r => (r as { rating: number }).rating <= 2).length;

        const overallSatisfaction = Math.round(((excellentCount + goodCount) / totalReviews) * 100);

        satisfaction = {
            overall: overallSatisfaction,
            excellent: Math.round((excellentCount / totalReviews) * 100),
            good: Math.round((goodCount / totalReviews) * 100),
            average: Math.round((averageCount / totalReviews) * 100),
            poor: Math.round((poorCount / totalReviews) * 100),
        };
    } else {
        satisfaction = { overall: 0, excellent: 0, good: 0, average: 0, poor: 0 };
    }

    // ============================================
    // Top Diagnoses (from consultation notes)
    // ============================================

    // Get consultation notes for diagnosis analysis
    const { data: notesData } = await supabase
        .from("consultation_notes")
        .select("diagnosis")
        .eq("doctor_profile_id", doctorProfileId);

    const notes = notesData || [];
    const diagnosisCounts = new Map<string, number>();

    notes.forEach(note => {
        const diagnosis = (note as { diagnosis?: string }).diagnosis;
        if (diagnosis) {
            // Clean and normalize diagnosis text
            const cleanDiagnosis = diagnosis.trim();
            if (cleanDiagnosis.length > 0) {
                diagnosisCounts.set(cleanDiagnosis, (diagnosisCounts.get(cleanDiagnosis) || 0) + 1);
            }
        }
    });

    // Sort by count and take top 5
    const sortedDiagnoses = Array.from(diagnosisCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const totalDiagnosisCount = sortedDiagnoses.reduce((sum, [, count]) => sum + count, 0);

    const topDiagnoses: DiagnosisStats[] = sortedDiagnoses.map(([name, count]) => ({
        name,
        count,
        percentage: totalDiagnosisCount > 0 ? Math.round((count / totalDiagnosisCount) * 100) : 0,
    }));

    // If no diagnoses found, provide default categories
    if (topDiagnoses.length === 0) {
        const defaultDiagnoses = ["General Checkup", "Follow-up", "Consultation", "Routine Check", "Health Assessment"];
        const perDiagnosis = Math.floor(totalConsultations / defaultDiagnoses.length);

        if (totalConsultations > 0) {
            topDiagnoses.push(
                ...defaultDiagnoses.map((name, idx) => ({
                    name,
                    count: idx === 0 ? totalConsultations - (perDiagnosis * (defaultDiagnoses.length - 1)) : perDiagnosis,
                    percentage: Math.round(100 / defaultDiagnoses.length),
                }))
            );
        }
    }

    return {
        stats: {
            totalPatients,
            totalConsultations,
            totalRevenue,
            avgRating,
            ratingCount,
            patientChange,
            consultationChange,
            revenueChange,
            ratingChange: 0, // Would need historical rating data to calculate
        },
        weeklyData,
        satisfaction,
        topDiagnoses,
    };
}
