"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { useI18n } from "@/app/i18n";
import { cn } from "@/lib/utils";

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isDark } = useGlobalTheme();
    const { isRTL } = useI18n();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div
            className={cn(
                "min-h-screen transition-colors duration-300",
                isDark ? "bg-slate-950" : "bg-gray-50",
                isRTL ? "font-cairo" : ""
            )}
            dir={isRTL ? "rtl" : "ltr"}
        >
            <Sidebar
                isMobileOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            {/* Responsive margin: 0 on mobile, 72px on md+ */}
            <div className={cn(
                "flex flex-col min-h-screen transition-all duration-300",
                isRTL ? "mr-0 md:mr-[72px] ml-0" : "ml-0 md:ml-[72px] mr-0"
            )}>
                <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function PatientDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <LayoutContent>{children}</LayoutContent>;
}
