"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";
import { NotificationsPage } from "@/components/notifications";

export default function PatientNotificationsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={cn(
            "min-h-screen p-4 md:p-8 transition-colors duration-300",
            isDark
                ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
                : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        )}>
            <NotificationsPage isDark={isDark} dashboardType="patient" />
        </div>
    );
}
