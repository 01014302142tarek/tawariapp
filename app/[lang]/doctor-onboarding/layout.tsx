"use client";

import { ThemeProvider, useTheme } from "./ThemeContext";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

function OnboardingLayoutContent({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300 flex items-center justify-center p-4 md:p-8",
            isDark ? "bg-slate-950" : "bg-gray-50"
        )}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="onboarding-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 20 : 10}
                    particleColor={isDark ? "20, 184, 166" : "13, 148, 136"}
                />
                {isDark && (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-2xl">
                {children}
            </div>
        </div>
    );
}

export default function DoctorOnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <OnboardingLayoutContent>{children}</OnboardingLayoutContent>
        </ThemeProvider>
    );
}
