"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { GlowingCard } from "@/components/ui/glowing-card";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    Notification,
    NotificationType,
} from "@/app/actions/notifications";
import { getLocalizedNotificationText } from "@/lib/utils/notification-i18n";

// Icons for notification types
const NotificationIcons: Record<NotificationType, React.ReactNode> = {
    appointment_reminder: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    appointment_confirmation: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    appointment_cancelled: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    appointment_rescheduled: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    ),
    new_appointment: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    prescription: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    prescription_renewal: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
        </svg>
    ),
    message: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
    ),
    new_patient_message: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    doctor_verification: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    payment_success: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
    ),
    payment_failed: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
    ),
    system: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
    ),
};

// Get icon background color based on notification type - All using main amber color
const getIconBgColor = (type: NotificationType, isDark: boolean): string => {
    // Unified amber color for all notification types
    return isDark ? "bg-[#FD614B]/20 text-[#FD614B]" : "bg-[#FFE8E4] text-[#E84D37]";
};

// Format relative time
const formatTimeAgo = (dateString: string, isRTL: boolean): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return isRTL ? "الآن" : "Just now";
    }
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return isRTL ? `منذ ${minutes} دقيقة` : `${minutes} minutes ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return isRTL ? `منذ ${hours} ساعة` : `${hours} hours ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return isRTL ? `منذ ${days} يوم` : `${days} days ago`;
    }
    return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Filter type
type FilterType = "all" | "unread" | NotificationType;

interface NotificationsPageProps {
    isDark: boolean;
    dashboardType: "patient" | "doctor" | "admin";
}

export default function NotificationsPage({ isDark, dashboardType }: NotificationsPageProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("all");
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [markingAllRead, setMarkingAllRead] = useState(false);
    const { isRTL, language } = useI18n();
    const router = useRouter();
    const LIMIT = 20;

    // Fetch notifications
    const fetchNotifications = useCallback(async ({ reset = false, page: pageOverride = 0 }: { reset?: boolean; page?: number } = {}) => {
        setLoading(true);
        try {
            const offset = reset ? 0 : pageOverride * LIMIT;
            const result = await getNotifications({
                limit: LIMIT,
                offset,
                unreadOnly: filter === "unread",
                type: filter !== "all" && filter !== "unread" ? filter : undefined,
            });

            if (!result.error) {
                if (reset) {
                    setNotifications(result.notifications);
                } else {
                    setNotifications((prev) => [...prev, ...result.notifications]);
                }
                setHasMore(result.notifications.length === LIMIT);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    // Initial fetch and filter change
    useEffect(() => {
        setPage(0);
        fetchNotifications({ reset: true, page: 0 });
    }, [filter, fetchNotifications]);

    // Load more
    useEffect(() => {
        if (page > 0) {
            fetchNotifications({ page });
        }
    }, [page, fetchNotifications]);

    // Handle mark as read
    const handleMarkAsRead = async (notification: Notification) => {
        if (notification.is_read) return;

        await markAsRead(notification.id);
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notification.id ? { ...n, is_read: true } : n
            )
        );
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        setMarkingAllRead(true);
        const result = await markAllAsRead();
        if (result.success) {
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true }))
            );
        }
        setMarkingAllRead(false);
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const result = await deleteNotification(id);
        if (result.success) {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }
        setDeletingId(null);
    };

    // Navigate based on notification type
    const handleNotificationClick = async (notification: Notification) => {
        await handleMarkAsRead(notification);

        const data = notification.data as Record<string, string>;

        // Direct routing for urgent care queue notifications
        if (data?.queueEntryId || data?.action === "urgent_call") {
            if (dashboardType === "patient" && data?.queueEntryId) {
                router.push(`/${language}/dashboard/patient/urgent-care/waiting/${data.queueEntryId}`);
                return;
            } else if (dashboardType === "doctor") {
                router.push(`/${language}/dashboard/doctor/queue`);
                return;
            }
        }

        let href = `/${language}/dashboard/${dashboardType}`;

        switch (notification.notification_type) {
            case "appointment_confirmation":
            case "appointment_cancelled":
            case "appointment_reminder":
            case "appointment_rescheduled":
            case "new_appointment":
                href = `/${language}/dashboard/${dashboardType}/appointments`;
                if (data?.appointmentId) {
                    href += `?id=${data.appointmentId}`;
                }
                break;
            case "prescription":
            case "prescription_renewal":
                href = `/${language}/dashboard/${dashboardType}/prescriptions`;
                if (data?.prescriptionId) {
                    href += `?id=${data.prescriptionId}`;
                }
                break;
            case "message":
            case "new_patient_message":
                href = `/${language}/dashboard/${dashboardType}/messages`;
                if (data?.conversationId) {
                    href += `?id=${data.conversationId}`;
                }
                break;
            case "payment_success":
            case "payment_failed":
                href = `/${language}/dashboard/${dashboardType}/payments`;
                break;
            case "doctor_verification":
                href = `/${language}/dashboard/${dashboardType}/settings`;
                break;
        }

        window.location.href = href;
    };

    // Labels
    const labels = {
        title: isRTL ? "الإشعارات" : "Notifications",
        all: isRTL ? "الكل" : "All",
        unread: isRTL ? "غير مقروء" : "Unread",
        markAllRead: isRTL ? "تحديد الكل كمقروء" : "Mark all as read",
        loadMore: isRTL ? "تحميل المزيد" : "Load more",
        noNotifications: isRTL ? "لا توجد إشعارات" : "No notifications",
        noNotificationsDesc: isRTL
            ? "سيتم عرض إشعاراتك هنا عند وصولها"
            : "Your notifications will appear here when you receive them",
        delete: isRTL ? "حذف" : "Delete",
        filterByType: isRTL ? "تصفية حسب النوع" : "Filter by type",
    };

    const filterOptions: { value: FilterType; label: string }[] = [
        { value: "all", label: labels.all },
        { value: "unread", label: labels.unread },
        { value: "appointment_reminder", label: isRTL ? "تذكير بالموعد" : "Reminders" },
        { value: "appointment_confirmation", label: isRTL ? "تأكيد الموعد" : "Confirmations" },
        { value: "message", label: isRTL ? "الرسائل" : "Messages" },
        { value: "prescription", label: isRTL ? "الوصفات" : "Prescriptions" },
        { value: "payment_success", label: isRTL ? "المدفوعات" : "Payments" },
    ];

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className={cn(
                        "text-2xl md:text-3xl font-bold",
                        isDark ? "text-white" : "text-gray-900"
                    )}>
                        {labels.title}
                    </h1>
                    {unreadCount > 0 && (
                        <p className={cn(
                            "text-sm mt-1",
                            isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                            {isRTL
                                ? `${unreadCount} إشعار غير مقروء`
                                : `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                            }
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={markingAllRead}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                            isDark
                                ? "bg-[#FD614B]/20 text-[#FD614B] hover:bg-[#FD614B]/30 border border-[#FD614B]/40"
                                : "bg-[#FFF5F3] text-[#C43825] hover:bg-[#FFE8E4] border border-[#FFD0CA]",
                            markingAllRead && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {labels.markAllRead}
                    </button>
                )}
            </div>

            {/* Filters */}
            <GlowingCard className="p-4 mb-6" isDark={isDark}>
                <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                            filter === option.value
                                ? isDark
                                    ? "bg-[#FD614B] text-white shadow-lg shadow-amber-500/30"
                                    : "bg-[#FD614B] text-white shadow-lg shadow-amber-500/20"
                                : isDark
                                    ? "bg-[#0D2C4F]/50 text-gray-400 hover:bg-[#0D2C4F] hover:text-white border border-white/5"
                                    : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
                </div>
            </GlowingCard>

            {/* Notifications List */}
            <GlowingCard className="overflow-hidden" isDark={isDark}>
                {loading && notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className={cn(
                            "animate-spin w-8 h-8 border-2 rounded-full mx-auto mb-4",
                            isDark
                                ? "border-gray-600 border-t-amber-400"
                                : "border-gray-300 border-t-amber-600"
                        )} />
                        <p className={cn(
                            "text-sm",
                            isDark ? "text-gray-500" : "text-gray-400"
                        )}>
                            {isRTL ? "جاري التحميل..." : "Loading..."}
                        </p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                            isDark ? "bg-white/5" : "bg-gray-100"
                        )}>
                            <svg className={cn(
                                "w-8 h-8",
                                isDark ? "text-gray-600" : "text-gray-400"
                            )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                        </div>
                        <h3 className={cn(
                            "text-lg font-semibold mb-2",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            {labels.noNotifications}
                        </h3>
                        <p className={cn(
                            "text-sm",
                            isDark ? "text-gray-500" : "text-gray-500"
                        )}>
                            {labels.noNotificationsDesc}
                        </p>
                    </div>
                ) : (
                    <>
                        <AnimatePresence mode="popLayout">
                            {notifications.map((notification) => {
                                const localized = getLocalizedNotificationText(notification, isRTL);
                                return (
                                    <motion.div
                                    key={notification.id}
                                    layout
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
                                    className={cn(
                                        "flex items-start gap-4 p-4 md:p-5 border-b transition-all duration-200 cursor-pointer",
                                        isDark
                                            ? "border-white/5 hover:bg-white/5"
                                            : "border-gray-100 hover:bg-gray-50/80",
                                        !notification.is_read && (isDark ? "bg-[#FD614B]/10 border-[#FD614B]/15" : "bg-[#FFF5F3] border-[#FFD0CA]/50")
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    {/* Icon */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                        getIconBgColor(notification.notification_type, isDark)
                                    )}>
                                        {NotificationIcons[notification.notification_type]}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className={cn(
                                                    "font-medium",
                                                    isDark ? "text-white" : "text-gray-900",
                                                    !notification.is_read && "font-semibold"
                                                )}>
                                                    {localized.title}
                                                </p>
                                                <p className={cn(
                                                    "text-sm mt-1",
                                                    isDark ? "text-gray-400" : "text-gray-600"
                                                )}>
                                                    {localized.body}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#FD614B] flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <p className={cn(
                                                "text-xs",
                                                isDark ? "text-gray-500" : "text-gray-400"
                                            )}>
                                                {formatTimeAgo(notification.created_at, isRTL)}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification.id);
                                                }}
                                                disabled={deletingId === notification.id}
                                                className={cn(
                                                    "p-1.5 rounded-xl text-xs transition-all duration-200",
                                                    isDark
                                                        ? "text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                                                        : "text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200",
                                                    deletingId === notification.id && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                            })}
                        </AnimatePresence>

                        {/* Load More */}
                        {hasMore && (
                            <div className="p-4 text-center">
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={loading}
                                    className={cn(
                                        "px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border",
                                        isDark
                                            ? "bg-[#0D2C4F]/50 text-gray-400 hover:bg-[#0D2C4F] hover:text-white border-white/10"
                                            : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-200",
                                        loading && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? (isRTL ? "جاري التحميل..." : "Loading...") : labels.loadMore}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </GlowingCard>
        </div>
    );
}
