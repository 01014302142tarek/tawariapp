"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LogoProps {
    className?: string;
    isDark?: boolean;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    href?: string;
    priority?: boolean;
}

/**
 * Isolated Tabibi Icon Mark (Circular 't' + ECG Pulse)
 * Perfect for collapsed sidebars, mobile headers, and compact widgets
 */
export function LogoIcon({
    className = "",
    size = "md",
    isDark = true,
}: {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    isDark?: boolean;
}) {
    const sizeClasses = {
        sm: "h-7 w-auto",
        md: "h-9 w-auto",
        lg: "h-11 w-auto",
        xl: "h-14 w-auto",
    };

    const iconSrc = isDark
        ? "/images/logo/tabibi_icon_dark.png"
        : "/images/logo/tabibi_icon_light.png";

    return (
        <div className={cn("relative inline-flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105", className)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={iconSrc}
                alt="Tabibi Icon"
                className={cn("object-contain select-none", sizeClasses[size])}
                loading="eager"
            />
        </div>
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
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={logoSrc}
                    alt="Tabibi | طبيبي"
                    className={cn(
                        "object-contain transition-transform duration-200 group-hover:scale-[1.02]",
                        sizeClasses[size]
                    )}
                    loading="eager"
                />
            ) : (
                <LogoIcon size={size} isDark={isDark} />
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="inline-block hover:opacity-95 transition-opacity">
                {content}
            </Link>
        );
    }

    return content;
}

export default Logo;
