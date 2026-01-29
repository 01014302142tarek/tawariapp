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
    const [sendError, setSendError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
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
                // If chat is closed and we have new messages, increment unread and trigger animation
                if (!isOpen && result.messages.length > prevCount) {
                    const newCount = result.messages.length - prevCount;
                    setUnreadCount(prev => prev + newCount);
                    setHasNewMessage(true);
                    // Reset animation after 3 seconds
                    setTimeout(() => setHasNewMessage(false), 3000);
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
        setSendError(null);
        try {
            console.log("[QueueChat] Sending message:", {
                conversationId,
                recipientProfileId,
                contentLength: newMessage.trim().length,
                currentProfileId,
            });
            const result = await sendMessage({
                conversationId,
                recipientProfileId,
                content: newMessage.trim(),
            });

            console.log("[QueueChat] Send result:", result);

            if (result.error) {
                console.error("[QueueChat] Send error:", result.error);
                setSendError(result.error);
                // Clear error after 5 seconds
                setTimeout(() => setSendError(null), 5000);
                return;
            }

            if (result.message) {
                setMessages(prev => [...prev, { ...result.message!, sender: undefined }]);
                setNewMessage("");
                // Reset textarea height
                if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                }
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 50);
            }
        } catch (err) {
            console.error("[QueueChat] Error sending message:", err);
            setSendError("Failed to send message");
            setTimeout(() => setSendError(null), 5000);
        } finally {
            setSending(false);
        }
    };

    // Handle key down for Shift+Enter (new line) and Enter (send)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
        // Shift+Enter will naturally create a new line
    };

    // Auto-resize textarea
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
        // Auto-resize
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
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
                                        {/* Error message */}
                                        <AnimatePresence>
                                            {sendError && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mb-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded"
                                                >
                                                    {sendError}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }}
                                            className="flex gap-2 items-end"
                                        >
                                            <textarea
                                                ref={textareaRef}
                                                placeholder={isRTL ? "اكتب رسالة... (Shift+Enter للسطر الجديد)" : "Type a message... (Shift+Enter for new line)"}
                                                value={newMessage}
                                                onChange={handleTextareaChange}
                                                onKeyDown={handleKeyDown}
                                                rows={1}
                                                className={cn(
                                                    "flex-1 px-3 py-2 rounded-lg text-sm border transition-colors resize-none overflow-hidden",
                                                    isDark
                                                        ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500"
                                                        : "bg-gray-50 border-gray-200 text-slate-900 placeholder:text-gray-400 focus:border-teal-500"
                                                )}
                                                style={{ minHeight: "38px", maxHeight: "100px" }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim() || sending}
                                                className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
                        animate={{
                            scale: hasNewMessage ? [1, 1.2, 1] : 1,
                            rotate: hasNewMessage ? [0, -10, 10, -10, 0] : 0,
                        }}
                        transition={{
                            duration: hasNewMessage ? 0.5 : 0.2,
                            repeat: hasNewMessage ? 2 : 0,
                        }}
                        exit={{ scale: 0 }}
                        onClick={() => {
                            setIsOpen(true);
                            setHasNewMessage(false);
                        }}
                        className={cn(
                            "relative w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all",
                            unreadCount > 0
                                ? "bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/50"
                                : "bg-gradient-to-br from-teal-500 to-cyan-500 shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40"
                        )}
                    >
                        {/* Pulse ring when there are unread messages */}
                        {unreadCount > 0 && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-30" />
                        )}
                        {Icons.chat}
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md"
                            >
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </motion.span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default QueueChat;
