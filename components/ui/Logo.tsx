"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LogoProps {
    className?: string;
    isDark?: boolean;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    href?: string;
    priority?: boolean;
    animated?: boolean;
    withMovingBorder?: boolean;
}

/**
 * Isolated Tabibi Icon Mark (Circular 't' + ECG Pulse)
 * With subtle medical ECG cardiac heartbeat animation
 */
export function LogoIcon({
    className = "",
    size = "md",
    isDark = true,
    animated = true,
}: {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    isDark?: boolean;
    animated?: boolean;
}) {
    const sizeClasses = {
        sm: "h-7 w-7",
        md: "h-9 w-9",
        lg: "h-11 w-11",
        xl: "h-14 w-14",
    };

    const iconSrc = isDark
        ? "/images/logo/tabibi_icon_dark.png"
        : "/images/logo/tabibi_icon_light.png";

    return (
        <motion.div
            className={cn("relative inline-flex items-center justify-center flex-shrink-0 select-none", className)}
            animate={
                animated
                    ? {
                          scale: [1, 1, 1.045, 0.985, 1.055, 1, 1],
                      }
                    : undefined
            }
            transition={
                animated
                    ? {
                          duration: 3.4,
                          repeat: Infinity,
                          repeatDelay: 1.2,
                          ease: "easeInOut",
                          times: [0, 0.55, 0.62, 0.68, 0.76, 0.85, 1],
                      }
                    : undefined
            }
            whileHover={{ scale: 1.08 }}
        >
            {/* Subtle cardiac glow ring */}
            {animated && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-[#0C67B3]/25 blur-md pointer-events-none"
                    animate={{
                        scale: [1, 1, 1.25, 1.05, 1.3, 1, 1],
                        opacity: [0, 0, 0.45, 0.15, 0.5, 0, 0],
                    }}
                    transition={{
                        duration: 3.4,
                        repeat: Infinity,
                        repeatDelay: 1.2,
                        ease: "easeOut",
                        times: [0, 0.55, 0.62, 0.68, 0.76, 0.85, 1],
                    }}
                />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={iconSrc}
                alt="Tabibi Icon"
                className={cn("object-contain select-none relative z-10", sizeClasses[size])}
                loading="eager"
            />
        </motion.div>
    );
}

/**
 * Full Tabibi Logo (Icon + 'tabibi' + 'طبيبي')
 * Automatically adjusts for Light/Dark themes with zero background
 */
export function Logo({
    className = "",
    isDark = true,
    showText = true,
    size = "md",
    href,
    priority = true,
    animated = true,
    withMovingBorder = false,
}: LogoProps) {
    const sizeClasses = {
        sm: "h-7 w-auto",
        md: "h-9 w-auto",
        lg: "h-11 w-auto",
        xl: "h-14 w-auto",
    };

    const logoSrc = isDark
        ? "/images/logo/tabibi_logo_dark.png"
        : "/images/logo/tabibi_logo_light.png";

    const content = (
        <div className={cn("inline-flex items-center select-none group", className)}>
            {showText ? (
                <motion.div
                    className="relative inline-flex items-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={logoSrc}
                        alt="Tabibi | طبيبي"
                        className={cn("object-contain select-none", sizeClasses[size])}
                        loading="eager"
                    />
                </motion.div>
            ) : (
                <LogoIcon size={size} isDark={isDark} animated={animated} />
            )}
        </div>
    );

    let finalContent = content;

    if (withMovingBorder) {
        finalContent = (
            <div className="relative inline-flex items-center justify-center p-[1.5px] rounded-2xl overflow-hidden group select-none">
                {/* Ambient Coral Glow Behind */}
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute inset-[-150%] pointer-events-none blur-[6px] opacity-70"
                    style={{
                        background:
                            "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(253,97,75,0.4) 310deg, #FD614B 345deg, #FFA799 355deg, #FD614B 360deg)",
                    }}
                />

                {/* Sharp Rotating Coral Rope / Light Beam */}
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute inset-[-150%] pointer-events-none"
                    style={{
                        background:
                            "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(253,97,75,0.6) 320deg, #FD614B 350deg, #FFB5A8 358deg, #FD614B 360deg)",
                    }}
                />

                {/* Inner Content Capsule */}
                <div
                    className={cn(
                        "relative px-3.5 py-1.5 rounded-[14px] flex items-center justify-center backdrop-blur-xl transition-colors duration-300",
                        isDark
                            ? "bg-[#031326]/90 border border-white/10 group-hover:bg-[#061D38]"
                            : "bg-white/95 border border-slate-200/80 shadow-sm group-hover:bg-white"
                    )}
                >
                    {content}
                </div>
            </div>
        );
    }

    if (href) {
        return (
            <Link href={href} className="inline-block hover:opacity-95 transition-opacity">
                {finalContent}
            </Link>
        );
    }

    return finalContent;
}

/**
 * Convenience wrapper: Logo with rotating coral light beam border
 */
export function LogoWithMovingBorder(props: LogoProps) {
    return <Logo {...props} withMovingBorder={true} />;
}

export default Logo;
