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
        }
    }, []);

    // Subscribe to realtime updates
    useEffect(() => {
        if (!enabled || !profileId) return;

        const supabase = supabaseRef.current;

        // Create a unique channel name based on profile ID
        const channelName = `notifications:${profileId}`;

        // Subscribe to INSERT events on the notifications table
        const channel = supabase
            .channel(channelName)
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

                    // Add to the beginning of the list
                    setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]);

                    // Increment unread count if not read
                    if (!newNotification.is_read) {
                        setUnreadCount((prev) => prev + 1);
                    }

                    // Call the callback if provided
                    if (onNewNotification) {
                        onNewNotification(newNotification);
                    }
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
                    const updatedNotification = payload.new as Notification;

                    // Update the notification in the list
                    setNotifications((prev) =>
                        prev.map((n) =>
                            n.id === updatedNotification.id ? updatedNotification : n
                        )
                    );

                    // Recalculate unread count
                    setNotifications((prev) => {
                        const unread = prev.filter((n) => !n.is_read).length;
                        setUnreadCount(unread);
                        return prev;
                    });
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
            });

        channelRef.current = channel;

        // Cleanup on unmount or when dependencies change
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [enabled, profileId, onNewNotification]);

    // Initial fetch on mount
    useEffect(() => {
        if (enabled) {
            fetchNotifications();
        }
    }, [enabled, fetchNotifications]);

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
