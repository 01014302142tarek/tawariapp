"use client";

import { useParams } from "next/navigation";
import { useI18n } from "@/app/i18n";
import { useTheme } from "../../../context/ThemeContext";
import { QueueVideoCall } from "@/components/queue-video-call";

export default function DoctorVideoCallPage() {
    const params = useParams();
    const { isRTL, language } = useI18n();
    const { theme } = useTheme();

    const queueEntryId = params.queueEntryId as string;
    const isDark = theme === "dark";

    return (
        <QueueVideoCall
            queueEntryId={queueEntryId}
            userRole="doctor"
            language={language}
            isRTL={isRTL}
            isDark={isDark}
        />
    );
}
