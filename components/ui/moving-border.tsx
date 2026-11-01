"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorder({
    children,
    duration = 2000,
    className,
    containerClassName,
    bgClassName,
    borderRadius = "1.75rem",
    as: Component = "div",
    ...otherProps
}: {
    children: React.ReactNode;
    duration?: number;
    className?: string;
    containerClassName?: string;
    bgClassName?: string;
    borderRadius?: string;
    as?: React.ElementType;
    [key: string]: unknown;
}) {
    return (
        <Component
            className={cn(
                "bg-transparent relative text-xl p-[1px] overflow-hidden",
                containerClassName
            )}
            style={{
                borderRadius: borderRadius,
            }}
            {...otherProps}
        >
            <div
                className="absolute inset-0"
                style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
            >
                <MovingBorderGradient duration={duration} />
            </div>
            <div
                className={cn(
                    "relative border border-slate-800 backdrop-blur-xl text-white flex items-center justify-center w-full h-full text-sm antialiased",
                    bgClassName || "bg-slate-900/[0.8]",
                    className
                )}
                style={{
                    borderRadius: `calc(${borderRadius} * 0.96)`,
                }}
            >
                {children}
            </div>
        </Component>
    );
}

function MovingBorderGradient({ duration = 2000 }: { duration?: number }) {
    return (
        <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
                duration: duration / 1000,
                repeat: Infinity,
                ease: "linear",
            }}
            style={{
                position: "absolute",
                inset: "-100%",
                background:
                    "conic-gradient(from 0deg, transparent 0 340deg, #f59e0b 360deg)",
            }}
        />
    );
}
