"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============================================
// Types
// ============================================

export interface QueueEntry {
    id: string;
    doctor_profile_id: string;
    patient_profile_id: string;
    status: "waiting" | "called" | "in_consultation" | "completed" | "cancelled" | "expired";
    position: number;
    chief_complaint?: string;
    joined_at: string;
    called_at?: string;
    consultation_started_at?: string;
    daily_room_url?: string;
    payment_status: "pending" | "completed_mock" | "completed" | "refunded" | "failed";
    payment_amount: number;
}

export interface OnlineDoctor {
    id: string;
    is_online: boolean;
    current_queue_entry_id?: string;
}

// ============================================
// Hook: useOnlineDoctors
// Subscribes to doctor online status changes
// ============================================

export function useOnlineDoctors(initialDoctors: OnlineDoctor[] = []) {
    const [doctors, setDoctors] = useState<OnlineDoctor[]>(initialDoctors);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        const channel: RealtimeChannel = supabase
            .channel("online-doctors")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "doctor_profiles",
                    filter: "verification_status=eq.verified",
                },
                (payload) => {
                    const updated = payload.new as OnlineDoctor;
                    setDoctors((prev) => {
                        const existing = prev.find((d) => d.id === updated.id);
                        if (existing) {
                            return prev.map((d) =>
                                d.id === updated.id ? { ...d, ...updated } : d
                            );
                        } else if (updated.is_online) {
                            return [...prev, updated];
                        }
                        return prev;
                    });
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { doctors, isConnected, setDoctors };
}

// ============================================
// Hook: useDoctorQueue
// Subscribes to a specific doctor's queue changes
// ============================================

export function useDoctorQueue(doctorProfileId: string | null) {
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const refreshQueue = useCallback(async () => {
        if (!doctorProfileId) return;

        const supabase = createClient();
        const { data } = await supabase
            .from("consultation_queue")
            .select("*")
            .eq("doctor_profile_id", doctorProfileId)
            .eq("status", "waiting")
            .order("position", { ascending: true });

        if (data) {
            setQueue(data as QueueEntry[]);
        }
    }, [doctorProfileId]);

    useEffect(() => {
        if (!doctorProfileId) return;

        const supabase = createClient();

        // Initial fetch
        refreshQueue();

        // Subscribe to changes
        const channel = supabase
            .channel(`queue-${doctorProfileId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "consultation_queue",
                    filter: `doctor_profile_id=eq.${doctorProfileId}`,
                },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const newEntry = payload.new as QueueEntry;
                        if (newEntry.status === "waiting") {
                            setQueue((prev) => [...prev, newEntry].sort((a, b) => a.position - b.position));
                        }
                    } else if (payload.eventType === "UPDATE") {
                        const updated = payload.new as QueueEntry;
                        if (updated.status === "waiting") {
                            setQueue((prev) =>
                                prev.map((e) => (e.id === updated.id ? updated : e))
                                    .sort((a, b) => a.position - b.position)
                            );
                        } else {
                            // Remove from queue if status changed
                            setQueue((prev) => prev.filter((e) => e.id !== updated.id));
                        }
                    } else if (payload.eventType === "DELETE") {
                        const deleted = payload.old as { id: string };
                        setQueue((prev) => prev.filter((e) => e.id !== deleted.id));
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
            });

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [doctorProfileId, refreshQueue]);

    return { queue, isConnected, refreshQueue };
}

// ============================================
// Hook: useMyQueuePosition
// Subscribes to patient's own queue entry changes
// ============================================

export function useMyQueuePosition(queueEntryId: string | null) {
    const [entry, setEntry] = useState<QueueEntry | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!queueEntryId) return;

        const supabase = createClient();

        // Initial fetch
        const fetchEntry = async () => {
            const { data } = await supabase
                .from("consultation_queue")
                .select("*")
                .eq("id", queueEntryId)
                .single();

            if (data) {
                setEntry(data as QueueEntry);
            }
        };

        fetchEntry();

        // Subscribe to changes
        const channel = supabase
            .channel(`my-queue-${queueEntryId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "consultation_queue",
                    filter: `id=eq.${queueEntryId}`,
                },
                (payload) => {
                    setEntry(payload.new as QueueEntry);
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
            });

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [queueEntryId]);

    return { entry, isConnected };
}

// ============================================
// Hook: useDoctorOnlineStatus
// Subscribes to doctor's own online status
// ============================================

export function useDoctorOnlineStatus(doctorProfileId: string | null) {
    const [isOnline, setIsOnline] = useState(false);
    const [currentQueueEntryId, setCurrentQueueEntryId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!doctorProfileId) return;

        const supabase = createClient();

        // Initial fetch
        const fetchStatus = async () => {
            const { data } = await supabase
                .from("doctor_profiles")
                .select("is_online, current_queue_entry_id")
                .eq("id", doctorProfileId)
                .single();

            if (data) {
                setIsOnline((data as { is_online: boolean }).is_online);
                setCurrentQueueEntryId((data as { current_queue_entry_id: string | null }).current_queue_entry_id);
            }
        };

        fetchStatus();

        // Subscribe to changes
        const channel = supabase
            .channel(`doctor-status-${doctorProfileId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "doctor_profiles",
                    filter: `id=eq.${doctorProfileId}`,
                },
                (payload) => {
                    const updated = payload.new as { is_online: boolean; current_queue_entry_id: string | null };
                    setIsOnline(updated.is_online);
                    setCurrentQueueEntryId(updated.current_queue_entry_id);
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
            });

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [doctorProfileId]);

    return { isOnline, currentQueueEntryId, isConnected };
}
