"use client";

import { useParams } from "next/navigation";
import { useI18n } from "@/app/i18n";
import { QueueVideoCall } from "@/components/queue-video-call";

export default function PatientVideoCallPage() {
    const params = useParams();
    const { isRTL, language } = useI18n();

    const queueEntryId = params.queueEntryId as string;

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
