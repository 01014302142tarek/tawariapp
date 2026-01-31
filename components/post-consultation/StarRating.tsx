"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    className?: string;
}

export function StarRating({
    rating,
    onRatingChange,
    size = "lg",
    disabled = false,
    className,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-10 h-10",
    };

    const gapClasses = {
        sm: "gap-1",
        md: "gap-2",
        lg: "gap-2",
    };

    const StarIcon = ({ filled }: { filled: boolean }) => (
        <svg
            className={cn(
                sizeClasses[size],
                "transition-transform duration-150",
                !disabled && "group-hover:scale-110"
            )}
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={filled ? 0 : 1.5}
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
        </svg>
    );

    return (
        <div className={cn("flex items-center", gapClasses[size], className)}>
            {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoverRating || rating);

                return (
                    <motion.button
                        key={star}
                        type="button"
                        disabled={disabled}
                        onClick={() => onRatingChange(star)}
                        onMouseEnter={() => !disabled && setHoverRating(star)}
                        onMouseLeave={() => !disabled && setHoverRating(0)}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                            "group transition-colors duration-150 focus:outline-none",
                            isActive ? "text-amber-400" : "text-gray-300",
                            !disabled && "cursor-pointer hover:text-amber-400",
                            disabled && "cursor-default opacity-70"
                        )}
                    >
                        <StarIcon filled={isActive} />
                    </motion.button>
                );
            })}
        </div>
    );
}

export default StarRating;
