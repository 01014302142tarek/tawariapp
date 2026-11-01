"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MultiSelectDaysProps {
    value: string[];
    onChange: (selectedDays: string[]) => void;
    placeholder?: string;
    className?: string;
    isDark?: boolean;
    label?: string;
}

const DAYS = [
    { value: "sunday", label: "Sunday", short: "Sun" },
    { value: "monday", label: "Monday", short: "Mon" },
    { value: "tuesday", label: "Tuesday", short: "Tue" },
    { value: "wednesday", label: "Wednesday", short: "Wed" },
    { value: "thursday", label: "Thursday", short: "Thu" },
    { value: "friday", label: "Friday", short: "Fri" },
    { value: "saturday", label: "Saturday", short: "Sat" },
];

export function MultiSelectDays({
    value,
    onChange,
    placeholder = "Select days",
    className,
    isDark = false,
    label,
}: MultiSelectDaysProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempSelection, setTempSelection] = useState<string[]>(value);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Sync tempSelection when value changes externally
    useEffect(() => {
        if (!isOpen) {
            setTempSelection(value);
        }
    }, [value, isOpen]);

    const handleCancel = () => {
        setTempSelection(value); // Restore previous selection
        setIsOpen(false);
    };

    const handleOk = () => {
        onChange(tempSelection);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside - saves the selection
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                handleOk();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen, tempSelection]);

    // Handle keyboard navigation - Escape saves and closes
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                handleOk();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, tempSelection]);

    const toggleDay = (dayValue: string) => {
        setTempSelection((prev) =>
            prev.includes(dayValue)
                ? prev.filter((d) => d !== dayValue)
                : [...prev, dayValue]
        );
    };

    const toggleSelectAll = () => {
        if (tempSelection.length === DAYS.length) {
            setTempSelection([]);
        } else {
            setTempSelection(DAYS.map((d) => d.value));
        }
    };

    const getSummaryText = () => {
        if (value.length === 0) return placeholder;
        if (value.length === DAYS.length) return "All Days";

        // Check for continuous range
        const indices = value
            .map((v) => DAYS.findIndex((d) => d.value === v))
            .filter((i) => i !== -1)
            .sort((a, b) => a - b);

        if (indices.length > 1) {
            let isContinuous = true;
            for (let i = 1; i < indices.length; i++) {
                if (indices[i] !== indices[i - 1] + 1) {
                    isContinuous = false;
                    break;
                }
            }

            if (isContinuous && indices.length > 2) {
                const firstDay = DAYS[indices[0]].short;
                const lastDay = DAYS[indices[indices.length - 1]].short;
                return `${firstDay} - ${lastDay}`;
            }
        }

        // Scattered selection or small range
        return value
            .map((v) => {
                const day = DAYS.find((d) => d.value === v);
                return day?.short;
            })
            .filter(Boolean)
            .join(", ");
    };

    const isAllSelected = tempSelection.length === DAYS.length;
    const isSomeSelected = tempSelection.length > 0 && tempSelection.length < DAYS.length;

    return (
        <div className={cn("relative", className)}>
            {label && (
                <label
                    className={cn(
                        "block text-sm font-medium mb-1.5",
                        isDark ? "text-gray-300" : "text-gray-700"
                    )}
                >
                    {label}
                </label>
            )}

            {/* Input-like button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full px-3 py-2 rounded-lg border text-left flex items-center justify-between transition-all",
                    isDark
                        ? "bg-slate-800/50 border-slate-700 text-gray-200 hover:border-slate-600"
                        : "bg-white border-gray-300 text-gray-900 hover:border-gray-400",
                    isOpen && "ring-2 ring-amber-500/50"
                )}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span
                    className={cn(
                        "text-sm truncate",
                        value.length === 0 && (isDark ? "text-gray-500" : "text-gray-400")
                    )}
                >
                    {getSummaryText()}
                </span>

                {/* Chevron icon */}
                <svg
                    className={cn("w-4 h-4 transition-transform ml-2 flex-shrink-0", isOpen && "rotate-180")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={cn(
                        "absolute z-[100] w-full mt-1 rounded-lg border shadow-xl",
                        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-300"
                    )}
                    role="listbox"
                    aria-label="Select available days"
                    style={{ position: 'absolute' }}
                >
                    {/* Checkbox list */}
                    <div className="max-h-64 overflow-y-auto p-2">
                        {/* Select All */}
                        <label
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                                isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-50"
                            )}
                        >
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 focus:ring-2"
                                    aria-label="Select all days"
                                />
                                {isSomeSelected && !isAllSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-2 h-2 bg-amber-500 rounded-sm" />
                                    </div>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    isDark ? "text-gray-200" : "text-gray-700"
                                )}
                            >
                                Select All
                            </span>
                        </label>

                        {/* Divider */}
                        <div
                            className={cn(
                                "my-2 border-t",
                                isDark ? "border-slate-700" : "border-gray-200"
                            )}
                        />

                        {/* Individual days */}
                        {DAYS.map((day) => {
                            const isChecked = tempSelection.includes(day.value);
                            return (
                                <label
                                    key={day.value}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                                        isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-50",
                                        isChecked && (isDark ? "bg-amber-500/10" : "bg-amber-50")
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleDay(day.value)}
                                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 focus:ring-2"
                                        aria-label={`Select ${day.label}`}
                                    />
                                    <span className={cn("text-sm", isDark ? "text-gray-200" : "text-gray-700")}>
                                        {day.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {/* Action buttons */}
                    <div
                        className={cn(
                            "flex items-center justify-end gap-2 p-3 border-t",
                            isDark ? "border-slate-700" : "border-gray-200"
                        )}
                    >
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                                isDark
                                    ? "text-gray-300 hover:bg-slate-700/50"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleOk}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                                "bg-amber-500 hover:bg-amber-600 text-white"
                            )}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MultiSelectDays;
