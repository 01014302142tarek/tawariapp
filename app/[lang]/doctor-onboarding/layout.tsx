"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

function OnboardingLayoutContent({ children }: { children: React.ReactNode }) {
    const { isDark } = useGlobalTheme();

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300 flex items-center justify-center p-4 md:p-8",
            isDark ? "bg-[#060B18]" : "bg-gradient-to-br from-white via-blue-50/30 to-white"
        )}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="onboarding-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 20 : 15}
                    particleColor={isDark ? "59, 130, 246" : "37, 99, 235"}
                />
                {isDark ? (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-50/30 rounded-full blur-3xl" />
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
    return <OnboardingLayoutContent>{children}</OnboardingLayoutContent>;
}
