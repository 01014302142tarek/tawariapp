"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/context/AuthContext";
import { isDoctorProfile } from "@/lib/types/profile";

// ============================================
// Types
// ============================================

export interface DoctorSidebarData {
    unreadMessages: number;
}

interface DoctorSidebarContextType {
    data: DoctorSidebarData;
    loading: boolean;
    refresh: () => void;
}

// ============================================
// Context
// ============================================

const DoctorSidebarContext = createContext<DoctorSidebarContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

export function DoctorSidebarProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const [data, setData] = useState<DoctorSidebarData>({
        unreadMessages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Store profile ID in ref to avoid recreating fetchData
    const profileIdRef = useRef<string | null>(null);
    const doctorProfileIdRef = useRef<string | null>(null);

    // Update refs when profile changes (only when IDs change, not entire profile object)
    useEffect(() => {
        if (profile?.profile.id) {
            profileIdRef.current = profile.profile.id;
        }
        if (profile && isDoctorProfile(profile) && profile.doctorProfile?.id) {
            doctorProfileIdRef.current = profile.doctorProfile.id;
        }
    }, [profile?.profile.id, profile?.doctorProfile?.id]);

    // Fetch sidebar data with stable reference
    const fetchData = useCallback(async () => {
        if (!profileIdRef.current || !doctorProfileIdRef.current) {
            setIsLoading(false);
            return;
        }

        const supabase = createClient();

        try {
            // Fetch only unread messages
            const messagesResult = await supabase
                .from("messages")
                .select("id", { count: "exact", head: true })
                .eq("recipient_profile_id", profileIdRef.current)
                .eq("read", false);

            setData({
                unreadMessages: messagesResult.count || 0,
            });
        } catch (error) {
            console.error("Error fetching doctor sidebar data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty deps - stable reference

    // Initial fetch - only when profile ID changes
    useEffect(() => {
        if (profile?.profile.id && isDoctorProfile(profile)) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.profile.id]);

    // Set up real-time subscriptions for live updates
    useEffect(() => {
        if (!profile?.profile.id) return;

        const supabase = createClient();

        // Subscribe to messages table changes with unique channel name
        const messagesChannel = supabase
            .channel(`doctor_messages_sidebar_${profile.profile.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `recipient_profile_id=eq.${profile.profile.id}`,
                },
                (payload) => {
                    // Directly update count for new unread messages
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (!(payload.new as any).read) {
                        setData(prev => ({ ...prev, unreadMessages: prev.unreadMessages + 1 }));
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                    filter: `recipient_profile_id=eq.${profile.profile.id}`,
                },
                (payload) => {
                    // Decrease count when message is marked as read
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const newMsg = payload.new as any;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const oldMsg = payload.old as any;
                    if (newMsg.read && !oldMsg.read) {
                        setData(prev => ({ ...prev, unreadMessages: Math.max(0, prev.unreadMessages - 1) }));
                    }
                }
            )
            .subscribe();

        // Cleanup subscriptions on unmount
        return () => {
            supabase.removeChannel(messagesChannel);
        };
    }, [profile?.profile.id]);

    return (
        <DoctorSidebarContext.Provider value={{ data, loading: isLoading, refresh: fetchData }}>
            {children}
        </DoctorSidebarContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useDoctorSidebar() {
    const context = useContext(DoctorSidebarContext);
    if (context === undefined) {
        throw new Error("useDoctorSidebar must be used within a DoctorSidebarProvider");
    }
    return context;
}
