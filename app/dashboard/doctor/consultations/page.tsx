"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { useThemeStyles } from "../context/useThemeStyles";

// Mock Data
const consultations = [
    { id: 1, patient: "Mohamed Ali", type: "Initial Consultation", duration: "25 min", status: "active", startedAt: "10:30 AM", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
];

const history = [
    { id: 1, patient: "Sarah Johnson", type: "Follow-up", duration: "18 min", date: "Dec 14, 2024", time: "09:00 AM", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
    { id: 2, patient: "Omar Nasser", type: "ECG Review", duration: "32 min", date: "Dec 13, 2024", time: "03:30 PM", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    { id: 3, patient: "Fatima Khaled", type: "Checkup", duration: "22 min", date: "Dec 12, 2024", time: "11:00 AM", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
    { id: 4, patient: "Layla Ahmed", type: "Blood Pressure", duration: "15 min", date: "Dec 11, 2024", time: "02:00 PM", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
    { id: 5, patient: "Ahmed Hassan", type: "Consultation", duration: "28 min", date: "Dec 10, 2024", time: "10:00 AM", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
];

// Icons
const Icons = {
    video: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    play: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
    clock: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    link: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
    ),
};

export default function ConsultationsPage() {
    const [roomCode, setRoomCode] = useState("");
    const { isDark, pageBg, textPrimary, textSecondary, textMuted, inputBg, inputFocus, divider, cardHover } = useThemeStyles();

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={cn("text-2xl font-bold flex items-center gap-3", textPrimary)}>
                        <span className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.video}
                        </span>
                        Consultations
                    </h1>
                    <p className={cn("mt-1", textMuted)}>Manage video consultations with patients</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Start New Call */}
                <GlowingCard glowColor="teal" className="p-6">
                    <h2 className={cn("text-lg font-semibold mb-4", textPrimary)}>Start New Consultation</h2>
                    <p className={cn("text-sm mb-6", textMuted)}>Begin a video call with your next patient</p>
                    <button className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-teal-500/20 group">
                        <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
                        >
                            {Icons.play}
                        </motion.span>
                        <span className="text-lg">Start Video Call</span>
                    </button>
                </GlowingCard>

                {/* Join by Code */}
                <GlowingCard glowColor="teal" className="p-6">
                    <h2 className={cn("text-lg font-semibold mb-4", textPrimary)}>Join by Room Code</h2>
                    <p className={cn("text-sm mb-6", textMuted)}>Enter a room code to join an existing session</p>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <span className={cn("absolute left-4 top-1/2 -translate-y-1/2", textMuted)}>
                                {Icons.link}
                            </span>
                            <input
                                type="text"
                                placeholder="Enter room code..."
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className={cn("w-full pl-12 pr-4 py-3.5 rounded-xl border transition-colors", inputBg, inputFocus)}
                            />
                        </div>
                        <button className="px-6 py-3.5 bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white font-semibold rounded-xl border border-teal-500/20 transition-all">
                            Join
                        </button>
                    </div>
                </GlowingCard>
            </div>

            {/* Active Consultation */}
            {consultations.length > 0 && (
                <section className="mb-8">
                    <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", textPrimary)}>
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        Active Now
                    </h2>
                    {consultations.map((consultation) => (
                        <GlowingCard key={consultation.id} glowColor="teal" className="p-6 border-teal-500/30">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-teal-500">
                                        <Image src={consultation.image} alt={consultation.patient} fill className="object-cover" unoptimized />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className={cn("text-xl font-semibold", textPrimary)}>{consultation.patient}</h3>
                                    <p className={textMuted}>{consultation.type}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                        <span className="text-teal-500 flex items-center gap-1">
                                            {Icons.clock}
                                            Started at {consultation.startedAt}
                                        </span>
                                        <span className={textMuted}>Duration: {consultation.duration}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-400 transition-all">
                                        Rejoin Call
                                    </button>
                                    <button className="px-6 py-3 bg-red-500/10 text-red-400 font-semibold rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                                        End Call
                                    </button>
                                </div>
                            </div>
                        </GlowingCard>
                    ))}
                </section>
            )}

            {/* History */}
            <section>
                <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", textPrimary)}>
                    <span className={textMuted}>{Icons.clock}</span>
                    Recent Consultations
                </h2>
                <GlowingCard glowColor="teal" className="p-0 overflow-hidden">
                    <div className={divider}>
                        {history.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn("flex items-center gap-4 p-4 transition-colors cursor-pointer", cardHover)}
                            >
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500/30">
                                    <Image src={item.image} alt={item.patient} fill className="object-cover" unoptimized />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn("font-medium", textPrimary)}>{item.patient}</h3>
                                    <p className={cn("text-sm", textMuted)}>{item.type}</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className={cn("text-sm", textSecondary)}>{item.date}</p>
                                    <p className={cn("text-xs", textMuted)}>{item.time}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-teal-500">{item.duration}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlowingCard>
            </section>
        </div>
    );
}
