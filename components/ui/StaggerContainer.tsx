"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    staggerDelay?: number;
    delayChildren?: number;
    className?: string;
}

export function StaggerContainer({
    children,
    staggerDelay = 0.08,
    delayChildren = 0.05,
    className,
    ...props
}: StaggerContainerProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: delayChildren,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
    yOffset = 16,
    scaleOffset = 0.98,
    ...props
}: HTMLMotionProps<"div"> & { yOffset?: number; scaleOffset?: number }) {
    const itemVariants = {
        hidden: {
            opacity: 0,
            y: yOffset,
            scale: scaleOffset,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 320,
                damping: 24,
                mass: 0.8,
            },
        },
    };

    return (
        <motion.div
            variants={itemVariants}
            className={cn("w-full", className)}
            {...props}
        >
            {children}
        </motion.div>
    );
}

