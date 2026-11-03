"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/app/i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import { assessSymptoms, type TriageResponse, type TriageDoctorSuggestion } from "@/app/actions/triage";

interface ChatMessage {
    id: string;
    sender: "user" | "assistant";
    text?: string;
    triageResult?: TriageResponse;
    timestamp: string;
}

export function AiTriageWidget() {
    const { isRTL, language } = useI18n();
    const { isDark } = useGlobalTheme();
    const { user } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: "welcome",
                    sender: "assistant",
                    text: isRTL
                        ? "أهلاً بك في طبيبي! 🩺\nلو محتار ومش عارف أي تخصص تحجز؟ اكتبلي الأعراض اللي حاسس بيها وهساعدك تختار التخصص والدكتور الأنسب لحالتك فوراً."
                        : "Welcome to Tabibi! 🩺\nUnsure which specialty to book? Describe your symptoms, and I'll help you find the right specialist and book easily.",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
        }
    }, [isRTL, messages.length]);

    // Auto scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isLoading]);

    const handleSendMessage = async (textToSend?: string) => {
        const query = (textToSend || inputMessage).trim();
        if (!query || isLoading) return;

        setInputMessage("");

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: "user",
            text: query,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const result = await assessSymptoms({
                message: query,
                language: language as "ar" | "en",
            });

            const isTextOnlyReply = Boolean(
                result.conversationalReply &&
                result.suggestedDoctors.length === 0 &&
                result.urgencyLevel !== "emergency"
            );

            const assistantMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: "assistant",
                text: result.conversationalReply
                    ? (isRTL ? result.conversationalReply.textAr : result.conversationalReply.textEn)
                    : undefined,
                triageResult: isTextOnlyReply ? undefined : result,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err) {
            console.error("Triage error:", err);
            setMessages((prev) => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    sender: "assistant",
                    text: isRTL
                        ? "عذراً، حدث خطأ أثناء فحص الأعراض. يرجى المحاولة مرة أخرى أو اختيار التخصص مباشرة من صفحة الأطباء."
                        : "Sorry, an error occurred while assessing symptoms. Please try again or browse doctors directly.",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPills = isRTL
        ? [
            "عندي مغص في الجنب اليمين مع سخونية",
            "صداع نصفي حاد ودوخة مستمرة",
            "نغزة وألم ضاغط في الصدر",
            "سخونية عالية وترجيع مستمر",
            "طفح جلدي وحكة واحمرار",
            "ألم شديد في الركبة والمفاصل",
        ]
        : [
            "Right side abdominal pain with fever",
            "Severe migraine with dizziness",
            "Chest pressure and radiating pain",
            "High fever and continuous vomiting",
            "Skin rash with intense itching",
            "Severe joint and knee pain",
        ];

    return (
        <>
            {/* Floating Trigger Button */}
            <div
                className={`fixed bottom-6 ${isRTL ? "left-6" : "right-6"} z-50 flex items-center`}
                style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(true)}
                            className="group relative flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-medium hover:shadow-emerald-500/25 transition-all duration-300 border border-white/20"
                            aria-label="Open AI Medical Triage Assistant"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>

                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                                </svg>
                                <span className="text-sm font-semibold tracking-wide">
                                    {isRTL ? "اختار طبيبك بسهولة 🤖" : "Choose Your Doctor 🤖"}
                                </span>
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Chatbot Window Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className={`fixed bottom-3 sm:bottom-6 inset-x-2 sm:inset-x-auto ${isRTL ? "sm:left-6" : "sm:right-6"} z-50 w-auto sm:w-[460px] max-h-[88vh] h-[640px] sm:h-[680px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border backdrop-blur-xl ${isDark
                            ? "bg-slate-900/95 border-slate-700/60 text-white"
                            : "bg-white/95 border-gray-200 text-gray-900"
                            }`}
                        style={{ direction: isRTL ? "rtl" : "ltr" }}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                                    <svg className="w-6 h-6 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base tracking-wide">
                                            {isRTL ? "اختار طبيبك بسهولة" : "Choose Your Doctor"}
                                        </h3>
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400 text-slate-900 uppercase">
                                            {isRTL ? "ذكي 24/7" : "Live AI"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-emerald-100/80">
                                        {isRTL ? "لو محتار ومش عارف أي تخصص تحجز؟" : "Unsure which specialty to book?"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${msg.sender === "user"
                                        ? isRTL ? "items-start" : "items-end"
                                        : isRTL ? "items-end" : "items-start"
                                        }`}
                                >
                                    {/* Text Message Bubble */}
                                    {msg.text && (
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line shadow-sm ${msg.sender === "user"
                                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none"
                                                : isDark
                                                    ? "bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none"
                                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    )}

                                    {/* Structured Triage Response Block */}
                                    {msg.triageResult && (
                                        <div className="w-full mt-2 space-y-3">
                                            {/* Emergency Alert (Red Flag) */}
                                            {msg.triageResult.urgencyLevel === "emergency" && (
                                                <div className="rounded-2xl p-4 bg-red-500/10 border-2 border-red-500 text-red-700 dark:text-red-200 shadow-lg space-y-3 animate-pulse">
                                                    <div className="flex items-center gap-2 font-bold text-base text-red-600 dark:text-red-400">
                                                        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        <span>{isRTL ? msg.triageResult.titleAr : msg.triageResult.titleEn}</span>
                                                    </div>

                                                    <p className="text-xs leading-relaxed font-medium">
                                                        {isRTL ? msg.triageResult.summaryAr : msg.triageResult.summaryEn}
                                                    </p>

                                                    <div className="p-3 bg-red-600 text-white rounded-xl text-center space-y-2 shadow-md">
                                                        <p className="text-xs font-semibold">
                                                            {isRTL
                                                                ? msg.triageResult.adviceAr
                                                                : msg.triageResult.adviceEn}
                                                        </p>
                                                        <a
                                                            href={`tel:${msg.triageResult.emergencyAction?.ambulanceNumber || "123"}`}
                                                            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-red-700 font-extrabold rounded-lg shadow hover:bg-red-50 transition-colors text-sm"
                                                        >
                                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            <span>
                                                                {isRTL
                                                                    ? msg.triageResult.emergencyAction?.callTextAr
                                                                    : msg.triageResult.emergencyAction?.callTextEn}
                                                            </span>
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Urgent Care Recommendation */}
                                            {msg.triageResult.urgencyLevel === "urgent" && (
                                                <div className={`rounded-2xl p-4 border shadow-md space-y-3 ${isDark
                                                    ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                                                    : "bg-amber-50 border-amber-300 text-amber-900"
                                                    }`}>
                                                    <div className="flex items-center gap-2 font-bold text-base text-amber-600 dark:text-amber-400">
                                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        <span>{isRTL ? msg.triageResult.titleAr : msg.triageResult.titleEn}</span>
                                                    </div>

                                                    <p className="text-xs leading-relaxed">
                                                        {isRTL ? msg.triageResult.summaryAr : msg.triageResult.summaryEn}
                                                    </p>

                                                    <Link
                                                        href={`/${language}/dashboard/patient/urgent-care`}
                                                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all text-xs"
                                                    >
                                                        <span>
                                                            {isRTL
                                                                ? "⚡ الدخول لطابور الطوارئ الفوري الآن (كشف في دقائق)"
                                                                : "⚡ Enter Urgent Care Queue Now"}
                                                        </span>
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Routine / Specialty Recommendation */}
                                            {msg.triageResult.urgencyLevel === "routine" && (
                                                <div className={`rounded-2xl p-4 border shadow-sm space-y-3 ${isDark
                                                    ? "bg-slate-800/80 border-slate-700 text-slate-200"
                                                    : "bg-emerald-50/50 border-emerald-200 text-slate-800"
                                                    }`}>
                                                    <div className="flex items-center gap-2 font-bold text-base text-emerald-600 dark:text-emerald-400">
                                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{isRTL ? msg.triageResult.titleAr : msg.triageResult.titleEn}</span>
                                                    </div>

                                                    <p className="text-xs leading-relaxed">
                                                        {isRTL ? msg.triageResult.summaryAr : msg.triageResult.summaryEn}
                                                    </p>

                                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                                        {isRTL ? msg.triageResult.adviceAr : msg.triageResult.adviceEn}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Suggested Doctor Cards (When Available) */}
                                            {msg.triageResult.suggestedDoctors.length > 0 && (
                                                <div className="space-y-2 pt-1">
                                                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                                                        <span>
                                                            {isRTL ? "أفضل الأطباء المتاحين في التخصص:" : "Top Verified Specialists:"}
                                                        </span>
                                                        <Link
                                                            href={`/${language}/doctors?specialty=${encodeURIComponent(msg.triageResult.primarySpecialtyEn)}`}
                                                            className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px]"
                                                        >
                                                            {isRTL ? "عرض الكل ←" : "View All →"}
                                                        </Link>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {msg.triageResult.suggestedDoctors.map((doc: TriageDoctorSuggestion) => (
                                                            <div
                                                                key={doc.id}
                                                                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${isDark
                                                                    ? "bg-slate-800/90 border-slate-700 hover:border-emerald-500/50"
                                                                    : "bg-white border-gray-200 hover:border-emerald-400 shadow-sm"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                                                                        {doc.avatarUrl ? (
                                                                            <Image
                                                                                src={doc.avatarUrl}
                                                                                alt={doc.fullName}
                                                                                fill
                                                                                className="object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                                                                                {doc.fullName.charAt(0)}
                                                                            </div>
                                                                        )}
                                                                        {doc.isAvailableNow && (
                                                                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <h4 className="font-bold text-xs truncate">
                                                                            {doc.fullName}
                                                                        </h4>
                                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                                            {isRTL ? doc.specialtyAr : doc.specialty}
                                                                        </p>
                                                                        <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-medium">
                                                                            <span>★ {doc.ratingAverage.toFixed(1)}</span>
                                                                            <span className="text-slate-400">•</span>
                                                                            <span className="text-slate-500 dark:text-slate-400">{doc.consultationFee} EGP</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <Link
                                                                    href={
                                                                        user
                                                                            ? `/${language}/dashboard/patient/doctors?book=${doc.id}`
                                                                            : `/${language}/login?redirect=${encodeURIComponent(`/${language}/dashboard/patient/doctors?book=${doc.id}`)}`
                                                                    }
                                                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shrink-0 shadow-sm transition-colors"
                                                                >
                                                                    {isRTL ? "احجز" : "Book"}
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}


                                        </div>
                                    )}

                                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                                        {msg.timestamp}
                                    </span>
                                </div>
                            ))}

                            {/* Loading State Animation */}
                            {isLoading && (
                                <div className={`flex items-center gap-2 p-3 rounded-2xl max-w-[80%] ${isDark ? "bg-slate-800 text-slate-300" : "bg-gray-100 text-slate-600"
                                    }`}>
                                    <div className="flex space-x-1 space-x-reverse">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-xs">
                                        {isRTL ? "جارٍ تحليل الأعراض طبياً..." : "Analyzing clinical symptoms..."}
                                    </span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Prompts Pills (When few messages) */}
                        {messages.length <= 2 && (
                            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                                    {isRTL ? "أمثلة شائعة يمكنك تجربتها بضغطة:" : "Popular examples to test:"}
                                </p>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                    {quickPills.map((pill, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(pill)}
                                            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 text-[11px] whitespace-nowrap shrink-0 transition-colors shadow-xs"
                                        >
                                            {pill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Footer */}
                        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex items-center gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={
                                    isRTL
                                        ? "اكتب أعراضك هنا بالعامية..."
                                        : "Describe your symptoms..."
                                }
                                disabled={isLoading}
                                className={`flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDark
                                    ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-400"
                                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                                    }`}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputMessage.trim() || isLoading}
                                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center disabled:opacity-40 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shrink-0"
                                aria-label="Send"
                            >
                                <svg className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

