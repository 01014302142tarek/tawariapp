"use client";

import { playNotificationChime } from "@/lib/audio/ringtone";

export interface BrowserNotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    requireInteraction?: boolean;
    silent?: boolean;
}

/**
 * Checks if the browser supports the Notifications API.
 */
export function isNotificationSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Returns current Notification permission: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
    if (!isNotificationSupported()) return "unsupported";
    return Notification.permission;
}

/**
 * Requests Notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!isNotificationSupported()) return false;

    try {
        if (Notification.permission === "granted") return true;

        const permission = await Notification.requestPermission();
        return permission === "granted";
    } catch (err) {
        console.warn("[WebNotifications] Error requesting permission:", err);
        return false;
    }
}

/**
 * Sends a native browser notification (Works on background tabs & lock screens)
 */
export function sendBrowserNotification(
    title: string,
    options: BrowserNotificationOptions = {}
): Notification | null {
    if (!isNotificationSupported() || Notification.permission !== "granted") {
        return null;
    }

    try {
        const notif = new Notification(title, {
            body: options.body || "",
            icon: options.icon || "/web-app-manifest-192x192.png",
            badge: options.badge || "/web-app-manifest-192x192.png",
            tag: options.tag || "tawari-alert",
            requireInteraction: options.requireInteraction ?? true,
            silent: options.silent ?? false,
        });

        // Click handler: focus window and navigate if URL provided
        notif.onclick = (event) => {
            event.preventDefault();
            window.focus();
            if (options.url && typeof window !== "undefined") {
                window.location.href = options.url;
            }
            notif.close();
        };

        // Play chime if not silent
        if (!options.silent) {
            playNotificationChime();
        }

        return notif;
    } catch (err) {
        console.warn("[WebNotifications] Error displaying notification:", err);
        return null;
    }
}

