"use server";

import { createClient } from "@/lib/supabase/server";

// ============================================
// Types
// ============================================

export interface AdminAnalytics {
    total_revenue: number;
    total_users: number;
    total_appointments: number;
    avg_session_minutes: number;
    monthly_appointments: MonthlyData[];
    top_doctors: TopDoctor[];
}

export interface MonthlyData {
    month: string;
    value: number;
}

export interface TopDoctor {
    rank: number;
    id: string;
    name: string;
    specialty: string;
    revenue: number;
    patients: number;
}

export interface SystemOverviewMetrics {
    uptime_percentage: number; // Calculated from appointment completion rate
    satisfaction_percentage: number; // Average rating from reviews
    active_sessions: number; // Current or recent active consultation sessions
    total_sessions_capacity: number; // Expected capacity (for progress bar)
}

// ============================================
// Helper to check if caller is admin
// ============================================

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{ isAdmin: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { isAdmin: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { role: string } | null;
    if (!profile || profile.role !== "admin") {
        return { isAdmin: false, error: "Unauthorized - Admin access required" };
    }

    return { isAdmin: true };
}

// ============================================
// Analytics Actions
// ============================================

/**
 * Get platform analytics data
 */
export async function getAdminAnalytics(): Promise<{ analytics: AdminAnalytics; error?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return {
            analytics: {
                total_revenue: 0,
                total_users: 0,
                total_appointments: 0,
                avg_session_minutes: 0,
                monthly_appointments: [],
                top_doctors: [],
            },
            error: authError
        };
    }

    // Get total users
    const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    // Get total appointments
    const { count: appointmentCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

    // Get total revenue from completed transactions
    const { data: transactionData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("status", "completed");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRevenue = (transactionData || []).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    // Calculate average session duration from completed consultations
    const { data: sessionData } = await supabase
        .from("consultation_sessions")
        .select("started_at, ended_at")
        .not("ended_at", "is", null);

    const sessions = (sessionData || []) as Array<{ started_at: string | null; ended_at: string | null }>;
    let avgSessionMinutes = 0;
    if (sessions.length > 0) {
        const totalMinutes = sessions.reduce((sum: number, s) => {
            if (s.started_at && s.ended_at) {
                const start = new Date(s.started_at);
                const end = new Date(s.ended_at);
                return sum + (end.getTime() - start.getTime()) / 60000;
            }
            return sum;
        }, 0);
        avgSessionMinutes = Math.round((totalMinutes / sessions.length) * 10) / 10;
    }

    // Get monthly appointment counts for the current year - single query instead of 12
    const currentYear = new Date().getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const { data: yearAppointments } = await supabase
        .from("appointments")
        .select("scheduled_start")
        .gte("scheduled_start", startOfYear.toISOString())
        .lte("scheduled_start", endOfYear.toISOString());

    // Group by month client-side instead of N queries
    const monthlyAppointments: MonthlyData[] = monthNames.map((month, i) => ({
        month,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: (yearAppointments || []).filter((apt: any) => {
            const aptMonth = new Date(apt.scheduled_start).getMonth();
            return aptMonth === i;
        }).length,
    }));

    // Get top doctors by earnings
    const { data: earningsData } = await supabase
        .from("doctor_earnings")
        .select(`
            doctor_profile_id,
            gross_amount,
            doctor_profiles (
                id,
                profiles (
                    full_name
                ),
                doctor_specializations (
                    specializations (
                        name_en
                    )
                )
            )
        `)
        .eq("status", "paid");

    // Aggregate earnings by doctor
    const doctorEarningsMap = new Map<string, { name: string; specialty: string; revenue: number; patients: Set<string> }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (earningsData || []).forEach((e: any) => {
        const doctorId = e.doctor_profile_id;
        const existing = doctorEarningsMap.get(doctorId);

        const specialties = e.doctor_profiles?.doctor_specializations || [];
        const specialty = specialties.length > 0 ? (specialties[0]?.specializations?.name_en || "General") : "General";

        if (existing) {
            existing.revenue += e.gross_amount || 0;
        } else {
            doctorEarningsMap.set(doctorId, {
                name: e.doctor_profiles?.profiles?.full_name || "Unknown",
                specialty,
                revenue: e.gross_amount || 0,
                patients: new Set(),
            });
        }
    });

    // Get patient counts for all doctors in a single query instead of N queries
    const doctorIds = Array.from(doctorEarningsMap.keys());

    const { data: allDoctorAppointments } = doctorIds.length > 0
        ? await supabase
            .from("appointments")
            .select("doctor_profile_id, patient_profile_id")
            .in("doctor_profile_id", doctorIds)
            .in("status", ["completed", "in_progress"])
        : { data: [] };

    // Count unique patients per doctor client-side
    const patientCountsByDoctor = new Map<string, Set<string>>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (allDoctorAppointments || []).forEach((apt: any) => {
        const set = patientCountsByDoctor.get(apt.doctor_profile_id) || new Set();
        set.add(apt.patient_profile_id);
        patientCountsByDoctor.set(apt.doctor_profile_id, set);
    });

    // Update earnings map with patient counts
    for (const [doctorId, entry] of doctorEarningsMap.entries()) {
        entry.patients = patientCountsByDoctor.get(doctorId) || new Set();
    }

    // Sort and rank doctors
    const sortedDoctors = Array.from(doctorEarningsMap.entries())
        .map(([id, data]) => ({
            id,
            name: data.name,
            specialty: data.specialty,
            revenue: data.revenue,
            patients: data.patients.size,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((d, idx) => ({ ...d, rank: idx + 1 }));

    return {
        analytics: {
            total_revenue: totalRevenue,
            total_users: userCount || 0,
            total_appointments: appointmentCount || 0,
            avg_session_minutes: avgSessionMinutes || 12.5, // Default if no data
            monthly_appointments: monthlyAppointments,
            top_doctors: sortedDoctors,
        }
    };
}

/**
 * Get system overview metrics for admin dashboard
 */
export async function getSystemOverview(): Promise<{ metrics: SystemOverviewMetrics; error?: string }> {
    const supabase = await createClient();

    const { isAdmin, error: authError } = await verifyAdmin(supabase);
    if (!isAdmin) {
        return {
            metrics: {
                uptime_percentage: 0,
                satisfaction_percentage: 0,
                active_sessions: 0,
                total_sessions_capacity: 200,
            },
            error: authError
        };
    }

    try {
        // Calculate "uptime" as appointment completion rate (successful appointments / total)
        const { count: totalAppointments } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true });

        const { count: completedAppointments } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("status", "completed");

        let uptimePercentage = 99.9; // Default high uptime
        if (totalAppointments && totalAppointments > 0) {
            uptimePercentage = Math.round((completedAppointments || 0) / totalAppointments * 1000) / 10;
        }

        // Calculate satisfaction from average reviews rating
        const { data: reviewsData } = await supabase
            .from("reviews")
            .select("rating");

        let satisfactionPercentage = 0;
        if (reviewsData && reviewsData.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const avgRating = reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length;
            satisfactionPercentage = Math.round((avgRating / 5) * 100); // Convert 1-5 rating to percentage
        }

        // Get active or recent consultation sessions (in the last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const { count: activeSessions } = await supabase
            .from("consultation_sessions")
            .select("*", { count: "exact", head: true })
            .gte("started_at", oneDayAgo.toISOString());

        // Set capacity based on concurrent doctor availability (use total doctors * 5 as rough estimate)
        const { count: totalDoctors } = await supabase
            .from("doctor_profiles")
            .select("*", { count: "exact", head: true })
            .eq("verification_status", "verified");

        const capacity = Math.max((totalDoctors || 1) * 5, 100); // Minimum 100 for display purposes

        return {
            metrics: {
                uptime_percentage: uptimePercentage,
                satisfaction_percentage: satisfactionPercentage,
                active_sessions: activeSessions || 0,
                total_sessions_capacity: capacity,
            }
        };
    } catch (error) {
        console.error("Error fetching system overview:", error);
        return {
            metrics: {
                uptime_percentage: 99.9,
                satisfaction_percentage: 0,
                active_sessions: 0,
                total_sessions_capacity: 200,
            },
            error: "Failed to fetch system metrics"
        };
    }
}

