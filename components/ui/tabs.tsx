"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = {
    title: string;
    value: string;
    content?: string | React.ReactNode;
};

export const Tabs = ({
    tabs: propTabs,
    containerClassName,
    activeTabClassName,
    tabClassName,
    contentClassName,
}: {
    tabs: Tab[];
    containerClassName?: string;
    activeTabClassName?: string;
    tabClassName?: string;
    contentClassName?: string;
}) => {
    const [active, setActive] = useState<Tab>(propTabs[0]);
    const [hovering, setHovering] = useState(false);

    return (
        <>
            <div
                className={cn(
                    "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
                    containerClassName
                )}
            >
                {propTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setActive(tab)}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                        className={cn("relative px-4 py-2 rounded-full", tabClassName)}
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {active.value === tab.value && (
                            <motion.div
                                layoutId="clickedbutton"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                className={cn(
                                    "absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full",
                                    activeTabClassName
                                )}
                            />
                        )}
                        <span
                            className={cn(
                                "relative block text-white",
                                active.value === tab.value ? "text-white" : "text-gray-400"
                            )}
                        >
                            {tab.title}
                        </span>
                    </button>
                ))}
            </div>
            <FadeInDiv
                tabs={propTabs}
                active={active}
                hovering={hovering}
                className={cn("mt-8", contentClassName)}
            />
        </>
    );
};

const FadeInDiv = ({
    className,
    tabs,
    active,
    hovering,
}: {
    className?: string;
    tabs: Tab[];
    active: Tab;
    hovering?: boolean;
}) => {
    return (
        <div className={cn("relative w-full h-full", className)}>
            {tabs.map((tab) => (
                <motion.div
                    key={tab.value}
                    layoutId={tab.value}
                    style={{
                        scale: tab.value === active.value ? 1 : 0.95,
                        display: tab.value === active.value ? "block" : "none",
                    }}
                    animate={{
                        opacity: tab.value === active.value ? 1 : 0,
                    }}
                    className="w-full h-full"
                >
                    {tab.content}
                </motion.div>
            ))}
        </div>
    );
};
