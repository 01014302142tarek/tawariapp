"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

interface TranslationStrings {
    // Navigation
    nav: {
        howItWorks: string;
        specialties: string;
        doctors: string;
        forDoctors: string;
        login: string;
        getStarted: string;
    };
    // Hero
    hero: {
        badge: string;
        headline: string;
        headlineHighlight: string;
        subheadline: string;
        cta: string;
        ctaSecondary: string;
        trust1: string;
        trust2: string;
        trust3: string;
    };
    // Stats
    stats: {
        doctors: string;
        patients: string;
        consultations: string;
        rating: string;
    };
    // How It Works
    howItWorks: {
        badge: string;
        title: string;
        titleHighlight: string;
        subtitle: string;
        step1Title: string;
        step1Desc: string;
        step2Title: string;
        step2Desc: string;
        step3Title: string;
        step3Desc: string;
    };
    // Specialties
    specialties: {
        badge: string;
        title: string;
        viewAll: string;
        general: string;
        pediatrics: string;
        obgyn: string;
        internal: string;
        dermatology: string;
        mental: string;
        cardiology: string;
        orthopedics: string;
    };
    // Doctors
    doctorsSection: {
        badge: string;
        title: string;
        viewAll: string;
        available: string;
        experience: string;
        session: string;
        bookNow: string;
    };
    // Why Us
    whyUs: {
        badge: string;
        title: string;
        titleHighlight: string;
        item1Title: string;
        item1Desc: string;
        item2Title: string;
        item2Desc: string;
        item3Title: string;
        item3Desc: string;
        item4Title: string;
        item4Desc: string;
    };
    // Testimonials
    testimonials: {
        badge: string;
        title: string;
    };
    // For Doctors
    forDoctors: {
        badge: string;
        title: string;
        titleHighlight: string;
        subtitle: string;
        benefit1: string;
        benefit2: string;
        benefit3: string;
        benefit4: string;
        benefit5: string;
        cta: string;
        stat1: string;
        stat1Sub: string;
        stat2: string;
        stat2Sub: string;
        stat3: string;
        stat3Sub: string;
        stat4: string;
        stat4Sub: string;
    };
    // CTA
    cta: {
        title: string;
        subtitle: string;
        button: string;
        note: string;
    };
    // Footer
    footer: {
        tagline: string;
        forPatients: string;
        findDoctors: string;
        howItWorks: string;
        faq: string;
        forDoctorsTitle: string;
        joinAsDoctor: string;
        doctorFaq: string;
        pricing: string;
        company: string;
        aboutUs: string;
        contact: string;
        privacy: string;
        terms: string;
        paymentMethods: string;
        copyright: string;
    };
    // Common Dashboard Elements
    common: {
        today: string;
        viewAll: string;
        search: string;
        filter: string;
        save: string;
        cancel: string;
        edit: string;
        delete: string;
        add: string;
        loading: string;
        noData: string;
        online: string;
        offline: string;
        settings: string;
        logout: string;
        profile: string;
        notifications: string;
        messages: string;
        darkMode: string;
        lightMode: string;
    };
    // Doctor Dashboard
    doctorDashboard: {
        // Sidebar
        sidebar: {
            dashboard: string;
            appointments: string;
            patients: string;
            schedule: string;
            messages: string;
            analytics: string;
            settings: string;
        };
        // Greeting
        greeting: {
            morning: string;
            afternoon: string;
            evening: string;
            subtitle: string;
        };
        // Stats
        stats: {
            todayAppointments: string;
            completed: string;
            revenueToday: string;
            rating: string;
        };
        // Sections
        sections: {
            todayAppointments: string;
            scheduled: string;
            weeklyPerformance: string;
            pendingTasks: string;
            items: string;
            recentMessages: string;
            patientConversations: string;
            unread: string;
            openMessages: string;
            healthTips: string;
            dailyRecommendations: string;
            new: string;
            quickActions: string;
            manageYourPractice: string;
        };
        // Appointment Status
        status: {
            inProgress: string;
            completed: string;
            upcoming: string;
            done: string;
        };
        // Quick Actions
        actions: {
            startVideoCall: string;
            connectWithPatient: string;
            viewSchedule: string;
            manageAppointments: string;
            patientRecords: string;
            accessRecords: string;
            messagesAction: string;
            chatWithPatients: string;
        };
        // Performance
        performance: {
            consultations: string;
            patientSatisfaction: string;
            responseRate: string;
            youreOnline: string;
            availableForConsultations: string;
        };
        // Tasks
        tasks: {
            reviewLabResults: string;
            prescriptionRenewal: string;
            followUpReport: string;
            ecgAnalysis: string;
            today: string;
            tomorrow: string;
            inDays: string;
        };
        // Health Tips
        tips: {
            heartHealth: string;
            heartHealthTip: string;
            sleepQuality: string;
            sleepQualityTip: string;
            hydration: string;
            hydrationTip: string;
            cardiology: string;
            wellness: string;
            general: string;
        };
    };
    // Patient Dashboard
    patientDashboard: {
        sidebar: {
            dashboard: string;
            appointments: string;
            prescriptions: string;
            records: string;
            messages: string;
            settings: string;
        };
        greeting: {
            welcome: string;
            subtitle: string;
        };
        stats: {
            upcomingAppointments: string;
            activePrescriptions: string;
            medicalRecords: string;
            unreadMessages: string;
        };
        sections: {
            nextAppointment: string;
            recentPrescriptions: string;
            quickActions: string;
        };
        actions: {
            bookAppointment: string;
            viewPrescriptions: string;
            medicalRecords: string;
            messageDoctor: string;
        };
    };
    // Admin Dashboard
    adminDashboard: {
        sidebar: {
            dashboard: string;
            users: string;
            doctors: string;
            patients: string;
            analytics: string;
            settings: string;
        };
        greeting: {
            welcome: string;
            subtitle: string;
        };
        stats: {
            totalUsers: string;
            totalDoctors: string;
            totalPatients: string;
            totalRevenue: string;
            activeConsultations: string;
            pendingApprovals: string;
        };
        sections: {
            recentActivity: string;
            systemOverview: string;
            quickActions: string;
            topPerformingDoctors: string;
            revenueOverview: string;
            trafficSources: string;
        };
        actions: {
            addUser: string;
            addDoctor: string;
            addPatient: string;
            viewReports: string;
            systemSettings: string;
        };
    };
}

const translations: Record<Language, TranslationStrings> = {
    en: {
        nav: {
            howItWorks: "How It Works",
            specialties: "Specialties",
            doctors: "Doctors",
            forDoctors: "For Doctors",
            login: "Login",
            getStarted: "Get Started Free",
        },
        hero: {
            badge: "Doctors Available 24/7",
            headline: "Quality Healthcare,",
            headlineHighlight: "Right From Home",
            subheadline: "Connect with Egypt's top licensed doctors for video consultations. Get prescriptions, medical advice, and care without leaving your home.",
            cta: "Book a Consultation",
            ctaSecondary: "See How It Works",
            trust1: "Licensed Doctors",
            trust2: "Secure Video Calls",
            trust3: "Digital Prescriptions",
        },
        stats: {
            doctors: "Verified Doctors",
            patients: "Happy Patients",
            consultations: "Consultations",
            rating: "Average Rating",
        },
        howItWorks: {
            badge: "Simple Process",
            title: "Get Care in",
            titleHighlight: "3 Simple Steps",
            subtitle: "No waiting rooms, no traffic, no hassle. Get the medical care you need from anywhere in Egypt.",
            step1Title: "Choose Your Doctor",
            step1Desc: "Browse our verified doctors by specialty, ratings, and availability. Find the perfect match for your needs.",
            step2Title: "Book & Pay Securely",
            step2Desc: "Select a convenient time slot and pay securely with cards, Vodafone Cash, or mobile wallets.",
            step3Title: "Start Your Consultation",
            step3Desc: "Join the video call at your scheduled time. Get diagnosis, advice, and prescriptions instantly.",
        },
        specialties: {
            badge: "Medical Specialties",
            title: "Find the Right Specialist",
            viewAll: "View All Specialties",
            general: "General Practice",
            pediatrics: "Pediatrics",
            obgyn: "OB/GYN",
            internal: "Internal Medicine",
            dermatology: "Dermatology",
            mental: "Mental Health",
            cardiology: "Cardiology",
            orthopedics: "Orthopedics",
        },
        doctorsSection: {
            badge: "Top Rated",
            title: "Meet Our Best Doctors",
            viewAll: "View All Doctors",
            available: "Available",
            experience: "experience",
            session: "/ session",
            bookNow: "Book Now",
        },
        whyUs: {
            badge: "Why Choose Us",
            title: "Healthcare Made",
            titleHighlight: "Simple & Safe",
            item1Title: "Verified Doctors",
            item1Desc: "All doctors are licensed by the Egyptian Medical Syndicate and verified by our team.",
            item2Title: "Digital Prescriptions",
            item2Desc: "Get valid prescriptions sent directly to your phone, ready to use at any pharmacy.",
            item3Title: "Secure Payments",
            item3Desc: "Pay with Visa, Mastercard, Vodafone Cash, or any mobile wallet. 100% secure.",
            item4Title: "Anywhere in Egypt",
            item4Desc: "Access quality healthcare from Cairo, Alexandria, or any governorate. No travel needed.",
        },
        testimonials: {
            badge: "Testimonials",
            title: "What Our Patients Say",
        },
        forDoctors: {
            badge: "For Doctors",
            title: "Grow Your Practice",
            titleHighlight: "Online",
            subtitle: "Join TawariApp and reach thousands of patients across Egypt. Set your own schedule, fees, and work from anywhere.",
            benefit1: "Reach patients across all of Egypt",
            benefit2: "Set your own availability and consultation fees",
            benefit3: "Secure, compliant video consultations",
            benefit4: "Digital prescriptions with your signature",
            benefit5: "Weekly payouts directly to your account",
            cta: "Register as a Doctor",
            stat1: "Verified Doctors",
            stat1Sub: "and growing",
            stat2: "Consultations",
            stat2Sub: "delivered",
            stat3: "Average Rating",
            stat3Sub: "from patients",
            stat4: "Monthly Earnings",
            stat4Sub: "top performers",
        },
        cta: {
            title: "Ready to Take Control of Your Health?",
            subtitle: "Join thousands of Egyptians who trust TawariApp for convenient, quality healthcare.",
            button: "Get Started — It's Free",
            note: "No credit card required • Book your first consultation today",
        },
        footer: {
            tagline: "Premium healthcare at your fingertips. Consult with Egypt's best doctors from anywhere, anytime.",
            forPatients: "For Patients",
            findDoctors: "Find Doctors",
            howItWorks: "How It Works",
            faq: "FAQ",
            forDoctorsTitle: "For Doctors",
            joinAsDoctor: "Join as Doctor",
            doctorFaq: "Doctor FAQ",
            pricing: "Pricing",
            company: "Company",
            aboutUs: "About Us",
            contact: "Contact",
            privacy: "Privacy Policy",
            terms: "Terms of Service",
            paymentMethods: "Payment Methods:",
            copyright: "© 2025 TawariApp. All rights reserved. Made with care in Egypt.",
        },
        common: {
            today: "Today",
            viewAll: "View All",
            search: "Search",
            filter: "Filter",
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            add: "Add",
            loading: "Loading...",
            noData: "No data available",
            online: "Online",
            offline: "Offline",
            settings: "Settings",
            logout: "Logout",
            profile: "Profile",
            notifications: "Notifications",
            messages: "Messages",
            darkMode: "Dark Mode",
            lightMode: "Light Mode",
        },
        doctorDashboard: {
            sidebar: {
                dashboard: "Dashboard",
                appointments: "Appointments",
                patients: "Patients",
                schedule: "Schedule",
                messages: "Messages",
                analytics: "Analytics",
                settings: "Settings",
            },
            greeting: {
                morning: "Good Morning",
                afternoon: "Good Afternoon",
                evening: "Good Evening",
                subtitle: "Here's what's happening with your patients today.",
            },
            stats: {
                todayAppointments: "Today's Appointments",
                completed: "Completed",
                revenueToday: "Revenue Today",
                rating: "Rating",
            },
            sections: {
                todayAppointments: "Today's Appointments",
                scheduled: "scheduled",
                weeklyPerformance: "Weekly Performance",
                pendingTasks: "Pending Tasks",
                items: "items",
                recentMessages: "Recent Messages",
                patientConversations: "Patient conversations",
                unread: "unread",
                openMessages: "Open Messages",
                healthTips: "Health Tips to Share",
                dailyRecommendations: "Daily recommendations",
                new: "New",
                quickActions: "Quick Actions",
                manageYourPractice: "Manage your practice",
            },
            status: {
                inProgress: "In Progress",
                completed: "Completed",
                upcoming: "Upcoming",
                done: "Done",
            },
            actions: {
                startVideoCall: "Start Video Call",
                connectWithPatient: "Connect with your next patient via HD video",
                viewSchedule: "View Schedule",
                manageAppointments: "Manage appointments and availability",
                patientRecords: "Patient Records",
                accessRecords: "Access medical records securely",
                messagesAction: "Messages",
                chatWithPatients: "Chat with patients in real-time",
            },
            performance: {
                consultations: "Consultations",
                patientSatisfaction: "Patient Satisfaction",
                responseRate: "Response Rate",
                youreOnline: "You're Online",
                availableForConsultations: "Available for consultations",
            },
            tasks: {
                reviewLabResults: "Review Lab Results",
                prescriptionRenewal: "Prescription Renewal",
                followUpReport: "Follow-up Report",
                ecgAnalysis: "ECG Analysis",
                today: "Today",
                tomorrow: "Tomorrow",
                inDays: "In 2 days",
            },
            tips: {
                heartHealth: "Heart Health",
                heartHealthTip: "Recommend 30 minutes of daily walking to improve cardiovascular health.",
                sleepQuality: "Sleep Quality",
                sleepQualityTip: "Suggest avoiding screens 1 hour before bedtime for better sleep.",
                hydration: "Hydration",
                hydrationTip: "Remind patients to drink 8 glasses of water daily.",
                cardiology: "Cardiology",
                wellness: "Wellness",
                general: "General",
            },
        },
        patientDashboard: {
            sidebar: {
                dashboard: "Dashboard",
                appointments: "Appointments",
                prescriptions: "Prescriptions",
                records: "Medical Records",
                messages: "Messages",
                settings: "Settings",
            },
            greeting: {
                welcome: "Welcome back",
                subtitle: "Here's your health overview",
            },
            stats: {
                upcomingAppointments: "Upcoming Appointments",
                activePrescriptions: "Active Prescriptions",
                medicalRecords: "Medical Records",
                unreadMessages: "Unread Messages",
            },
            sections: {
                nextAppointment: "Next Appointment",
                recentPrescriptions: "Recent Prescriptions",
                quickActions: "Quick Actions",
            },
            actions: {
                bookAppointment: "Book Appointment",
                viewPrescriptions: "View Prescriptions",
                medicalRecords: "Medical Records",
                messageDoctor: "Message Doctor",
            },
        },
        adminDashboard: {
            sidebar: {
                dashboard: "Dashboard",
                users: "Users",
                doctors: "Doctors",
                patients: "Patients",
                analytics: "Analytics",
                settings: "Settings",
            },
            greeting: {
                welcome: "Welcome, Admin",
                subtitle: "Platform overview and management",
            },
            stats: {
                totalUsers: "Total Users",
                totalDoctors: "Total Doctors",
                totalPatients: "Total Patients",
                totalRevenue: "Total Revenue",
                activeConsultations: "Active Consultations",
                pendingApprovals: "Pending Approvals",
            },
            sections: {
                recentActivity: "Recent Activity",
                systemOverview: "System Overview",
                quickActions: "Quick Actions",
                topPerformingDoctors: "Top Performing Doctors",
                revenueOverview: "Revenue Overview",
                trafficSources: "Traffic Sources",
            },
            actions: {
                addUser: "Add User",
                addDoctor: "Add Doctor",
                addPatient: "Add Patient",
                viewReports: "View Reports",
                systemSettings: "System Settings",
            },
        },
    },
    ar: {
        nav: {
            howItWorks: "كيف يعمل",
            specialties: "التخصصات",
            doctors: "الأطباء",
            forDoctors: "للأطباء",
            login: "تسجيل الدخول",
            getStarted: "ابدأ مجاناً",
        },
        hero: {
            badge: "أطباء متاحون على مدار الساعة",
            headline: "رعاية صحية عالية الجودة،",
            headlineHighlight: "من منزلك مباشرة",
            subheadline: "تواصل مع أفضل الأطباء المرخصين في مصر عبر استشارات الفيديو. احصل على الوصفات الطبية والنصائح والرعاية دون مغادرة منزلك.",
            cta: "احجز استشارة",
            ctaSecondary: "شاهد كيف يعمل",
            trust1: "أطباء مرخصون",
            trust2: "مكالمات فيديو آمنة",
            trust3: "وصفات طبية رقمية",
        },
        stats: {
            doctors: "طبيب معتمد",
            patients: "مريض سعيد",
            consultations: "استشارة",
            rating: "متوسط التقييم",
        },
        howItWorks: {
            badge: "عملية بسيطة",
            title: "احصل على الرعاية في",
            titleHighlight: "٣ خطوات بسيطة",
            subtitle: "بدون غرف انتظار، بدون زحام، بدون متاعب. احصل على الرعاية الطبية التي تحتاجها من أي مكان في مصر.",
            step1Title: "اختر طبيبك",
            step1Desc: "تصفح أطبائنا المعتمدين حسب التخصص والتقييمات والتوافر. اعثر على الطبيب المناسب لاحتياجاتك.",
            step2Title: "احجز وادفع بأمان",
            step2Desc: "اختر موعداً مناسباً وادفع بأمان بالبطاقات أو فودافون كاش أو المحافظ الإلكترونية.",
            step3Title: "ابدأ استشارتك",
            step3Desc: "انضم إلى مكالمة الفيديو في موعدك المحدد. احصل على التشخيص والنصائح والوصفات فوراً.",
        },
        specialties: {
            badge: "التخصصات الطبية",
            title: "اعثر على المتخصص المناسب",
            viewAll: "عرض جميع التخصصات",
            general: "طب عام",
            pediatrics: "طب أطفال",
            obgyn: "نساء وتوليد",
            internal: "باطنة",
            dermatology: "جلدية",
            mental: "صحة نفسية",
            cardiology: "قلب",
            orthopedics: "عظام",
        },
        doctorsSection: {
            badge: "الأعلى تقييماً",
            title: "تعرف على أفضل أطبائنا",
            viewAll: "عرض جميع الأطباء",
            available: "متاح",
            experience: "خبرة",
            session: "/ جلسة",
            bookNow: "احجز الآن",
        },
        whyUs: {
            badge: "لماذا تختارنا",
            title: "رعاية صحية",
            titleHighlight: "بسيطة وآمنة",
            item1Title: "أطباء معتمدون",
            item1Desc: "جميع الأطباء مرخصون من نقابة الأطباء المصرية ومعتمدون من فريقنا.",
            item2Title: "وصفات طبية رقمية",
            item2Desc: "احصل على وصفات طبية صالحة مباشرة على هاتفك، جاهزة للاستخدام في أي صيدلية.",
            item3Title: "مدفوعات آمنة",
            item3Desc: "ادفع بفيزا أو ماستركارد أو فودافون كاش أو أي محفظة إلكترونية. آمن ١٠٠٪.",
            item4Title: "في أي مكان في مصر",
            item4Desc: "احصل على رعاية صحية عالية الجودة من القاهرة أو الإسكندرية أو أي محافظة.",
        },
        testimonials: {
            badge: "آراء المرضى",
            title: "ماذا يقول مرضانا",
        },
        forDoctors: {
            badge: "للأطباء",
            title: "نمِّ ممارستك الطبية",
            titleHighlight: "عبر الإنترنت",
            subtitle: "انضم إلى تواري وتواصل مع آلاف المرضى في جميع أنحاء مصر. حدد جدولك ورسومك واعمل من أي مكان.",
            benefit1: "تواصل مع مرضى من جميع أنحاء مصر",
            benefit2: "حدد أوقات توافرك ورسوم الاستشارة",
            benefit3: "استشارات فيديو آمنة ومتوافقة",
            benefit4: "وصفات طبية رقمية بتوقيعك",
            benefit5: "تحويلات أسبوعية مباشرة لحسابك",
            cta: "سجل كطبيب",
            stat1: "طبيب معتمد",
            stat1Sub: "والعدد في ازدياد",
            stat2: "استشارة",
            stat2Sub: "تم تقديمها",
            stat3: "متوسط التقييم",
            stat3Sub: "من المرضى",
            stat4: "أرباح شهرية",
            stat4Sub: "لأفضل الأطباء",
        },
        cta: {
            title: "مستعد للسيطرة على صحتك؟",
            subtitle: "انضم لآلاف المصريين الذين يثقون في تواري للرعاية الصحية المريحة والعالية الجودة.",
            button: "ابدأ مجاناً",
            note: "لا يلزم بطاقة ائتمان • احجز أول استشارة لك اليوم",
        },
        footer: {
            tagline: "رعاية صحية متميزة في متناول يدك. استشر أفضل أطباء مصر من أي مكان وفي أي وقت.",
            forPatients: "للمرضى",
            findDoctors: "ابحث عن طبيب",
            howItWorks: "كيف يعمل",
            faq: "الأسئلة الشائعة",
            forDoctorsTitle: "للأطباء",
            joinAsDoctor: "انضم كطبيب",
            doctorFaq: "أسئلة الأطباء",
            pricing: "الأسعار",
            company: "الشركة",
            aboutUs: "من نحن",
            contact: "تواصل معنا",
            privacy: "سياسة الخصوصية",
            terms: "شروط الخدمة",
            paymentMethods: "طرق الدفع:",
            copyright: "© ٢٠٢٥ تواري. جميع الحقوق محفوظة. صنع بعناية في مصر.",
        },
        common: {
            today: "اليوم",
            viewAll: "عرض الكل",
            search: "بحث",
            filter: "تصفية",
            save: "حفظ",
            cancel: "إلغاء",
            edit: "تعديل",
            delete: "حذف",
            add: "إضافة",
            loading: "جاري التحميل...",
            noData: "لا توجد بيانات",
            online: "متصل",
            offline: "غير متصل",
            settings: "الإعدادات",
            logout: "تسجيل الخروج",
            profile: "الملف الشخصي",
            notifications: "الإشعارات",
            messages: "الرسائل",
            darkMode: "الوضع الداكن",
            lightMode: "الوضع الفاتح",
        },
        doctorDashboard: {
            sidebar: {
                dashboard: "لوحة التحكم",
                appointments: "المواعيد",
                patients: "المرضى",
                schedule: "الجدول",
                messages: "الرسائل",
                analytics: "التحليلات",
                settings: "الإعدادات",
            },
            greeting: {
                morning: "صباح الخير",
                afternoon: "مساء الخير",
                evening: "مساء الخير",
                subtitle: "إليك ما يحدث مع مرضاك اليوم.",
            },
            stats: {
                todayAppointments: "مواعيد اليوم",
                completed: "مكتملة",
                revenueToday: "إيرادات اليوم",
                rating: "التقييم",
            },
            sections: {
                todayAppointments: "مواعيد اليوم",
                scheduled: "مجدولة",
                weeklyPerformance: "الأداء الأسبوعي",
                pendingTasks: "المهام المعلقة",
                items: "عناصر",
                recentMessages: "الرسائل الأخيرة",
                patientConversations: "محادثات المرضى",
                unread: "غير مقروءة",
                openMessages: "فتح الرسائل",
                healthTips: "نصائح صحية للمشاركة",
                dailyRecommendations: "توصيات يومية",
                new: "جديد",
                quickActions: "إجراءات سريعة",
                manageYourPractice: "إدارة ممارستك",
            },
            status: {
                inProgress: "قيد التنفيذ",
                completed: "مكتمل",
                upcoming: "قادم",
                done: "تم",
            },
            actions: {
                startVideoCall: "بدء مكالمة فيديو",
                connectWithPatient: "تواصل مع مريضك التالي عبر فيديو عالي الدقة",
                viewSchedule: "عرض الجدول",
                manageAppointments: "إدارة المواعيد والتوافر",
                patientRecords: "سجلات المرضى",
                accessRecords: "الوصول للسجلات الطبية بأمان",
                messagesAction: "الرسائل",
                chatWithPatients: "الدردشة مع المرضى في الوقت الفعلي",
            },
            performance: {
                consultations: "الاستشارات",
                patientSatisfaction: "رضا المرضى",
                responseRate: "معدل الاستجابة",
                youreOnline: "أنت متصل",
                availableForConsultations: "متاح للاستشارات",
            },
            tasks: {
                reviewLabResults: "مراجعة نتائج المختبر",
                prescriptionRenewal: "تجديد الوصفة",
                followUpReport: "تقرير المتابعة",
                ecgAnalysis: "تحليل تخطيط القلب",
                today: "اليوم",
                tomorrow: "غداً",
                inDays: "خلال يومين",
            },
            tips: {
                heartHealth: "صحة القلب",
                heartHealthTip: "أوصِ بـ 30 دقيقة من المشي اليومي لتحسين صحة القلب والأوعية الدموية.",
                sleepQuality: "جودة النوم",
                sleepQualityTip: "اقترح تجنب الشاشات قبل ساعة من النوم للحصول على نوم أفضل.",
                hydration: "الترطيب",
                hydrationTip: "ذكّر المرضى بشرب 8 أكواب من الماء يومياً.",
                cardiology: "قلب",
                wellness: "صحة",
                general: "عام",
            },
        },
        patientDashboard: {
            sidebar: {
                dashboard: "لوحة التحكم",
                appointments: "المواعيد",
                prescriptions: "الوصفات الطبية",
                records: "السجلات الطبية",
                messages: "الرسائل",
                settings: "الإعدادات",
            },
            greeting: {
                welcome: "مرحباً بعودتك",
                subtitle: "إليك نظرة عامة على صحتك",
            },
            stats: {
                upcomingAppointments: "المواعيد القادمة",
                activePrescriptions: "الوصفات النشطة",
                medicalRecords: "السجلات الطبية",
                unreadMessages: "رسائل غير مقروءة",
            },
            sections: {
                nextAppointment: "الموعد التالي",
                recentPrescriptions: "الوصفات الأخيرة",
                quickActions: "إجراءات سريعة",
            },
            actions: {
                bookAppointment: "حجز موعد",
                viewPrescriptions: "عرض الوصفات",
                medicalRecords: "السجلات الطبية",
                messageDoctor: "مراسلة الطبيب",
            },
        },
        adminDashboard: {
            sidebar: {
                dashboard: "لوحة التحكم",
                users: "المستخدمون",
                doctors: "الأطباء",
                patients: "المرضى",
                analytics: "التحليلات",
                settings: "الإعدادات",
            },
            greeting: {
                welcome: "مرحباً، المسؤول",
                subtitle: "نظرة عامة على المنصة وإدارتها",
            },
            stats: {
                totalUsers: "إجمالي المستخدمين",
                totalDoctors: "إجمالي الأطباء",
                totalPatients: "إجمالي المرضى",
                totalRevenue: "إجمالي الإيرادات",
                activeConsultations: "الاستشارات النشطة",
                pendingApprovals: "الموافقات المعلقة",
            },
            sections: {
                recentActivity: "النشاط الأخير",
                systemOverview: "نظرة عامة على النظام",
                quickActions: "إجراءات سريعة",
                topPerformingDoctors: "أفضل الأطباء أداءً",
                revenueOverview: "نظرة عامة على الإيرادات",
                trafficSources: "مصادر الزيارات",
            },
            actions: {
                addUser: "إضافة مستخدم",
                addDoctor: "إضافة طبيب",
                addPatient: "إضافة مريض",
                viewReports: "عرض التقارير",
                systemSettings: "إعدادات النظام",
            },
        },
    },
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationStrings;
    isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, locale }: { children: React.ReactNode; locale: Language }) {
    const [language, setLanguageState] = useState<Language>(locale);

    useEffect(() => {
        setLanguageState(locale);
    }, [locale]);

    const setLanguage = (lang: Language) => {
        // Set cookie for middleware
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
        // Navigate to the new language path
        // Currently we just reload or let the framework handle it. 
        // A full reload ensures new SSR content is fetched.
        const currentPath = window.location.pathname;
        const segments = currentPath.split('/');
        // segments[0] is empty, segments[1] is 'en' or 'ar' usually
        if (segments[1] === 'en' || segments[1] === 'ar') {
            segments[1] = lang;
            window.location.href = segments.join('/');
        } else {
            // Fallback if path doesn't have lang (e.g. root) but middleware should have caught it
            window.location.href = `/${lang}${currentPath}`;
        }
    };

    const value: I18nContextType = {
        language,
        setLanguage,
        t: translations[language],
        isRTL: language === "ar",
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
}
