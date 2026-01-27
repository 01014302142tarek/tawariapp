"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    getMessages,
    sendMessage,
    getOrCreateConversation,
    type MessageWithSender,
} from "@/app/actions/messages";

// ============================================
// Types
// ============================================
interface QueueChatProps {
    recipientProfileId: string;
    recipientName: string;
    recipientAvatar?: string;
    isDark?: boolean;
    isRTL?: boolean;
    currentProfileId: string;
    className?: string;
}

// ============================================
// Icons
// ============================================
const Icons = {
    chat: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    send: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
    ),
    close: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    minimize: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    expand: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
    ),
};

// ============================================
// Main Component
// ============================================
export function QueueChat({
    recipientProfileId,
    recipientName,
    recipientAvatar,
    isDark = true,
    isRTL = false,
    currentProfileId,
    className,
}: QueueChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize conversation
    const initConversation = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getOrCreateConversation(recipientProfileId);
            if (result.conversationId) {
                setConversationId(result.conversationId);
            }
        } catch (err) {
            console.error("[QueueChat] Error initializing conversation:", err);
        } finally {
            setLoading(false);
        }
    }, [recipientProfileId]);

    // Load messages
    const loadMessages = useCallback(async () => {
        if (!conversationId) return;

        try {
            const result = await getMessages(conversationId);
            if (result.messages) {
                const prevCount = messages.length;
                setMessages(result.messages);
                // If chat is closed and we have new messages, increment unread
                if (!isOpen && result.messages.length > prevCount) {
                    setUnreadCount(prev => prev + (result.messages.length - prevCount));
                }
            }
        } catch (err) {
            console.error("[QueueChat] Error loading messages:", err);
        }
    }, [conversationId, isOpen, messages.length]);

    // Initialize on mount
    useEffect(() => {
        initConversation();
    }, [initConversation]);

    // Load messages when conversation is established
    useEffect(() => {
        if (conversationId) {
            loadMessages();
        }
    }, [conversationId, loadMessages]);

    // Poll for new messages
    useEffect(() => {
        if (!conversationId) return;

        pollingRef.current = setInterval(() => {
            loadMessages();
        }, 5000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [conversationId, loadMessages]);

    // Scroll to bottom when messages change or chat opens
    useEffect(() => {
        if (isOpen && isExpanded) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages, isOpen, isExpanded]);

    // Clear unread when opening chat
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !conversationId || sending) return;

        setSending(true);
        try {
            const result = await sendMessage({
                conversationId,
                recipientProfileId,
                content: newMessage.trim(),
            });

            if (result.message) {
                setMessages(prev => [...prev, { ...result.message!, sender: undefined }]);
                setNewMessage("");
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 50);
            }
        } catch (err) {
            console.error("[QueueChat] Error sending message:", err);
        } finally {
            setSending(false);
        }
    };

    // Format time
    const formatTime = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Get initials
    const getInitials = (name: string): string => {
        if (!name) return "?";
        const parts = name.trim().split(" ").filter(Boolean);
        if (parts.length === 0) return "?";
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className={cn("fixed bottom-4 z-40", isRTL ? "left-4" : "right-4", className)}>
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={cn(
                            "w-80 rounded-2xl border shadow-2xl overflow-hidden",
                            isDark
                                ? "bg-slate-900 border-white/10"
                                : "bg-white border-gray-200"
                        )}
                    >
                        {/* Header */}
                        <div className={cn(
                            "p-3 border-b flex items-center justify-between",
                            isDark ? "border-white/10 bg-slate-800/50" : "border-gray-200 bg-gray-50"
                        )}>
                            <div className="flex items-center gap-2">
                                {recipientAvatar ? (
                                    <Image
                                        src={recipientAvatar}
                                        alt={recipientName}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                                        {getInitials(recipientName)}
                                    </div>
                                )}
                                <div>
                                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                                        {recipientName}
                                    </p>
                                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                                        {isRTL ? "في قائمة الانتظار" : "In Queue"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-500"
                                    )}
                                >
                                    {isExpanded ? Icons.minimize : Icons.expand}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-200 text-gray-500"
                                    )}
                                >
                                    {Icons.close}
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className={cn(
                                        "h-64 overflow-y-auto p-3 space-y-2",
                                        isDark ? "bg-slate-950" : "bg-white"
                                    )}>
                                        {loading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex items-center justify-center h-full">
                                                <p className={cn("text-sm", isDark ? "text-slate-500" : "text-gray-400")}>
                                                    {isRTL ? "ابدأ المحادثة" : "Start the conversation"}
                                                </p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => {
                                                const isOwnMessage = msg.sender_profile_id === currentProfileId;
                                                return (
                                                    <motion.div
                                                        key={msg.id}
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={cn(
                                                            "flex",
                                                            isOwnMessage ? "justify-end" : "justify-start"
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "max-w-[80%] rounded-xl px-3 py-2",
                                                                isOwnMessage
                                                                    ? "bg-teal-500 text-white rounded-br-sm"
                                                                    : isDark
                                                                        ? "bg-slate-800 text-white rounded-bl-sm"
                                                                        : "bg-gray-100 text-slate-900 rounded-bl-sm"
                                                            )}
                                                        >
                                                            <p className="text-sm">{msg.content}</p>
                                                            <p className={cn(
                                                                "text-[10px] mt-1",
                                                                isOwnMessage ? "text-teal-100" : isDark ? "text-slate-500" : "text-gray-400"
                                                            )}>
                                                                {formatTime(msg.created_at)}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className={cn(
                                        "p-2 border-t",
                                        isDark ? "border-white/10" : "border-gray-200"
                                    )}>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                placeholder={isRTL ? "اكتب رسالة..." : "Type a message..."}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                className={cn(
                                                    "flex-1 px-3 py-2 rounded-lg text-sm border transition-colors",
                                                    isDark
                                                        ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500"
                                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-teal-500"
                                                )}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() || sending}
                                                className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {sending ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    Icons.send
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-teal-500/40 transition-shadow"
                    >
                        {Icons.chat}
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default QueueChat;
