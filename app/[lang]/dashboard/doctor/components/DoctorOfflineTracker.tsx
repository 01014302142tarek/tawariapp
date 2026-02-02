"use client";

import { useEffect } from "react";
import { useAuth, isDoctorProfile } from "@/app/context/AuthContext";

/**
 * Component that tracks doctor online status and sets them offline
 * when the browser/tab is closed or when they navigate away.
 * Uses the Beacon API for reliable delivery even during page unload.
 */
export default function DoctorOfflineTracker() {
    const { profile } = useAuth();

    useEffect(() => {
        // Only track for doctors with a profile
        if (!profile || !isDoctorProfile(profile)) {
            return;
        }

        const doctorProfileId = profile.doctorProfile?.id;
        if (!doctorProfileId) {
            return;
        }

        // Function to send offline status via Beacon API
        const sendOfflineBeacon = () => {
            const data = JSON.stringify({ doctorProfileId });
            navigator.sendBeacon("/api/doctor/go-offline", data);
        };

        // Handle page unload (browser close, tab close, navigation away)
        const handleBeforeUnload = () => {
            sendOfflineBeacon();
        };

        // Handle visibility change (tab hidden, browser minimized)
        // Note: We don't set offline on visibility change, only on actual unload
        // This prevents setting offline when user just switches tabs

        // Handle page hide (more reliable than beforeunload on mobile)
        const handlePageHide = (event: PageTransitionEvent) => {
            // Only send beacon if page is being discarded (not cached)
            if (event.persisted === false) {
                sendOfflineBeacon();
            }
        };

        // Add event listeners
        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("pagehide", handlePageHide);

        // Cleanup on unmount
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, [profile]);

    // This component doesn't render anything
    return null;
}
