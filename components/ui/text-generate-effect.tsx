"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export function TextGenerateEffect({
    words,
    className,
}: {
    words: string;
    className?: string;
}) {
    const wordsArray = words.split(" ");

    return (
        <div className={cn("font-bold", className)}>
            <motion.div className="inline">
                {wordsArray.map((word, idx) => (
                    <motion.span
                        key={word + idx}
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{
                            duration: 0.4,
                            delay: idx * 0.1,
                        }}
                        className="inline-block mr-2"
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.div>
        </div>
    );
}
