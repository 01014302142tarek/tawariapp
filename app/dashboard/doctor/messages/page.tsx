"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";

// Mock Data
const conversations = [
    { id: 1, name: "Sarah Johnson", lastMessage: "Thank you doctor, I'll take the medication as prescribed.", time: "2 min ago", unread: 2, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
    { id: 2, name: "Mohamed Ali", lastMessage: "When should I come for the next appointment?", time: "15 min ago", unread: 1, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    { id: 3, name: "Fatima Khaled", lastMessage: "I've been feeling much better lately.", time: "1 hour ago", unread: 0, image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
    { id: 4, name: "Omar Nasser", lastMessage: "The ECG results look normal.", time: "3 hours ago", unread: 0, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    { id: 5, name: "Layla Ahmed", lastMessage: "Should I continue with the current dosage?", time: "Yesterday", unread: 0, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
];

const mockMessages = [
    { id: 1, sender: "patient", text: "Good morning Dr. Hassan, I wanted to ask about my medication.", time: "10:30 AM" },
    { id: 2, sender: "doctor", text: "Good morning Sarah! Of course, what would you like to know?", time: "10:32 AM" },
    { id: 3, sender: "patient", text: "I've been experiencing some mild dizziness after taking the blood pressure medication.", time: "10:33 AM" },
    { id: 4, sender: "doctor", text: "That can be a common side effect initially. Are you taking it with food?", time: "10:35 AM" },
    { id: 5, sender: "patient", text: "No, I usually take it on an empty stomach in the morning.", time: "10:36 AM" },
    { id: 6, sender: "doctor", text: "I recommend taking it with breakfast. This should help reduce the dizziness. If it persists for more than a week, please let me know.", time: "10:38 AM" },
    { id: 7, sender: "patient", text: "Thank you doctor, I'll take the medication as prescribed.", time: "10:40 AM" },
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
};

export default function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const { isDark, pageBg, textPrimary, textMuted, inputBg, inputFocus, border } = useThemeStyles();

    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
            {/* Sidebar - Conversations List */}
            <div className={cn("w-80 border-r flex flex-col", border)}>
                {/* Header */}
                <div className={cn("p-4 border-b", border)}>
                    <h1 className={cn("text-xl font-bold flex items-center gap-2 mb-4", textPrimary)}>
                        <span className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                            {Icons.message}
                        </span>
                        Messages
                    </h1>
                    {/* Search */}
                    <div className="relative">
                        <span className={cn("absolute left-3 top-1/2 -translate-y-1/2", textMuted)}>
                            {Icons.search}
                        </span>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn("w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-colors", inputBg, inputFocus)}
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conv) => (
                        <motion.div
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={cn(
                                "flex items-center gap-3 p-4 cursor-pointer transition-colors border-l-2",
                                selectedConversation.id === conv.id
                                    ? "bg-teal-500/5 border-teal-500"
                                    : cn("border-transparent", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")
                            )}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500/30">
                                    <Image src={conv.image} alt={conv.name} fill className="object-cover" unoptimized />
                                </div>
                                {conv.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {conv.unread}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={cn("font-medium truncate", textPrimary)}>{conv.name}</h3>
                                    <span className={cn("text-xs", textMuted)}>{conv.time}</span>
                                </div>
                                <p className={cn("text-sm truncate", textMuted)}>{conv.lastMessage}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className={cn("p-4 border-b flex items-center justify-between backdrop-blur-xl", border, isDark ? "bg-slate-950/80" : "bg-white/80")}>
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/30">
                            <Image src={selectedConversation.image} alt={selectedConversation.name} fill className="object-cover" unoptimized />
                        </div>
                        <div>
                            <h2 className={cn("font-semibold", textPrimary)}>{selectedConversation.name}</h2>
                            <p className="text-xs text-teal-500">Online</p>
                        </div>
                    </div>
                    <button className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all">
                        {Icons.video}
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                                    "max-w-[70%] rounded-2xl px-4 py-3",
                                    msg.sender === "doctor"
                                        ? "bg-teal-500 text-white rounded-br-md"
                                        : isDark
                                            ? "bg-slate-800 text-white rounded-bl-md"
                                            : "bg-gray-200 text-slate-900 rounded-bl-md"
                                )}
                            >
                                <p className="text-sm">{msg.text}</p>
                                <p className={cn(
                                    "text-xs mt-1",
                                    msg.sender === "doctor" ? "text-teal-100" : textMuted
                                )}>{msg.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Message Input */}
                <div className={cn("p-4 border-t", border)}>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className={cn("flex-1 px-4 py-3 rounded-xl border transition-colors", inputBg, inputFocus)}
                        />
                        <button className="px-5 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-400 hover:to-teal-500 transition-all shadow-lg shadow-teal-500/20">
                            {Icons.send}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
