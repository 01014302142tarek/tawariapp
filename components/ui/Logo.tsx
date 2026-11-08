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

const sizeClasses = {
    sm: "h-7 w-auto",
    md: "h-9 w-auto",
    lg: "h-11 w-auto",
    xl: "h-14 w-auto",
};

const iconSizeClasses = {
    sm: "h-full w-full",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
};

function MovingBorderFrame({
    children,
    isDark,
    size = "md",
    className,
}: {
    children: React.ReactNode;
    isDark: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}) {
    const compact = size === "sm";

    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center group select-none",
                compact ? "h-12 w-12 shrink-0 p-[1.5px]" : "p-[1.5px]",
                className
            )}
        >
            <div
                className={cn(
                    "absolute inset-0 overflow-hidden pointer-events-none",
                    compact ? "rounded-[14px]" : "rounded-2xl"
                )}
            >
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className={cn(
                        "absolute blur-[6px] opacity-70",
                        compact ? "inset-[-80%]" : "inset-[-150%]"
                    )}
                    style={{
                        background:
                            "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(253,97,75,0.4) 310deg, #FD614B 345deg, #FFA799 355deg, #FD614B 360deg)",
                    }}
                />
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className={cn(
                        "absolute",
                        compact ? "inset-[-80%]" : "inset-[-150%]"
                    )}
                    style={{
                        background:
                            "conic-gradient(from 0deg, transparent 0deg, transparent 280deg, rgba(253,97,75,0.6) 320deg, #FD614B 350deg, #FFB5A8 358deg, #FD614B 360deg)",
                    }}
                />
            </div>
            <div
                className={cn(
                    "relative z-10 flex items-center justify-center backdrop-blur-xl transition-colors duration-300 w-full h-full min-w-0",
                    compact ? "rounded-[12px] p-[3px]" : "px-3.5 py-1.5 rounded-[14px]",
                    isDark
                        ? "bg-[#031326]/90 border border-white/10 group-hover:bg-[#061D38]"
                        : "bg-white/95 border border-slate-200/80 shadow-sm group-hover:bg-white"
                )}
            >
                {children}
            </div>
        </div>
    );
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
    withMovingBorder = true,
}: {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    isDark?: boolean;
    animated?: boolean;
    withMovingBorder?: boolean;
}) {
    const iconSrc = isDark
        ? "/images/logo/tabibi_icon_dark.png"
        : "/images/logo/tabibi_icon_light.png";

    const compact = size === "sm";
    const mark = (
        <motion.div
            className={cn(
                "relative inline-flex items-center justify-center flex-shrink-0 select-none",
                compact && "h-full w-full",
                className
            )}
            animate={
                animated && !compact
                    ? {
                          scale: [1, 1, 1.045, 0.985, 1.055, 1, 1],
                      }
                    : undefined
            }
            transition={
                animated && !compact
                    ? {
                          duration: 3.4,
                          repeat: Infinity,
                          repeatDelay: 1.2,
                          ease: "easeInOut",
                          times: [0, 0.55, 0.62, 0.68, 0.76, 0.85, 1],
                      }
                    : undefined
            }
            whileHover={compact ? undefined : { scale: 1.08 }}
        >
            {animated && !compact && (
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
                className={cn(
                    "object-contain select-none relative z-10",
                    compact ? "h-full w-full p-[1px]" : iconSizeClasses[size]
                )}
                loading="eager"
            />
        </motion.div>
    );

    if (!withMovingBorder) {
        return mark;
    }

    return (
        <MovingBorderFrame isDark={isDark} size={size}>
            {mark}
        </MovingBorderFrame>
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
    withMovingBorder = true,
}: LogoProps) {
    const logoSrc = isDark
        ? "/images/logo/tabibi_logo_dark.png"
        : "/images/logo/tabibi_logo_light.png";

    const mark = showText ? (
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
        <LogoIcon size={size} isDark={isDark} animated={animated} withMovingBorder={false} />
    );

    const framed = withMovingBorder ? (
        <MovingBorderFrame isDark={isDark} size={size} className={className}>
            {mark}
        </MovingBorderFrame>
    ) : (
        <div className={cn("inline-flex items-center select-none group", className)}>{mark}</div>
    );

    if (href) {
        return (
            <Link href={href} className="inline-block hover:opacity-95 transition-opacity">
                {framed}
            </Link>
        );
    }

    return framed;
}

/**
 * Convenience wrapper: Logo with rotating coral light beam border
 */
export function LogoWithMovingBorder(props: LogoProps) {
    return <Logo {...props} withMovingBorder={true} />;
}

export default Logo;
