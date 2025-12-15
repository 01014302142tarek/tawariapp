"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";

// Mock Data
const conversations = [
    { id: 1, name: "Dr. Ahmed Hassan", specialty: "Cardiologist", lastMessage: "Your test results look good. Keep up with the medication.", time: "2 min ago", unread: 2, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
    { id: 2, name: "Dr. Fatima Khaled", specialty: "General Practitioner", lastMessage: "Please schedule a follow-up in 2 weeks.", time: "1 hour ago", unread: 0, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
    { id: 3, name: "Dr. Omar Nasser", specialty: "Dermatologist", lastMessage: "The cream should help with the irritation.", time: "Yesterday", unread: 0, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
];

const mockMessages = [
    { id: 1, sender: "doctor", text: "Good morning Sarah! I've reviewed your latest blood work.", time: "10:30 AM" },
    { id: 2, sender: "patient", text: "Good morning Dr. Hassan! What do the results show?", time: "10:32 AM" },
    { id: 3, sender: "doctor", text: "Your cholesterol levels have improved significantly since our last check.", time: "10:33 AM" },
    { id: 4, sender: "doctor", text: "The Atorvastatin is working well. Your LDL is now within normal range.", time: "10:34 AM" },
    { id: 5, sender: "patient", text: "That's great news! Should I continue with the same dosage?", time: "10:36 AM" },
    { id: 6, sender: "doctor", text: "Yes, continue with 20mg daily. We'll check again in 3 months.", time: "10:38 AM" },
    { id: 7, sender: "doctor", text: "Your test results look good. Keep up with the medication.", time: "10:40 AM" },
];

// Icons
const Icons = {
    message: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    search: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    send: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
    ),
    video: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    back: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
};

export default function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);
    const { isDark, textPrimary, textMuted, inputBg, inputFocus, border } = useThemeStyles();

    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectConversation = (conv: typeof conversations[0]) => {
        setSelectedConversation(conv);
        // Delay sidebar collapse by 0.5 seconds for better UX
        setTimeout(() => {
            setShowSidebar(false);
        }, 500);
    };

    return (
        <div className="flex overflow-hidden relative" style={{ height: 'calc(100vh - 73px)' }}>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setShowSidebar(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Conversations List */}
            <div className={cn(
                "fixed md:relative z-40 md:z-0 h-full w-[280px] md:w-80 border-r flex flex-col transition-transform duration-300 md:translate-x-0",
                border,
                isDark ? "bg-slate-950" : "bg-white",
                showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Header */}
                <div className={cn("p-3 md:p-4 border-b", border)}>
                    <h1 className={cn("text-lg md:text-xl font-bold flex items-center gap-2 mb-3 md:mb-4", textPrimary)}>
                        <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </span>
                        Messages
                    </h1>
                    {/* Search */}
                    <div className="relative">
                        <span className={cn("absolute left-3 top-1/2 -translate-y-1/2", textMuted)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn("w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors", inputBg, inputFocus)}
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <motion.div
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv)}
                            className={cn(
                                "flex items-center gap-2 md:gap-3 p-3 md:p-4 cursor-pointer transition-colors border-l-2",
                                selectedConversation.id === conv.id
                                    ? "bg-teal-500/5 border-teal-500"
                                    : cn("border-transparent", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")
                            )}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-teal-500/30">
                                    <Image src={conv.image} alt={conv.name} fill className="object-cover" unoptimized />
                                </div>
                                {conv.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-teal-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center">
                                        {conv.unread}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                    <h3 className={cn("font-medium truncate text-sm md:text-base", textPrimary)}>{conv.name}</h3>
                                    <span className={cn("text-[10px] md:text-xs flex-shrink-0 ml-2", textMuted)}>{conv.time}</span>
                                </div>
                                <p className={cn("text-[10px] md:text-xs", textMuted)}>{conv.specialty}</p>
                                <p className={cn("text-xs md:text-sm truncate", textMuted)}>{conv.lastMessage}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className={cn("p-3 md:p-4 border-b flex items-center justify-between backdrop-blur-xl", border, isDark ? "bg-slate-950/80" : "bg-white/80")}>
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Mobile back button / sidebar toggle */}
                        <button
                            onClick={() => setShowSidebar(true)}
                            className={cn(
                                "p-2 rounded-lg md:hidden transition-colors",
                                isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                            )}
                        >
                            {Icons.users}
                        </button>
                        <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-teal-500/30">
                            <Image src={selectedConversation.image} alt={selectedConversation.name} fill className="object-cover" unoptimized />
                        </div>
                        <div>
                            <h2 className={cn("font-semibold text-sm md:text-base", textPrimary)}>{selectedConversation.name}</h2>
                            <p className="text-[10px] md:text-xs text-teal-500">{selectedConversation.specialty}</p>
                        </div>
                    </div>
                    <button className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
                    {mockMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex",
                                msg.sender === "patient" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[85%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2 md:py-3",
                                    msg.sender === "patient"
                                        ? "bg-teal-500 text-white rounded-br-md"
                                        : isDark
                                            ? "bg-slate-800 text-white rounded-bl-md"
                                            : "bg-gray-200 text-slate-900 rounded-bl-md"
                                )}
                            >
                                <p className="text-sm">{msg.text}</p>
                                <p className={cn(
                                    "text-[10px] md:text-xs mt-1",
                                    msg.sender === "patient" ? "text-teal-100" : textMuted
                                )}>{msg.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Message Input */}
                <div className={cn("p-3 md:p-4 border-t", border)}>
                    <div className="flex gap-2 md:gap-3">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className={cn("flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border transition-colors text-sm", inputBg, inputFocus)}
                        />
                        <button className="px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg md:rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/20">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
