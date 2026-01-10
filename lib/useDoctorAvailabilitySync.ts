"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { syncDoctorAvailabilityStatus, getDoctorOnlineStatus } from "@/app/actions/availability";

interface UseDoctorAvailabilitySyncOptions {
    enabled?: boolean;
    syncIntervalMs?: number; // How often to sync (default: 1 minute)
    onStatusChange?: (isOnline: boolean) => void;
}

interface UseDoctorAvailabilitySyncReturn {
    isOnline: boolean;
    nextAvailableSlot?: { start: string; end: string };
    isSyncing: boolean;
    lastSyncTime: Date | null;
    sync: () => Promise<void>;
}

/**
 * Hook to automatically sync doctor's online availability status based on their schedule
 * Runs on mount and at regular intervals
 */
export function useDoctorAvailabilitySync(
    options: UseDoctorAvailabilitySyncOptions = {}
): UseDoctorAvailabilitySyncReturn {
    const {
        enabled = true,
        syncIntervalMs = 60000, // Default: 1 minute
        onStatusChange,
    } = options;

    const [isOnline, setIsOnline] = useState(false);
    const [nextAvailableSlot, setNextAvailableSlot] = useState<{ start: string; end: string }>();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    const previousOnlineRef = useRef<boolean | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const sync = useCallback(async () => {
        if (isSyncing) return;

        setIsSyncing(true);
        try {
            // Sync the availability based on schedule
            const syncResult = await syncDoctorAvailabilityStatus();

            if (!syncResult.error) {
                const newIsOnline = syncResult.isAvailable;

                // Check if status changed
                if (previousOnlineRef.current !== null && previousOnlineRef.current !== newIsOnline) {
                    onStatusChange?.(newIsOnline);
                }

                previousOnlineRef.current = newIsOnline;
                setIsOnline(newIsOnline);

                // Get additional info like next available slot
                const statusResult = await getDoctorOnlineStatus();
                if (!statusResult.error) {
                    setNextAvailableSlot(statusResult.nextAvailableSlot);
                }
            }

            setLastSyncTime(new Date());
        } catch (error) {
            console.error("Error syncing availability:", error);
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, onStatusChange]);

    // Initial sync and setup interval
    useEffect(() => {
        if (!enabled) return;

        // Run initial sync
        sync();

        // Set up interval for periodic sync
        intervalRef.current = setInterval(() => {
            sync();
        }, syncIntervalMs);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [enabled, syncIntervalMs, sync]);

    // Also sync when the tab becomes visible (user returns to the page)
    useEffect(() => {
        if (!enabled) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                sync();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enabled, sync]);

    return {
        isOnline,
        nextAvailableSlot,
        isSyncing,
        lastSyncTime,
        sync,
    };
}
