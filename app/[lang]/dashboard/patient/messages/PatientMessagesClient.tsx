"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "../context/useThemeStyles";
import { useI18n } from "@/app/i18n";
import {
    getConversations,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    getPatientContacts,
    getOrCreateConversation,
    uploadMessageAttachment,
    getAttachmentUrl,
    type Conversation,
    type MessageWithSender,
    type ContactForMessaging,
} from "@/app/actions/messages";

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
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    spinner: (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
    empty: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    attachment: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
    ),
    document: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    download: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    ),
};

export default function MessagesPage({
    initialConversations = [],
    initialLoaded = false,
}: {
    initialConversations?: Conversation[];
    initialLoaded?: boolean;
}) {
    const { t, isRTL } = useI18n();
    const { isDark, textPrimary, textMuted, inputBg, inputFocus, border } = useThemeStyles();

    // State
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
        initialConversations[0] || null
    );
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [contacts, setContacts] = useState<ContactForMessaging[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [loading, setLoading] = useState(!initialLoaded);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
    const [sendError, setSendError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Define loadConversations with useCallback
    const loadConversations = useCallback(async () => {
        setLoading(true);
        const { conversations: convs } = await getConversations();
        setConversations(convs);
        if (convs.length > 0) {
            setSelectedConversation(prev => prev || convs[0]);
        }
        setLoading(false);
    }, []);

    // Define loadMessages with useCallback
    const loadMessages = useCallback(async (conversationId: string) => {
        setLoadingMessages(true);
        const { messages: msgs } = await getMessages(conversationId);
        setMessages(msgs);
        setLoadingMessages(false);

        // Mark messages as read
        await markMessagesAsRead(conversationId);

        // Update unread count in conversations list
        setConversations(prev =>
            prev.map(c => c.id === conversationId ? { ...c, unread_count: 0 } : c)
        );
    }, []);

    // Load conversations on mount
    useEffect(() => {
        if (!initialLoaded) {
            loadConversations();
        }
    }, [initialLoaded, loadConversations]);

    // Load messages when conversation changes
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
        }
    }, [selectedConversation, loadMessages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load contacts for new chat
    const loadContacts = useCallback(async () => {
        const { contacts: c } = await getPatientContacts();
        setContacts(c);
    }, []);

    useEffect(() => {
        if (showNewChatModal) {
            loadContacts();
        }
    }, [showNewChatModal, loadContacts]);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            setSendError(isRTL ? "نوع الملف غير مدعوم. يرجى اختيار صورة أو PDF." : "File type not supported. Please select an image or PDF.");
            setTimeout(() => setSendError(null), 5000);
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setSendError(isRTL ? "الملف كبير جداً. الحد الأقصى 10 ميجابايت." : "File too large. Maximum size is 10MB.");
            setTimeout(() => setSendError(null), 5000);
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    // Clear selected file
    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Load attachment URL for display
    const loadAttachmentUrl = useCallback(async (attachmentPath: string, conversationId: string, messageId: string) => {
        if (attachmentUrls[messageId]) return;

        try {
            const result = await getAttachmentUrl(attachmentPath, conversationId);
            if (result.url) {
                setAttachmentUrls(prev => ({ ...prev, [messageId]: result.url! }));
            }
        } catch (err) {
            console.error("Error loading attachment URL:", err);
        }
    }, [attachmentUrls]);

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !selectedFile) || !selectedConversation || sendingMessage || uploading) return;

        setSendingMessage(true);
        setSendError(null);

        try {
            let attachmentUrl: string | null = null;
            let attachmentType: string | null = null;

            // Upload file if selected
            if (selectedFile) {
                setUploading(true);

                // Convert file to base64
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedFile);
                });

                const uploadResult = await uploadMessageAttachment({
                    conversationId: selectedConversation.id,
                    recipientProfileId: selectedConversation.participant_id,
                    fileBase64: base64,
                    fileName: selectedFile.name,
                });

                setUploading(false);

                if (uploadResult.error) {
                    setSendError(uploadResult.error);
                    setTimeout(() => setSendError(null), 5000);
                    setSendingMessage(false);
                    return;
                }

                attachmentUrl = uploadResult.attachmentUrl;
                attachmentType = uploadResult.attachmentType;
            }

            const { message, error } = await sendMessage({
                conversationId: selectedConversation.id,
                recipientProfileId: selectedConversation.participant_id,
                content: newMessage.trim() || (selectedFile ? `📎 ${selectedFile.name}` : ""),
                messageType: attachmentUrl ? "file" : "text",
                attachmentUrl: attachmentUrl || undefined,
                attachmentType: attachmentType || undefined,
            });

            if (error) {
                console.error("Failed to send message:", error);
                setSendError(error);
                setTimeout(() => setSendError(null), 5000);
            }

            if (message && !error) {
                // Add message with sender info
                const newMsg: MessageWithSender = {
                    ...message,
                    sender: {
                        id: message.sender_profile_id,
                        full_name: isRTL ? "أنت" : "You",
                        role: "patient",
                    },
                };
                setMessages(prev => [...prev, newMsg]);
                setNewMessage("");
                clearSelectedFile();

                // Update conversation list
                setConversations(prev =>
                    prev.map(c =>
                        c.id === selectedConversation.id
                            ? { ...c, last_message: message.content, last_message_at: message.created_at }
                            : c
                    )
                );
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setSendError(isRTL ? "حدث خطأ أثناء الإرسال" : "Error sending message");
            setTimeout(() => setSendError(null), 5000);
        } finally {
            setSendingMessage(false);
            setUploading(false);
        }
    };

    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
        setTimeout(() => setShowSidebar(false), 300);
    };

    const handleStartNewChat = async (contact: ContactForMessaging) => {
        // Check if conversation already exists
        const existingConv = conversations.find(c => c.participant_id === contact.profile_id);
        if (existingConv) {
            setSelectedConversation(existingConv);
            setShowNewChatModal(false);
            return;
        }

        // Create new conversation
        const { conversationId } = await getOrCreateConversation(contact.profile_id);
        if (conversationId) {
            const newConv: Conversation = {
                id: conversationId,
                participant_id: contact.profile_id,
                participant_name: contact.full_name,
                participant_avatar: contact.avatar_url,
                participant_role: contact.role,
                unread_count: 0,
            };
            setConversations(prev => [newConv, ...prev]);
            setSelectedConversation(newConv);
        }
        setShowNewChatModal(false);
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return isRTL ? "الآن" : "Just now";
        if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
        if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
        if (days === 1) return isRTL ? "أمس" : "Yesterday";
        return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", { month: "short", day: "numeric" });
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" });
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
                showSidebar ? "translate-x-0" : (isRTL ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0")
            )}>
                {/* Header */}
                <div className={cn("p-3 md:p-4 border-b", border)}>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h1 className={cn("text-lg md:text-xl font-bold flex items-center gap-2", textPrimary)}>
                            <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                                {Icons.message}
                            </span>
                            {t.patientDashboard.messagesPage.sidebarTitle}
                        </h1>
                        <button
                            onClick={() => setShowNewChatModal(true)}
                            className="p-2 rounded-lg bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all"
                            title={isRTL ? "محادثة جديدة" : "New Chat"}
                        >
                            {Icons.plus}
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <span className={cn("absolute top-1/2 -translate-y-1/2", textMuted, isRTL ? "right-3" : "left-3")}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder={t.patientDashboard.messagesPage.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full py-2 text-sm rounded-lg border transition-colors",
                                isRTL ? "pr-9 pl-3" : "pl-9 pr-3",
                                inputBg, inputFocus
                            )}
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <span className="text-teal-500">{Icons.spinner}</span>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 px-4">
                            <span className={textMuted}>{Icons.empty}</span>
                            <p className={cn("text-sm mt-2 text-center", textMuted)}>
                                {isRTL ? "لا توجد محادثات بعد" : "No conversations yet"}
                            </p>
                            <button
                                onClick={() => setShowNewChatModal(true)}
                                className="mt-3 text-sm text-teal-500 hover:underline"
                            >
                                {isRTL ? "ابدأ محادثة جديدة" : "Start a new chat"}
                            </button>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <motion.div
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                className={cn(
                                    "flex items-center gap-2 md:gap-3 p-3 md:p-4 cursor-pointer transition-colors",
                                    isRTL ? "border-r-2" : "border-l-2",
                                    selectedConversation?.id === conv.id
                                        ? "bg-teal-500/5 border-teal-500"
                                        : cn("border-transparent", isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")
                                )}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-teal-500/30">
                                        {conv.participant_avatar ? (
                                            <Image
                                                src={conv.participant_avatar}
                                                alt={conv.participant_name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 40px, 48px"
                                            />
                                        ) : (
                                            <div className={cn(
                                                "w-full h-full flex items-center justify-center text-lg font-semibold",
                                                isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-600"
                                            )}>
                                                {conv.participant_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-teal-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                        <h3 className={cn("font-medium truncate text-sm md:text-base", textPrimary)}>
                                            {conv.participant_name}
                                        </h3>
                                        <span className={cn("text-[10px] md:text-xs flex-shrink-0", isRTL ? "mr-2" : "ml-2", textMuted)}>
                                            {formatTime(conv.last_message_at)}
                                        </span>
                                    </div>
                                    <p className={cn("text-[10px] md:text-xs text-teal-500")}>
                                        {isRTL ? "طبيب" : "Doctor"}
                                    </p>
                                    {conv.last_message && (
                                        <p className={cn("text-xs md:text-sm truncate", textMuted)}>
                                            {conv.last_message}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className={cn(
                            "p-3 md:p-4 border-b flex items-center justify-between backdrop-blur-xl",
                            border,
                            isDark ? "bg-slate-950/80" : "bg-white/80"
                        )}>
                            <div className="flex items-center gap-2 md:gap-3">
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
                                    {selectedConversation.participant_avatar ? (
                                        <Image
                                            src={selectedConversation.participant_avatar}
                                            alt={selectedConversation.participant_name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 32px, 40px"
                                        />
                                    ) : (
                                        <div className={cn(
                                            "w-full h-full flex items-center justify-center text-sm font-semibold",
                                            isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-600"
                                        )}>
                                            {selectedConversation.participant_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className={cn("font-semibold text-sm md:text-base", textPrimary)}>
                                        {selectedConversation.participant_name}
                                    </h2>
                                    <p className="text-[10px] md:text-xs text-teal-500">
                                        {isRTL ? "طبيب" : "Doctor"}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all">
                                {Icons.video}
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-teal-500">{Icons.spinner}</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <span className={cn("text-gray-400", textMuted)}>{Icons.empty}</span>
                                    <p className={cn("text-sm mt-2", textMuted)}>
                                        {isRTL ? "لا توجد رسائل بعد. ابدأ المحادثة!" : "No messages yet. Start the conversation!"}
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isOwnMessage = msg.sender?.role === "patient";
                                    const hasAttachment = msg.attachment_url && msg.attachment_type;

                                    // Load attachment URL if needed
                                    if (hasAttachment && selectedConversation && !attachmentUrls[msg.id]) {
                                        loadAttachmentUrl(msg.attachment_url!, selectedConversation.id, msg.id);
                                    }

                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "flex",
                                                isOwnMessage ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[85%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2 md:py-3",
                                                    isOwnMessage
                                                        ? cn("bg-teal-500 text-white", isRTL ? "rounded-bl-md" : "rounded-br-md")
                                                        : cn(
                                                            isDark ? "bg-slate-800 text-white" : "bg-gray-200 text-slate-900",
                                                            isRTL ? "rounded-br-md" : "rounded-bl-md"
                                                        )
                                                )}
                                            >
                                                {/* Attachment display */}
                                                {hasAttachment && (
                                                    <div className="mb-2">
                                                        {msg.attachment_type === "image" ? (
                                                            attachmentUrls[msg.id] ? (
                                                                <a
                                                                    href={attachmentUrls[msg.id]}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block"
                                                                >
                                                                    <Image
                                                                        src={attachmentUrls[msg.id]}
                                                                        alt={isRTL ? "مرفق" : "Attachment"}
                                                                        width={480}
                                                                        height={320}
                                                                        sizes="(max-width: 768px) 80vw, 480px"
                                                                        className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                    />
                                                                </a>
                                                            ) : (
                                                                <div className={cn(
                                                                    "w-full h-24 rounded-lg flex items-center justify-center",
                                                                    isOwnMessage ? "bg-teal-600" : isDark ? "bg-slate-700" : "bg-gray-300"
                                                                )}>
                                                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                                                                </div>
                                                            )
                                                        ) : (
                                                            <a
                                                                href={attachmentUrls[msg.id] || "#"}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={cn(
                                                                    "flex items-center gap-2 p-2 rounded-lg transition-colors",
                                                                    isOwnMessage
                                                                        ? "bg-teal-600 hover:bg-teal-700"
                                                                        : isDark
                                                                            ? "bg-slate-700 hover:bg-slate-600"
                                                                            : "bg-gray-300 hover:bg-gray-400",
                                                                    !attachmentUrls[msg.id] && "pointer-events-none opacity-70"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded flex items-center justify-center flex-shrink-0",
                                                                    isOwnMessage ? "bg-teal-700" : isDark ? "bg-slate-600" : "bg-gray-400"
                                                                )}>
                                                                    {Icons.document}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium truncate">
                                                                        {isRTL ? "مستند PDF" : "PDF Document"}
                                                                    </p>
                                                                </div>
                                                                {attachmentUrls[msg.id] && (
                                                                    <div className="flex-shrink-0">
                                                                        {Icons.download}
                                                                    </div>
                                                                )}
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Message content (hide if it's just the file emoji placeholder) */}
                                                {msg.content && !msg.content.startsWith("📎") && (
                                                    <p className="text-sm">{msg.content}</p>
                                                )}
                                                <p className={cn(
                                                    "text-[10px] md:text-xs mt-1",
                                                    isOwnMessage ? "text-teal-100" : textMuted
                                                )}>
                                                    {formatMessageTime(msg.created_at)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className={cn("p-3 md:p-4 border-t", border)}>
                            {/* Error message */}
                            <AnimatePresence>
                                {sendError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-2 px-3 py-2 bg-red-500/10 text-red-500 text-sm rounded-lg"
                                    >
                                        {sendError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* File preview */}
                            <AnimatePresence>
                                {selectedFile && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={cn(
                                            "mb-2 p-2 rounded-lg flex items-center gap-2",
                                            isDark ? "bg-slate-800" : "bg-gray-100"
                                        )}
                                    >
                                        {filePreview ? (
                                            <Image
                                                src={filePreview}
                                                alt={isRTL ? "معاينة" : "Preview"}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 object-cover rounded"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className={cn(
                                                "w-12 h-12 rounded flex items-center justify-center",
                                                isDark ? "bg-slate-700 text-slate-400" : "bg-gray-200 text-gray-500"
                                            )}>
                                                {Icons.document}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-medium truncate",
                                                textPrimary
                                            )}>
                                                {selectedFile.name}
                                            </p>
                                            <p className={cn("text-xs", textMuted)}>
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearSelectedFile}
                                            className={cn(
                                                "p-1 rounded-full transition-colors",
                                                isDark ? "hover:bg-slate-600 text-slate-400" : "hover:bg-gray-200 text-gray-500"
                                            )}
                                        >
                                            {Icons.close}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-2 md:gap-3">
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {/* Attachment button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={sendingMessage || uploading}
                                    className={cn(
                                        "p-2 md:p-3 rounded-lg md:rounded-xl transition-colors flex-shrink-0",
                                        isDark
                                            ? "hover:bg-slate-700 text-slate-400 hover:text-teal-400"
                                            : "hover:bg-gray-100 text-gray-500 hover:text-teal-500",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                    title={isRTL ? "إرفاق ملف" : "Attach file"}
                                >
                                    {Icons.attachment}
                                </button>

                                <input
                                    type="text"
                                    placeholder={t.patientDashboard.messagesPage.inputPlaceholder}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                    className={cn(
                                        "flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl border transition-colors text-sm",
                                        inputBg, inputFocus
                                    )}
                                    disabled={sendingMessage || uploading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={(!newMessage.trim() && !selectedFile) || sendingMessage || uploading}
                                    className={cn(
                                        "px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg md:rounded-xl transition-all shadow-lg shadow-teal-500/20",
                                        (newMessage.trim() || selectedFile) && !sendingMessage && !uploading
                                            ? "hover:from-teal-400 hover:to-teal-500"
                                            : "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {sendingMessage || uploading ? Icons.spinner : Icons.send}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className={cn(
                                "p-2 rounded-lg md:hidden transition-colors mb-4",
                                isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                            )}
                        >
                            {Icons.users}
                        </button>
                        <span className={cn("text-gray-400", textMuted)}>{Icons.empty}</span>
                        <p className={cn("text-sm mt-2", textMuted)}>
                            {isRTL ? "اختر محادثة للبدء" : "Select a conversation to start"}
                        </p>
                        <button
                            onClick={() => setShowNewChatModal(true)}
                            className="mt-3 px-4 py-2 bg-teal-500/10 text-teal-500 rounded-lg hover:bg-teal-500 hover:text-white transition-all"
                        >
                            {isRTL ? "ابدأ محادثة جديدة" : "Start a new chat"}
                        </button>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            <AnimatePresence>
                {showNewChatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNewChatModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={cn(
                                "w-full max-w-md rounded-2xl p-6",
                                isDark ? "bg-slate-900" : "bg-white"
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className={cn("text-lg font-semibold", textPrimary)}>
                                    {isRTL ? "محادثة جديدة" : "New Chat"}
                                </h2>
                                <button
                                    onClick={() => setShowNewChatModal(false)}
                                    className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-white/10" : "hover:bg-gray-100")}
                                >
                                    {Icons.close}
                                </button>
                            </div>
                            <p className={cn("text-sm mb-4", textMuted)}>
                                {isRTL
                                    ? "اختر طبيبًا من الأطباء الذين زرتهم سابقًا"
                                    : "Select a doctor from your previous appointments"
                                }
                            </p>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {contacts.length === 0 ? (
                                    <p className={cn("text-sm text-center py-8", textMuted)}>
                                        {isRTL
                                            ? "لا توجد أطباء متاحين. احجز موعدًا أولاً."
                                            : "No doctors available. Book an appointment first."
                                        }
                                    </p>
                                ) : (
                                    contacts.map((contact) => (
                                        <button
                                            key={contact.profile_id}
                                            onClick={() => handleStartNewChat(contact)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                                                isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/30 flex-shrink-0">
                                                {contact.avatar_url ? (
                                                    <Image
                                                        src={contact.avatar_url}
                                                        alt={contact.full_name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className={cn(
                                                        "w-full h-full flex items-center justify-center text-sm font-semibold",
                                                        isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-600"
                                                    )}>
                                                        {contact.full_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={cn("text-start", isRTL ? "text-right" : "text-left")}>
                                                <p className={cn("font-medium", textPrimary)}>{contact.full_name}</p>
                                                <p className="text-xs text-teal-500">
                                                    {isRTL ? "طبيب" : "Doctor"}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
