"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { useRealtimeNotifications } from "@/lib/useRealtimeNotifications";
import { type Notification, type NotificationType } from "@/app/actions/notifications";

// Icons for notification types
const NotificationIcons: Record<NotificationType, React.ReactNode> = {
    appointment_reminder: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    appointment_confirmation: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    appointment_cancelled: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    appointment_rescheduled: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
    ),
    new_appointment: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
        </svg>
    ),
    prescription: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    prescription_renewal: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
        </svg>
    ),
    message: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
    ),
    new_patient_message: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
    ),
    doctor_verification: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    payment_success: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
    ),
    payment_failed: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
    ),
    system: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
    ),
};

// Get icon background color based on notification type - All using main teal color
const getIconBgColor = (type: NotificationType, isDark: boolean): string => {
    // Unified teal color for all notification types
    return isDark ? "bg-teal-500/20 text-teal-400" : "bg-teal-100 text-teal-600";
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
        return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
    }
    return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
    });
};

// Bell icon
const BellIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

interface NotificationDropdownProps {
    isDark: boolean;
    dashboardType: "patient" | "doctor" | "admin";
}

export default function NotificationDropdown({ isDark, dashboardType }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { isRTL, language } = useI18n();
    const router = useRouter();

    // Use realtime notifications hook for live updates
    const {
        notifications,
        unreadCount,
        isConnected,
        markAsRead: markNotificationAsRead,
        markAllAsRead: markAllNotificationsAsRead,
        refresh,
    } = useRealtimeNotifications({
        enabled: true,
        onNewNotification: (notification) => {
            // Show browser notification for new notifications if permission granted
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification(notification.title, {
                    body: notification.body,
                    icon: "/icon.png",
                });
            }
        },
    });

    // Loading state is false once connected or we have notifications
    const isLoading = !isConnected && notifications.length === 0;

    // Refresh on open (fallback for any missed updates)
    useEffect(() => {
        if (isOpen) {
            refresh();
        }
    }, [isOpen, refresh]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Handle notification click
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markNotificationAsRead(notification.id);
        }

        // Navigate based on notification type
        const data = notification.data as Record<string, string>;
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

        setIsOpen(false);
        router.push(href);
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        setIsMarkingAll(true);
        await markAllNotificationsAsRead();
        setIsMarkingAll(false);
    };

    const notificationsLabel = isRTL ? "الإشعارات" : "Notifications";
    const markAllReadLabel = isRTL ? "تحديد الكل كمقروء" : "Mark all as read";
    const viewAllLabel = isRTL ? "عرض الكل" : "View all";
    const noNotificationsLabel = isRTL ? "لا توجد إشعارات" : "No notifications";
    const loadingLabel = isRTL ? "جاري التحميل..." : "Loading...";

    return (
        <div ref={dropdownRef} className="relative z-[100]">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-1.5 md:p-2 rounded-xl transition-colors border border-black",
                    isDark
                        ? "hover:bg-white/5 text-gray-400 hover:text-white"
                        : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                )}
                aria-label={notificationsLabel}
            >
                {BellIcon}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-teal-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-teal-500/50">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute top-full mt-2 w-80 md:w-96 rounded-2xl shadow-2xl overflow-hidden z-[100] border backdrop-blur-xl",
                            isRTL ? "left-0" : "right-0",
                            isDark
                                ? "bg-slate-900/95 border-white/10"
                                : "bg-white/95 border-gray-200"
                        )}
                    >
                        {/* Header */}
                        <div
                            className={cn(
                                "px-4 py-3 flex items-center justify-between border-b",
                                isDark ? "border-white/10" : "border-gray-200"
                            )}
                        >
                            <h3
                                className={cn(
                                    "font-semibold",
                                    isDark ? "text-white" : "text-gray-900"
                                )}
                            >
                                {notificationsLabel}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={isMarkingAll}
                                    className={cn(
                                        "text-xs font-medium transition-colors",
                                        isDark
                                            ? "text-teal-400 hover:text-teal-300"
                                            : "text-teal-600 hover:text-teal-700",
                                        isMarkingAll && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {markAllReadLabel}
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-8 text-center">
                                    <div
                                        className={cn(
                                            "animate-spin w-6 h-6 border-2 rounded-full mx-auto",
                                            isDark
                                                ? "border-gray-600 border-t-teal-400"
                                                : "border-gray-300 border-t-teal-600"
                                        )}
                                    />
                                    <p
                                        className={cn(
                                            "mt-2 text-sm",
                                            isDark ? "text-gray-500" : "text-gray-400"
                                        )}
                                    >
                                        {loadingLabel}
                                    </p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
                                            isDark ? "bg-white/5" : "bg-gray-100"
                                        )}
                                    >
                                        {BellIcon}
                                    </div>
                                    <p
                                        className={cn(
                                            "text-sm",
                                            isDark ? "text-gray-500" : "text-gray-400"
                                        )}
                                    >
                                        {noNotificationsLabel}
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "w-full px-4 py-3 flex items-start gap-3 text-left transition-colors",
                                            isDark
                                                ? "hover:bg-white/5"
                                                : "hover:bg-gray-50",
                                            !notification.is_read &&
                                                (isDark
                                                    ? "bg-teal-500/5"
                                                    : "bg-teal-50/50")
                                        )}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                                getIconBgColor(
                                                    notification.notification_type,
                                                    isDark
                                                )
                                            )}
                                        >
                                            {NotificationIcons[notification.notification_type]}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={cn(
                                                    "text-sm font-medium truncate",
                                                    isDark ? "text-white" : "text-gray-900",
                                                    !notification.is_read && "font-semibold"
                                                )}
                                            >
                                                {notification.title}
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-xs mt-0.5 line-clamp-2",
                                                    isDark ? "text-gray-400" : "text-gray-600"
                                                )}
                                            >
                                                {notification.body}
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-xs mt-1",
                                                    isDark ? "text-gray-500" : "text-gray-400"
                                                )}
                                            >
                                                {formatTimeAgo(notification.created_at, isRTL)}
                                            </p>
                                        </div>

                                        {/* Unread indicator */}
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div
                                className={cn(
                                    "px-4 py-3 border-t",
                                    isDark ? "border-white/10" : "border-gray-200"
                                )}
                            >
                                <Link
                                    href={`/${language}/dashboard/${dashboardType}/notifications`}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "block text-center text-sm font-medium transition-colors",
                                        isDark
                                            ? "text-teal-400 hover:text-teal-300"
                                            : "text-teal-600 hover:text-teal-700"
                                    )}
                                >
                                    {viewAllLabel}
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
