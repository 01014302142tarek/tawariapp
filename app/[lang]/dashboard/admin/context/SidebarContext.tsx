"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/context/AuthContext";
import { isAdminProfile } from "@/lib/types/profile";

// ============================================
// Types
// ============================================

export interface AdminSidebarData {
    pendingDoctors: number;
}

interface AdminSidebarContextType {
    data: AdminSidebarData;
    loading: boolean;
    refresh: () => void;
}

// ============================================
// Context
// ============================================

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const [data, setData] = useState<AdminSidebarData>({
        pendingDoctors: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Store admin profile ID in ref to avoid recreating fetchData
    const adminProfileIdRef = useRef<string | null>(null);

    // Get admin profile ID safely
    const adminProfileId = profile && isAdminProfile(profile) ? profile.adminProfile?.id : null;

    // Update ref when profile changes (only when ID changes, not entire profile object)
    useEffect(() => {
        if (adminProfileId) {
            adminProfileIdRef.current = adminProfileId;
        } else {
            adminProfileIdRef.current = null;
        }
    }, [adminProfileId]);

    // Fetch sidebar data with stable reference
    const fetchData = useCallback(async () => {
        if (!adminProfileIdRef.current) {
            setIsLoading(false);
            return;
        }

        const supabase = createClient();

        try {
            // Fetch pending doctor verifications
            const doctorsResult = await supabase
                .from("doctor_profiles")
                .select("id", { count: "exact", head: true })
                .eq("verification_status", "pending");

            setData({
                pendingDoctors: doctorsResult.count || 0,
            });
        } catch (error) {
            console.error("Error fetching admin sidebar data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty deps - stable reference

    // Initial fetch - only when admin profile is available
    useEffect(() => {
        if (adminProfileId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminProfileId]);

    // Set up real-time subscriptions for live updates
    useEffect(() => {
        const currentAdminId = adminProfileIdRef.current;
        if (!currentAdminId) return;

        const supabase = createClient();

        // Subscribe to doctor_profiles table changes with unique channel name
        const doctorsChannel = supabase
            .channel(`admin_doctors_sidebar_${currentAdminId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "doctor_profiles",
                },
                (payload) => {
                    // Increment count for new pending doctors
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((payload.new as any).verification_status === "pending") {
                        setData(prev => ({ ...prev, pendingDoctors: prev.pendingDoctors + 1 }));
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "doctor_profiles",
                },
                (payload) => {
                    // Update count when verification status changes
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const newStatus = (payload.new as any).verification_status;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const oldStatus = (payload.old as any).verification_status;
                    
                    if (oldStatus === "pending" && newStatus !== "pending") {
                        // Doctor was approved/rejected - decrease count
                        setData(prev => ({ ...prev, pendingDoctors: Math.max(0, prev.pendingDoctors - 1) }));
                    } else if (oldStatus !== "pending" && newStatus === "pending") {
                        // Doctor status changed back to pending - increase count
                        setData(prev => ({ ...prev, pendingDoctors: prev.pendingDoctors + 1 }));
                    }
                }
            )
            .subscribe();

        // Cleanup subscriptions on unmount
        return () => {
            supabase.removeChannel(doctorsChannel);
        };
    }, [adminProfileId]);

    return (
        <AdminSidebarContext.Provider value={{ data, loading: isLoading, refresh: fetchData }}>
            {children}
        </AdminSidebarContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useAdminSidebar() {
    const context = useContext(AdminSidebarContext);
    if (context === undefined) {
        throw new Error("useAdminSidebar must be used within an AdminSidebarProvider");
    }
    return context;
}
