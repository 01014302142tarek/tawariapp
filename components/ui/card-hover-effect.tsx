"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface HoverEffectProps {
    items: {
        title: string;
        description: string;
        icon: React.ReactNode;
        link?: string;
    }[];
    className?: string;
}

export function HoverEffect({ items, className }: HoverEffectProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {items.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative group block p-2 h-full w-full"
                >
                    <div className="relative h-full w-full p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 group-hover:border-amber-500/50 overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:shadow-amber-500/10">
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
