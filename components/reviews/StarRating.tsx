"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
    isDark?: boolean;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
};

export default function StarRating({
    rating,
    maxRating = 5,
    size = "md",
    interactive = false,
    onChange,
    showValue = false,
    isDark = false,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (index: number) => {
        if (interactive && onChange) {
            onChange(index);
        }
    };

    const handleMouseEnter = (index: number) => {
        if (interactive) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {Array.from({ length: maxRating }, (_, index) => {
                    const starIndex = index + 1;
                    const isFilled = starIndex <= displayRating;
                    const isHalf = !isFilled && starIndex - 0.5 <= displayRating;

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={!interactive}
                            onClick={() => handleClick(starIndex)}
                            onMouseEnter={() => handleMouseEnter(starIndex)}
                            onMouseLeave={handleMouseLeave}
                            className={cn(
                                "transition-colors",
                                interactive && "cursor-pointer hover:scale-110",
                                !interactive && "cursor-default"
                            )}
                        >
                            <svg
                                className={cn(
                                    sizeClasses[size],
                                    "transition-colors",
                                    isFilled
                                        ? "text-yellow-400 fill-yellow-400"
                                        : isHalf
                                        ? "text-yellow-400 fill-yellow-400/50"
                                        : isDark
                                        ? "text-gray-600 fill-gray-600"
                                        : "text-gray-300 fill-gray-300"
                                )}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                />
                            </svg>
                        </button>
                    );
                })}
            </div>
            {showValue && (
                <span
                    className={cn(
                        "text-sm font-medium",
                        isDark ? "text-gray-300" : "text-gray-600"
                    )}
                >
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
