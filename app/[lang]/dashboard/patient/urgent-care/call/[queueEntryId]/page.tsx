"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/app/i18n";
import { QueueVideoCall } from "@/components/queue-video-call";

export default function PatientVideoCallPage() {
    const params = useParams();
    const { isRTL, language } = useI18n();

    const queueEntryId = params.queueEntryId as string;

    // Debug: Log when call page mounts
    useEffect(() => {
        console.log("[Call Page] Mounted with queueEntryId:", queueEntryId);
        return () => {
            console.log("[Call Page] Unmounting");
        };
    }, [queueEntryId]);

    return (
        <QueueVideoCall
            queueEntryId={queueEntryId}
            userRole="patient"
            language={language}
            isRTL={isRTL}
            isDark={true}
        />
    );
}
