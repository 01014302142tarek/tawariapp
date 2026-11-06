"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate, useReducedMotion, useInView } from "framer-motion";
import React, { useEffect, useRef } from "react";

export function AnimatedNumber({
    value,
    className,
    duration = 1.2,
    format,
    decimals = 0,
    delay = 0,
}: {
    value: number;
    className?: string;
    duration?: number;
    format?: (value: number) => string;
    decimals?: number;
    delay?: number;
}) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) =>
        decimals > 0 ? Number(latest.toFixed(decimals)) : Math.round(latest)
    );
    const displayValue = useTransform(rounded, (latest) => {
        if (format) return format(latest);
        if (decimals > 0) return latest.toFixed(decimals);
        return latest >= 1000 ? `${(latest / 1000).toFixed(1)}k` : latest.toString();
    });
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "0px" });
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (reduceMotion) {
            count.set(value);
            return;
        }

        if (!isInView) return;

        const timeoutId = setTimeout(() => {
            animate(count, value, {
                duration,
                ease: [0.16, 1, 0.3, 1], // easeOutExpo: snappy start, smooth landing
            });
        }, delay * 1000);

        return () => clearTimeout(timeoutId);
    }, [count, value, duration, delay, reduceMotion, isInView]);

    return (
        <motion.span ref={ref} className={cn("tabular-nums inline-block", className)}>
            {displayValue}
        </motion.span>
    );
}
