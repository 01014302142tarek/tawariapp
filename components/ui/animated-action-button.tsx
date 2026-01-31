"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Rotating gradient border animation
function RotatingBorder({
    duration = 3000,
    color = "teal"
}: {
    duration?: number;
    color?: "teal" | "red" | "amber"
}) {
    const gradientColors = {
        teal: "#14b8a6",
        red: "#ef4444",
        amber: "#f59e0b",
    };

    return (
        <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
                duration: duration / 1000,
                repeat: Infinity,
                ease: "linear",
            }}
            className="absolute inset-[-100%]"
            style={{
                background: `conic-gradient(from 0deg, transparent 0 320deg, ${gradientColors[color]} 360deg)`,
            }}
        />
    );
}

// Pulsing glow effect
function PulsingGlow({ color = "teal" }: { color?: "teal" | "red" | "amber" }) {
    const glowColors = {
        teal: "bg-teal-500/30",
        red: "bg-red-500/30",
        amber: "bg-amber-500/30",
    };

    return (
        <motion.div
            className={cn(
                "absolute inset-0 rounded-2xl blur-xl",
                glowColors[color]
            )}
            animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

interface AnimatedActionButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    title: string;
    description?: string;
    variant?: "primary" | "urgent";
    isDark?: boolean;
    className?: string;
    disabled?: boolean;
    isLoading?: boolean;
    loadingText?: string;
}

export function AnimatedActionButton({
    children,
    href,
    onClick,
    icon,
    title,
    description,
    variant = "primary",
    isDark = true,
    className,
    disabled = false,
    isLoading = false,
    loadingText,
}: AnimatedActionButtonProps) {
    const colors = variant === "urgent" ? "red" : "teal";

    const bgColors = {
        teal: isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950"
            : "bg-gradient-to-br from-white via-white to-teal-50",
        red: isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-900 to-red-950"
            : "bg-gradient-to-br from-white via-white to-red-50",
    };

    const iconBgColors = {
        teal: "bg-teal-500/20 text-teal-500 group-hover:bg-teal-500 group-hover:text-white",
        red: "bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white",
    };

    const borderColors = {
        teal: isDark ? "border-teal-500/30" : "border-teal-300",
        red: isDark ? "border-red-500/30" : "border-red-300",
    };

    const content = (
        <motion.div
            className={cn(
                "relative p-[2px] rounded-2xl overflow-hidden group cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
        >
            {/* Pulsing glow behind */}
            <PulsingGlow color={colors} />

            {/* Rotating border */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <RotatingBorder duration={3000} color={colors} />
            </div>

            {/* Content */}
            <div
                className={cn(
                    "relative rounded-[14px] p-4 md:p-5 border transition-all duration-300",
                    bgColors[colors],
                    borderColors[colors],
                    "group-hover:border-transparent"
                )}
            >
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    {icon && (
                        <div className={cn(
                            "w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                            iconBgColors[colors]
                        )}>
                            <span className="[&>svg]:w-6 [&>svg]:h-6 md:[&>svg]:w-7 md:[&>svg]:h-7">
                                {icon}
                            </span>
                        </div>
                    )}

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-bold text-base md:text-lg transition-colors",
                            isDark ? "text-white" : "text-slate-900",
                            variant === "urgent" ? "group-hover:text-red-500" : "group-hover:text-teal-500"
                        )}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <motion.div
                                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    {loadingText || title}
                                </span>
                            ) : (
                                title
                            )}
                        </h3>
                        {description && (
                            <p className={cn(
                                "text-sm mt-0.5",
                                isDark ? "text-gray-400" : "text-gray-600"
                            )}>
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Arrow indicator */}
                    <motion.div
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                            isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600",
                            variant === "urgent"
                                ? "group-hover:bg-red-500 group-hover:text-white"
                                : "group-hover:bg-teal-500 group-hover:text-white"
                        )}
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.div>
                </div>

                {/* Optional children for additional content */}
                {children}
            </div>
        </motion.div>
    );

    if (href && !disabled) {
        return <Link href={href}>{content}</Link>;
    }

    if (onClick && !disabled) {
        return <button onClick={onClick} disabled={disabled} className="w-full text-left">{content}</button>;
    }

    return content;
}

// Compact version for inline usage
export function AnimatedActionButtonCompact({
    href,
    onClick,
    icon,
    label,
    variant = "primary",
    className,
    disabled = false,
    isLoading = false,
}: {
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    label: string;
    variant?: "primary" | "urgent";
    className?: string;
    disabled?: boolean;
    isLoading?: boolean;
}) {
    const colors = variant === "urgent" ? "red" : "teal";

    const bgColors = {
        teal: "bg-teal-500 hover:bg-teal-600",
        red: "bg-red-500 hover:bg-red-600",
    };

    const content = (
        <motion.div
            className={cn(
                "relative p-[2px] rounded-xl overflow-hidden inline-block",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
        >
            {/* Rotating border */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
                <RotatingBorder duration={2000} color={colors} />
            </div>

            {/* Button content */}
            <div
                className={cn(
                    "relative rounded-[10px] px-4 py-2.5 flex items-center gap-2 text-white font-medium text-sm transition-colors",
                    bgColors[colors]
                )}
            >
                {isLoading ? (
                    <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                ) : icon ? (
                    <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
                ) : null}
                {label}
            </div>
        </motion.div>
    );

    if (href && !disabled) {
        return <Link href={href}>{content}</Link>;
    }

    if (onClick) {
        return <button onClick={onClick} disabled={disabled}>{content}</button>;
    }

    return content;
}
