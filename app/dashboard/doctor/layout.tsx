"use client";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { cn } from "@/lib/utils";

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300",
            isDark ? "bg-slate-950" : "bg-gray-50"
        )}>
            <Sidebar />
            {/* ml-[72px] matches the collapsed sidebar width */}
            <div className="ml-[72px] flex flex-col min-h-screen transition-all duration-300">
                <Header />
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
        <ThemeProvider>
            <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
    );
}
