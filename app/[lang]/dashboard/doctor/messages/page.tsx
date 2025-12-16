"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import { useEffect } from "react";

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
};

export default function MessagesPage() {
    const { t, isRTL, language, formatNumber } = useI18n();
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showConversations, setShowConversations] = useState(false);
    const { isDark, pageBg, textPrimary, textMuted, inputBg, inputFocus, border } = useThemeStyles();

    // Mock Data with Translations
    const conversations = [
        { id: 1, name: t.doctorDashboard.messagesPage.demoConversations.p1.name, lastMessage: t.doctorDashboard.messagesPage.demoConversations.p1.lastMessage, time: isRTL ? `منذ ${formatNumber(2)} دقيقة` : `2 ${t.common.time.minsAgo}`, unread: 2, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
        { id: 2, name: t.doctorDashboard.messagesPage.demoConversations.p2.name, lastMessage: t.doctorDashboard.messagesPage.demoConversations.p2.lastMessage, time: isRTL ? `منذ ${formatNumber(15)} دقيقة` : `15 ${t.common.time.minsAgo}`, unread: 1, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
        { id: 3, name: t.doctorDashboard.messagesPage.demoConversations.p3.name, lastMessage: t.doctorDashboard.messagesPage.demoConversations.p3.lastMessage, time: isRTL ? "منذ ساعة" : t.common.time.hourAgo, unread: 0, image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
        { id: 4, name: t.doctorDashboard.messagesPage.demoConversations.p4.name, lastMessage: t.doctorDashboard.messagesPage.demoConversations.p4.lastMessage, time: isRTL ? `منذ ${formatNumber(3)} ساعات` : `3 ${t.common.time.hoursAgo}`, unread: 0, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
        { id: 5, name: t.doctorDashboard.messagesPage.demoConversations.p5.name, lastMessage: t.doctorDashboard.messagesPage.demoConversations.p5.lastMessage, time: isRTL ? "أمس" : "Yesterday", unread: 0, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
    ];

    const mockMessages = [
        { id: 1, sender: "patient", text: t.doctorDashboard.messagesPage.demoMessages.m1, time: isRTL ? "١٠:٣٠ ص" : "10:30 AM" },
        { id: 2, sender: "doctor", text: t.doctorDashboard.messagesPage.demoMessages.m2, time: isRTL ? "١٠:٣٢ ص" : "10:32 AM" },
        { id: 3, sender: "patient", text: t.doctorDashboard.messagesPage.demoMessages.m3, time: isRTL ? "١٠:٣٣ ص" : "10:33 AM" },
        { id: 4, sender: "doctor", text: t.doctorDashboard.messagesPage.demoMessages.m4, time: isRTL ? "١٠:٣٥ ص" : "10:35 AM" },
        { id: 5, sender: "patient", text: t.doctorDashboard.messagesPage.demoMessages.m5, time: isRTL ? "١٠:٣٦ ص" : "10:36 AM" },
        { id: 6, sender: "doctor", text: t.doctorDashboard.messagesPage.demoMessages.m6, time: isRTL ? "١٠:٣٨ ص" : "10:38 AM" },
        { id: 7, sender: "patient", text: t.doctorDashboard.messagesPage.demoMessages.m7, time: isRTL ? "١٠:٤٠ ص" : "10:40 AM" },
    ];

    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);

    useEffect(() => {
        setSelectedConversation(conversations[0]);
    }, [language]); // Reset selected conversation on language change to update translation

    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
            {/* Mobile Conversation Toggle Button */}
            <button
                onClick={() => setShowConversations(!showConversations)}
                className={cn(
                    "fixed bottom-4 right-4 z-50 md:hidden w-14 h-14 rounded-full bg-teal-500 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center",
                    showConversations && "rotate-180"
                )}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>

            {/* Sidebar - Conversations List */}
            <div className={cn(
                "fixed md:relative inset-y-0 left-0 z-40 w-72 md:w-80 border-r flex flex-col transition-transform duration-300 md:translate-x-0",
                border,
                isDark ? "bg-slate-950" : "bg-white",
                // RTL logic for sliding can be complex, keeping LTR slide logic for now unless explicitly asked.
                showConversations ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Header */}
                <div className={cn("p-3 md:p-4 border-b", border)}>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h1 className={cn("text-lg md:text-xl font-bold flex items-center gap-2", textPrimary)}>
                            <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                                {Icons.message}
                            </span>
                            {t.doctorDashboard.messagesPage.sidebarTitle}
                        </h1>
                        <button
                            onClick={() => setShowConversations(false)}
                            className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <span className={cn("absolute left-3 top-1/2 -translate-y-1/2", textMuted)}>
                            {Icons.search}
                        </span>
                        <input
                            type="text"
                            placeholder={t.doctorDashboard.messagesPage.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn("w-full pl-10 pr-4 py-2 md:py-2.5 text-sm rounded-xl border transition-colors", inputBg, inputFocus)}
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <motion.div
                            key={conv.id}
                            onClick={() => {
                                setSelectedConversation(conv);
                                setShowConversations(false);
                            }}
                            className={cn(
                                "flex items-center gap-3 p-3 md:p-4 cursor-pointer transition-colors border-l-2",
                                selectedConversation.id === conv.id
                                    ? "bg-teal-500/5 border-teal-500"
                                    : cn("border-transparent", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")
                            )}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-teal-500/30">
                                    <Image src={conv.image} alt={conv.name} fill className="object-cover" unoptimized />
                                </div>
                                {conv.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-teal-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center">
                                        {formatNumber(conv.unread)}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                    <h3 className={cn("font-medium truncate text-sm md:text-base", textPrimary)}>{conv.name}</h3>
                                    <span className={cn("text-[10px] md:text-xs", textMuted)}>{conv.time}</span>
                                </div>
                                <p className={cn("text-xs md:text-sm truncate", textMuted)}>{conv.lastMessage}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Mobile Overlay */}
            {showConversations && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setShowConversations(false)}
                />
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className={cn("p-3 md:p-4 border-b flex items-center justify-between backdrop-blur-xl", border, isDark ? "bg-slate-950/80" : "bg-white/80")}>
                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setShowConversations(true)}
                            className="md:hidden p-2 -ml-1 rounded-lg text-gray-400 hover:bg-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-teal-500/30">
                            <Image src={selectedConversation.image} alt={selectedConversation.name} fill className="object-cover" unoptimized />
                        </div>
                        <div>
                            <h2 className={cn("font-semibold text-sm md:text-base", textPrimary)}>{selectedConversation.name}</h2>
                            <p className="text-xs text-teal-500">{t.doctorDashboard.messagesPage.online}</p>
                        </div>
                    </div>
                    <button className="p-2 md:p-2.5 rounded-xl bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all">
                        {Icons.video}
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4">
                    {mockMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex",
                                msg.sender === "doctor" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[85%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2 md:py-3",
                                    msg.sender === "doctor"
                                        ? "bg-teal-500 text-white rounded-br-md"
                                        : isDark
                                            ? "bg-slate-800 text-white rounded-bl-md"
                                            : "bg-gray-200 text-slate-900 rounded-bl-md"
                                )}
                            >
                                <p className="text-xs md:text-sm">{msg.text}</p>
                                <p className={cn(
                                    "text-[10px] md:text-xs mt-1",
                                    msg.sender === "doctor" ? "text-teal-100" : textMuted
                                )}>{formatNumber(msg.time)}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Message Input */}
                <div className={cn("p-3 md:p-4 border-t", border)}>
                    <div className="flex gap-2 md:gap-3">
                        <input
                            type="text"
                            placeholder={t.doctorDashboard.messagesPage.inputPlaceholder}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className={cn("flex-1 px-3 md:px-4 py-2.5 md:py-3 rounded-xl border transition-colors text-sm md:text-base", inputBg, inputFocus)}
                        />
                        <button className="px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/20">
                            {Icons.send}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
