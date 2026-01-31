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
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    refresh: () => Promise<void>;
}

/**
 * Hook for realtime notification updates using Supabase Realtime
 * Subscribes to INSERT events on the notifications table for the current user
 */
export function useRealtimeNotifications(
    options: UseRealtimeNotificationsOptions = {}
): UseRealtimeNotificationsReturn {
    const { enabled = true, onNewNotification } = options;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [profileId, setProfileId] = useState<string | null>(null);

    const channelRef = useRef<RealtimeChannel | null>(null);
    const supabaseRef = useRef(createClient());

    // Fetch initial notifications
    const fetchNotifications = useCallback(async () => {
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

        // Fetch notifications
        const { data: notificationsData } = await supabase
            .from("notifications")
            .select("*")
            .eq("profile_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(20);

        if (notificationsData) {
            setNotifications(notificationsData as Notification[]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const unread = (notificationsData as any[]).filter((n) => !n.is_read).length;
            setUnreadCount(unread);
            setIsConnected(true); // Set connected after initial fetch
        }
    }, []); // Keep empty dependency array

    // Initial fetch on mount - only run once
    useEffect(() => {
        if (enabled) {
            fetchNotifications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]); // Only depend on enabled, not fetchNotifications

    // Realtime subscription for new notifications
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
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setIsConnected(true);
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
                .update({ is_read: true })
                .eq("id", notificationId);

            if (!error) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notificationId ? { ...n, is_read: true } : n
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
            .update({ is_read: true })
            .eq("profile_id", profileId)
            .eq("is_read", false);

        if (!error) {
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        }
    }, [profileId]);

    return {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
    };
}
