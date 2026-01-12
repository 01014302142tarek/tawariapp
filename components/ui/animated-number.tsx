"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import React, { useEffect, useRef } from "react";

export function AnimatedNumber({
    value,
    className,
    duration = 2,
    format,
    decimals = 0,
}: {
    value: number;
    className?: string;
    duration?: number;
    format?: (value: number) => string;
    decimals?: number;
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

    useEffect(() => {
        const controls = animate(count, value, { duration });
        return controls.stop;
    }, [count, value, duration]);

    return (
        <motion.span ref={ref} className={cn("tabular-nums", className)}>
            {displayValue}
        </motion.span>
    );
}
