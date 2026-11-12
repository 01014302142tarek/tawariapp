"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { useI18n } from "@/app/i18n";
import { cn } from "@/lib/utils";
import { DoctorSidebarProvider } from "./context/SidebarContext";
import DoctorOfflineTracker from "./components/DoctorOfflineTracker";
import { DoctorCallNotifier } from "@/components/doctor-call-notifier";

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isDark } = useGlobalTheme();
    const { isRTL } = useI18n();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // In-call video routes must be 100% immersive fullscreen with no headers or sidebars
    const isCallPage = pathname?.includes("/urgent-care/call/") || pathname?.includes("/call/");

    if (isCallPage) {
        return (
            <div
                className={cn(
                    "fixed inset-0 w-full h-[100dvh] bg-slate-950 overflow-hidden z-50",
                    isRTL ? "font-cairo" : ""
                )}
                dir={isRTL ? "rtl" : "ltr"}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "min-h-screen transition-colors duration-300",
                isDark ? "bg-[#031326]" : "bg-gray-50",
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

export default function Doctor2DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DoctorSidebarProvider>
            <DoctorOfflineTracker />
            <DoctorCallNotifier />
            <LayoutContent>{children}</LayoutContent>
        </DoctorSidebarProvider>
    );
}
