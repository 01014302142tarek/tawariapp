"use client";

import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

function OnboardingLayoutContent({ children }: { children: React.ReactNode }) {
    const { isDark } = useGlobalTheme();

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300 flex items-center justify-center p-4 md:p-8",
            isDark ? "bg-[#031326]" : "bg-gradient-to-br from-[#FEFDFE] via-[#F4F8FC] to-[#FEFDFE]"
        )}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <SparklesCore
                    id="onboarding-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={isDark ? 20 : 15}
                    particleColor="4, 76, 135"
                />
                {isDark ? (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#044C87]/15 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FD614B]/10 rounded-full blur-3xl" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#044C87]/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FD614B]/5 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#044C87]/5 rounded-full blur-3xl" />
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
