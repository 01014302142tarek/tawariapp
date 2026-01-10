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

    let avgSessionMinutes = 0;
    if (sessionData && sessionData.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalMinutes = sessionData.reduce((sum: number, s: any) => {
            if (s.started_at && s.ended_at) {
                const start = new Date(s.started_at);
                const end = new Date(s.ended_at);
                return sum + (end.getTime() - start.getTime()) / 60000;
            }
            return sum;
        }, 0);
        avgSessionMinutes = Math.round((totalMinutes / sessionData.length) * 10) / 10;
    }

    // Get monthly appointment counts for the current year
    const currentYear = new Date().getFullYear();
    const monthlyAppointments: MonthlyData[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 12; i++) {
        const startOfMonth = new Date(currentYear, i, 1);
        const endOfMonth = new Date(currentYear, i + 1, 0, 23, 59, 59);

        const { count } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .gte("scheduled_start", startOfMonth.toISOString())
            .lte("scheduled_start", endOfMonth.toISOString());

        monthlyAppointments.push({
            month: monthNames[i],
            value: count || 0,
        });
    }

    // Get top doctors by earnings
    const { data: earningsData } = await supabase
        .from("doctor_earnings")
        .select(`
            doctor_profile_id,
            gross_amount,
            doctor_profiles!inner (
                id,
                profiles!inner (
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

    // Get patient counts for each doctor
    const doctorIds = Array.from(doctorEarningsMap.keys());
    for (const doctorId of doctorIds) {
        const { count } = await supabase
            .from("appointments")
            .select("patient_profile_id", { count: "exact", head: true })
            .eq("doctor_profile_id", doctorId)
            .in("status", ["completed", "in_progress"]);

        const entry = doctorEarningsMap.get(doctorId);
        if (entry && count) {
            entry.patients = new Set([...Array(count).keys()].map(String));
        }
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
