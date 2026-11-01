"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Notification } from "@/app/actions/notifications";

interface UseRealtimeNotificationsOptions {
    enabled?: boolean;
    onNewNotification?: (notification: Notification) => void;
}

interface UseRealtimeNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
    isLoading: boolean;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    refresh: () => Promise<void>;
}

/**
 * Hook for realtime notification updates using Supabase Realtime + Smart Polling Fallback
 * Subscribes to INSERT/UPDATE events on the notifications table for the current user
 */
export function useRealtimeNotifications(
    options: UseRealtimeNotificationsOptions = {}
): UseRealtimeNotificationsReturn {
    const { enabled = true, onNewNotification } = options;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profileId, setProfileId] = useState<string | null>(null);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const supabaseRef = useRef(createClient());

    // Fetch initial notifications with robust error handling
    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const supabase = supabaseRef.current;

            // Get the current user and their profile
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", user.id)
                .single();

            const profile = profileData as { id: string } | null;
            if (!profile) return;

            setProfileId(profile.id);

            // Fetch latest notifications
            const { data: notificationsData, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("profile_id", profile.id)
                .order("created_at", { ascending: false })
                .limit(25);

            if (error) {
                console.error("Error fetching notifications:", error);
            } else if (notificationsData) {
                setNotifications(notificationsData as Notification[]);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const unread = (notificationsData as any[]).filter((n) => !n.is_read).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Unexpected error in fetchNotifications:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        if (enabled) {
            fetchNotifications();
        }
    }, [enabled, fetchNotifications]);

    // Re-fetch when user returns to the tab
    useEffect(() => {
        if (!enabled) return;
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchNotifications();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [enabled, fetchNotifications]);

    // Periodic polling fallback (every 25 seconds) to ensure notifications are never missed
    useEffect(() => {
        if (!enabled) return;
        const interval = setInterval(() => {
            fetchNotifications();
        }, 25000);
        return () => clearInterval(interval);
    }, [enabled, fetchNotifications]);

    // Realtime subscription for live notifications
    useEffect(() => {
        if (!enabled || !profileId) return;

        const supabase = supabaseRef.current;
        const channel = supabase
            .channel(`notifications:${profileId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `profile_id=eq.${profileId}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications((prev) => {
                        const exists = prev.some((n) => n.id === newNotification.id);
                        return exists ? prev : [newNotification, ...prev];
                    });
                    if (!newNotification.is_read) {
                        setUnreadCount((prev) => prev + 1);
                    }
                    onNewNotification?.(newNotification);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                    filter: `profile_id=eq.${profileId}`,
                },
                (payload) => {
                    const updated = payload.new as Notification;
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === updated.id ? updated : n))
                    );
                    // Recalculate unread count
                    setNotifications((current) => {
                        const unread = current.filter((n) => !n.is_read).length;
                        setUnreadCount(unread);
                        return current;
                    });
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setIsConnected(true);
                } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
                    setIsConnected(false);
                }
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
            setIsConnected(false);
        };
    }, [enabled, profileId, onNewNotification]);

    // Mark a single notification as read
    const markAsRead = useCallback(
        async (notificationId: string) => {
            const supabase = supabaseRef.current;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from("notifications")
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq("id", notificationId);

            if (!error) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        },
        []
    );

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!profileId) return;

        const supabase = supabaseRef.current;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("notifications")
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq("profile_id", profileId)
            .eq("is_read", false);

        if (!error) {
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        }
    }, [profileId]);

    return {
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
    };
}
