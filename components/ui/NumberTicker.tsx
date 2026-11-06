"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
    value: number;
    direction?: "up" | "down";
    delay?: number; // in seconds
    duration?: number;
    className?: string;
    decimalPlaces?: number;
    prefix?: string;
    suffix?: string;
    formatLocale?: string;
}

export function NumberTicker({
    value,
    direction = "up",
    delay = 0,
    className,
    decimalPlaces = 0,
    prefix = "",
    suffix = "",
    formatLocale,
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "0px" });

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => {
                motionValue.set(direction === "down" ? 0 : value);
            }, delay * 1000);
            return () => clearTimeout(timer);
        }
    }, [motionValue, isInView, delay, value, direction]);

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                const num = Number(latest.toFixed(decimalPlaces));
                let formatted = decimalPlaces > 0
                    ? num.toFixed(decimalPlaces)
                    : Math.round(num).toString();

                if (formatLocale) {
                    try {
                        formatted = num.toLocaleString(formatLocale, {
                            minimumFractionDigits: decimalPlaces,
                            maximumFractionDigits: decimalPlaces,
                        });
                    } catch {
                        // Fallback to standard
                    }
                }

                ref.current.textContent = `${prefix}${formatted}${suffix}`;
            }
        });

        return () => unsubscribe();
    }, [springValue, decimalPlaces, prefix, suffix, formatLocale]);

    return (
        <span
            ref={ref}
            className={cn("inline-block tabular-nums tracking-normal", className)}
        >
            {prefix}{direction === "down" ? value : 0}{suffix}
        </span>
    );
}

