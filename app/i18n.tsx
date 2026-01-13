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
        neurology: string;
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
    // Get Started Page
    getStartedPage: {
        title: string;
        subtitle: string;
        patientTitle: string;
        patientDesc: string;
        patientFeature1: string;
        patientFeature2: string;
        patientFeature3: string;
        patientCta: string;
        doctorTitle: string;
        doctorDesc: string;
        doctorFeature1: string;
        doctorFeature2: string;
        doctorFeature3: string;
        doctorCta: string;
        orText: string;
        alreadyHaveAccount: string;
        loginHere: string;
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
        themeAppearance: string;
        systemTheme: string;
        language: string;
        error: string;
        goBack: string;
        time: {
            justNow: string;
            minAgo: string;
            minsAgo: string;
            hourAgo: string;
            hoursAgo: string;
            dayAgo: string;
            daysAgo: string;
        };
        priority: {
            high: string;
            medium: string;
            low: string;
        };
        roles: {
            doctor: string;
            patient: string;
            administrator: string;
        };
        units: {
            thousand: string;
            egp: string;
            kEgp: string;
            min: string;
            mins: string;
        };
        demoNames: {
            drHassan: string;
            drAhmedHassan: string;
            drOmarKhalil: string;
            drFatimaKhaled: string;
            drOmarNasser: string;
            drSarahAhmed: string;
            drFatimaHassan: string;
            drMohamedNasser: string;
            drLaylaMahmoud: string;
            sarahJohnson: string;
            mohamedAli: string;
            fatimaKhaled: string;
            omarNasser: string;
            laylaAhmed: string;
            ahmedHassan: string;
            nourIbrahim: string;
            youssefMahmoud: string;
            adminUser: string;
        };
    };
    // Doctor Dashboard
    doctorDashboard: {
        // Sidebar
        sidebar: {
            dashboard: string;
            appointments: string;
            patients: string;
            prescriptions: string;
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
        consultationsPage: {
            title: string;
            subtitle: string;
            newConsultation: {
                title: string;
                subtitle: string;
                button: string;
            };
            joinRoom: {
                title: string;
                subtitle: string;
                placeholder: string;
                button: string;
            };
            active: {
                title: string;
                startedAt: string;
                duration: string;
                rejoin: string;
                end: string;
            };
            history: {
                title: string;
            };
            types: {
                initialConsultation: string;
                followUp: string;
                ecgReview: string;
                checkup: string;
                bloodPressure: string;
                consultation: string;
            };
            timeLabels: {
                min: string;
                startedAt: string;
            };
        };
        analyticsPage: {
            title: string;
            subtitle: string;
            stats: {
                totalPatients: string;
                consultations: string;
                revenue: string;
                avgRating: string;
            };
            charts: {
                weekly: {
                    title: string;
                    subtitle: string;
                    total: string;
                };
                satisfaction: {
                    title: string;
                    excellent: string;
                    good: string;
                    average: string;
                };
            };
            diagnoses: {
                title: string;
                patients: string;
            };
        };
        patientsPage: {
            title: string;
            subtitle: string;
            addPatient: string;
            searchPlaceholder: string;
            labels: {
                condition: string;
                lastVisit: string;
                ageSuffix: string;
                yrs: string;
                last: string;
            };
            conditions: {
                hypertension: string;
                arrhythmia: string;
                routineCheckup: string;
                heartDisease: string;
                bloodPressure: string;
                cholesterol: string;
                palpitations: string;
                postSurgery: string;
                generalCheckup: string;
            };
            actions: {
                call: string;
                chat: string;
            };
            emptyState: {
                title: string;
                subtitle: string;
            };
        };
        appointmentsPage: {
            title: string;
            subtitle: string;
            newAppointment: string;
            searchPlaceholder: string;
            filters: {
                all: string;
                upcoming: string;
                completed: string;
                cancelled: string;
            };
            sections: {
                today: string;
                upcoming: string;
            };
            tableHeaders: {
                time: string;
                patient: string;
                purpose: string;
                statusActions: string;
                dateTime: string;
                status: string;
            };
            status: {
                inProgress: string;
                done: string;
                upcoming: string;
                scheduled: string;
            };
            actions: {
                join: string;
                details: string;
                viewDetails: string;
            };
            emptyState: {
                title: string;
                subtitle: string;
            };
            types: {
                followUp: string;
                initialConsultation: string;
                heartCheckup: string;
                ecgReview: string;
                bloodPressureCheck: string;
                annualCheckup: string;
                consultation: string;
                generalCheckup: string;
            };
        };
        messagesPage: {
            sidebarTitle: string;
            searchPlaceholder: string;
            inputPlaceholder: string;
            online: string;
            offline: string;
            demoConversations: {
                p1: { name: string; lastMessage: string; };
                p2: { name: string; lastMessage: string; };
                p3: { name: string; lastMessage: string; };
                p4: { name: string; lastMessage: string; };
                p5: { name: string; lastMessage: string; };
            };
            demoMessages: {
                m1: string; m2: string; m3: string; m4: string; m5: string; m6: string; m7: string;
            };
        };
        schedulePage: {
            title: string;
            subtitle: string;
            weeklySchedule: string;
            setYourHours: string;
            days: {
                sunday: string;
                monday: string;
                tuesday: string;
                wednesday: string;
                thursday: string;
                friday: string;
                saturday: string;
            };
            addSlot: string;
            removeSlot: string;
            noSlots: string;
            dayOff: string;
            startTime: string;
            endTime: string;
            saveChanges: string;
            saving: string;
            saved: string;
            blockedTimes: string;
            blockedTimesDesc: string;
            addBlockedTime: string;
            reason: string;
            reasonPlaceholder: string;
            from: string;
            to: string;
            noBlockedTimes: string;
            deleteBlockedTime: string;
        };
    };
    // Patient Dashboard
    patientDashboard: {
        sidebar: {
            dashboard: string;
            appointments: string;
            findDoctors: string;
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
            healthScore: string;
        };
        sections: {
            nextAppointment: string;
            upcomingVisit: string;
            recentPrescriptions: string;
            quickActions: string;
        };
        actions: {
            bookAppointment: string;
            viewPrescriptions: string;
            medicalRecords: string;
            messageDoctor: string;
        };
        actionDesc: {
            bookAppointment: string;
            viewPrescriptions: string;
            messageDoctor: string;
            medicalRecords: string;
        };
        activity: {
            appointment: string;
            prescription: string;
            message: string;
            record: string;
        };
        appointmentsPage: {
            title: string;
            subtitle: string;
            bookNew: string;
            filters: {
                all: string;
                upcoming: string;
                completed: string;
            };
            reschedule: string;
            cancel: string;
        };
        prescriptionsPage: {
            title: string;
            subtitle: string;
            filters: {
                all: string;
                active: string;
                refillNeeded: string;
                expired: string;
            };
            status: {
                active: string;
                refillNeeded: string;
                expired: string;
            };
            labels: {
                prescribedBy: string;
                refillDate: string;
                pillsRemaining: string;
                left: string;
                pills: string;
                started: string;
            };
            actions: {
                requestRefill: string;
                viewDetails: string;
                refill: string;
                details: string;
            };
            upload: {
                button: string;
                modalTitle: string;
                documentLabel: string;
                placeholder: string;
                cancel: string;
                submit: string;
                success: string;
            };
            frequency: {
                daily: string;
                bedtime: string;
                beforeBreakfast: string;
            };
            instructions: {
                morningWater: string;
                withMeals: string;
                beforeSleep: string;
                beforeEating: string;
            };
        };
        messagesPage: {
            sidebarTitle: string;
            searchPlaceholder: string;
            inputPlaceholder: string;
            online: string;
            offline: string;
            demoConversations: {
                p1: { name: string; lastMessage: string; };
                p2: { name: string; lastMessage: string; };
                p3: { name: string; lastMessage: string; };
            };
            demoMessages: {
                m1: string; m2: string; m3: string; m4: string; m5: string; m6: string; m7: string;
            };
        };
        recordsPage: {
            title: string;
            subtitle: string;
            filters: {
                all: string;
                lab: string;
                imaging: string;
                visits: string;
            };
            vitals: {
                title: string;
                bloodPressure: string;
                heartRate: string;
                weight: string;
                bloodGlucose: string;
            };
            status: {
                new: string;
                viewed: string;
            };
            trends: {
                stable: string;
                up: string;
                down: string;
            };
        };
        doctorsPage: {
            title: string;
            subtitle: string;
            searchPlaceholder: string;
            filters: {
                all: string;
                available: string;
            };
            experience: string;
            years: string;
            perSession: string;
            bookNow: string;
            viewProfile: string;
            noResults: string;
            noResultsDesc: string;
            selectDate: string;
            selectTime: string;
            availableSlots: string;
            noSlots: string;
            confirmBooking: string;
            bookingConfirmed: string;
            bookingFailed: string;
            patientNotes: string;
            patientNotesPlaceholder: string;
            back: string;
            booking: string;
        };
    };
    // Video Consultation
    consultation: {
        inProgress: string;
        endCall: string;
        endTitle: string;
        endMessage: string;
        justLeave: string;
        endAndComplete: string;
        joining: string;
        waitingForDoctor: string;
        sessionEnded: string;
        returnToAppointments: string;
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
            awaitingReview: string;
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
        activity: {
            registration: string;
            payment: string;
            appointment: string;
            approval: string;
        };
        actionDesc: {
            registerDoctor: string;
            registerPatient: string;
            analytics: string;
            config: string;
        };
        system: {
            allOperational: string;
            lastChecked: string;
            uptime: string;
            satisfaction: string;
            sessions: string;
        };
        usersPage: {
            title: string;
            subtitle: string;
            addUser: string;
            searchPlaceholder: string;
            stats: {
                totalUsers: string;
                doctors: string;
                patients: string;
                admins: string;
            };
            filters: {
                all: string;
                doctor: string;
                patient: string;
                admin: string;
                active: string;
                pending: string;
                inactive: string;
            };
            table: {
                role: string;
                status: string;
                joined: string;
            };
        };
        doctorsPage: {
            title: string;
            subtitle: string;
            addDoctor: string;
            searchPlaceholder: string;
            stats: {
                totalDoctors: string;
                active: string;
                pending: string;
                revenue: string;
            };
            filters: {
                all: string;
                active: string;
                pending: string;
                inactive: string;
            };
            card: {
                patients: string;
                consults: string;
                revenue: string;
                viewProfile: string;
                approve: string;
            };
        };
        patientsPage: {
            title: string;
            subtitle: string;
            addPatient: string;
            searchPlaceholder: string;
            stats: {
                totalPatients: string;
                active: string;
                newThisMonth: string;
                avgAppointments: string;
            };
            filters: {
                all: string;
                active: string;
                inactive: string;
            };
            card: {
                age: string;
                visits: string;
                primaryDoctor: string;
                lastVisit: string;
                viewRecords: string;
            };
        };
        analyticsPage: {
            title: string;
            subtitle: string;
            periods: {
                week: string;
                month: string;
                year: string;
            };
            stats: {
                revenue: string;
                users: string;
                appointments: string;
                session: string;
            };
            charts: {
                revenue: string;
                traffic: string;
            };
            traffic: {
                direct: string;
                referral: string;
                social: string;
                search: string;
            };
            table: {
                title: string;
                rank: string;
                doctor: string;
                specialty: string;
                patients: string;
                revenue: string;
            };
        };
        settingsPage: {
            title: string;
            subtitle: string;
            save: string;
            saved: string;
            sections: {
                general: string;
                security: string;
                notifications: string;
                payment: string;
                info: string;
            };
            items: {
                maintenance: { label: string; desc: string; };
                registration: { label: string; desc: string; };
                doctorApproval: { label: string; desc: string; };
                emailNotifications: { label: string; desc: string; };
                twoFactor: { label: string; desc: string; };
                sessionTimeout: { label: string; desc: string; };
                ipWhitelist: { label: string; desc: string; };
                auditLog: { label: string; desc: string; };
                newUser: { label: string; desc: string; };
                newDoctor: { label: string; desc: string; };
                paymentAlerts: { label: string; desc: string; };
                systemAlerts: { label: string; desc: string; };
                acceptPayments: { label: string; desc: string; };
                refunds: { label: string; desc: string; };
                invoices: { label: string; desc: string; };
            };
            info: {
                version: string;
                environment: string;
                lastUpdated: string;
                dbStatus: string;
            };
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
            getStarted: "Get Started",
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
            neurology: "Neurology",
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
        getStartedPage: {
            title: "Get Started with TawariApp",
            subtitle: "Choose how you want to join our healthcare platform",
            patientTitle: "I'm a Patient",
            patientDesc: "Book appointments with top doctors, get prescriptions, and manage your health",
            patientFeature1: "Video consultations 24/7",
            patientFeature2: "Digital prescriptions",
            patientFeature3: "Health records management",
            patientCta: "Register as Patient",
            doctorTitle: "I'm a Doctor",
            doctorDesc: "Join our platform and grow your practice with telemedicine",
            doctorFeature1: "Reach more patients",
            doctorFeature2: "Flexible schedule",
            doctorFeature3: "Secure platform",
            doctorCta: "Register as Doctor",
            orText: "or",
            alreadyHaveAccount: "Already have an account?",
            loginHere: "Login here",
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
            darkMode: "Dark",
            lightMode: "Light",
            themeAppearance: "Theme Appearance",
            systemTheme: "System",
            language: "Language",
            error: "Error",
            goBack: "Go Back",
            time: {
                justNow: "Just now",
                minAgo: "1 min ago",
                minsAgo: "mins ago",
                hourAgo: "1 hour ago",
                hoursAgo: "hours ago",
                dayAgo: "1 day ago",
                daysAgo: "days ago",
            },
            priority: {
                high: "High",
                medium: "Medium",
                low: "Low",
            },
            roles: {
                doctor: "Doctor",
                patient: "Patient",
                administrator: "Administrator",
            },
            units: {
                thousand: "K",
                egp: "EGP",
                kEgp: "K EGP",
                min: "min",
                mins: "mins",
            },
            demoNames: {
                drHassan: "Dr. Hassan",
                drAhmedHassan: "Dr. Ahmed Hassan",
                drOmarKhalil: "Dr. Omar Khalil",
                drFatimaKhaled: "Dr. Fatima Khaled",
                drOmarNasser: "Dr. Omar Nasser",
                drSarahAhmed: "Dr. Sarah Ahmed",
                drFatimaHassan: "Dr. Fatima Hassan",
                drMohamedNasser: "Dr. Mohamed Nasser",
                drLaylaMahmoud: "Dr. Layla Mahmoud",
                sarahJohnson: "Sarah Johnson",
                mohamedAli: "Mohamed Ali",
                fatimaKhaled: "Fatima Khaled",
                omarNasser: "Omar Nasser",
                laylaAhmed: "Layla Ahmed",
                ahmedHassan: "Ahmed Hassan",
                nourIbrahim: "Nour Ibrahim",
                youssefMahmoud: "Youssef Mahmoud",
                adminUser: "Admin User",
            },
        },
        doctorDashboard: {
            sidebar: {
                dashboard: "Dashboard",
                appointments: "Appointments",
                patients: "Patients",
                prescriptions: "Prescriptions",
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
            consultationsPage: {
                title: "Consultations",
                subtitle: "Manage video consultations with patients",
                newConsultation: {
                    title: "Start New Consultation",
                    subtitle: "Begin a video call with your next patient",
                    button: "Start Video Call"
                },
                joinRoom: {
                    title: "Join by Room Code",
                    subtitle: "Enter a room code to join an existing session",
                    placeholder: "Enter room code...",
                    button: "Join"
                },
                active: {
                    title: "Active Now",
                    startedAt: "Started at",
                    duration: "Duration",
                    rejoin: "Rejoin Call",
                    end: "End Call"
                },
                history: {
                    title: "Recent Consultations"
                },
                types: {
                    initialConsultation: "Initial Consultation",
                    followUp: "Follow-up",
                    ecgReview: "ECG Review",
                    checkup: "Checkup",
                    bloodPressure: "Blood Pressure",
                    consultation: "Consultation"
                },
                timeLabels: {
                    min: "min",
                    startedAt: "Started at"
                }
            },
            analyticsPage: {
                title: "Analytics",
                subtitle: "Track your performance and metrics",
                stats: {
                    totalPatients: "Total Patients",
                    consultations: "Consultations",
                    revenue: "Revenue (EGP)",
                    avgRating: "Avg. Rating"
                },
                charts: {
                    weekly: {
                        title: "Weekly Consultations",
                        subtitle: "This week's performance",
                        total: "Total this week"
                    },
                    satisfaction: {
                        title: "Patient Satisfaction",
                        excellent: "Excellent",
                        good: "Good",
                        average: "Average"
                    }
                },
                diagnoses: {
                    title: "Top Diagnoses This Month",
                    patients: "patients"
                }
            },

            appointmentsPage: {
                title: "Appointments",
                subtitle: "Manage your patient appointments",
                newAppointment: "New Appointment",
                searchPlaceholder: "Search appointments...",
                filters: {
                    all: "All",
                    upcoming: "Upcoming",
                    completed: "Completed",
                    cancelled: "Cancelled"
                },
                sections: {
                    today: "Today",
                    upcoming: "Upcoming"
                },
                tableHeaders: {
                    time: "Time",
                    patient: "Patient",
                    purpose: "Purpose",
                    statusActions: "Status & Actions",
                    dateTime: "Date & Time",
                    status: "Status"
                },
                status: {
                    inProgress: "In Progress",
                    done: "Done",
                    upcoming: "Upcoming",
                    scheduled: "Scheduled"
                },
                actions: {
                    join: "Join",
                    details: "Details",
                    viewDetails: "View Details"
                },
                emptyState: {
                    title: "No appointments found",
                    subtitle: "Try adjusting your search or filters"
                },
                types: {
                    followUp: "Follow-up",
                    initialConsultation: "Initial Consultation",
                    heartCheckup: "Heart Checkup",
                    ecgReview: "ECG Review",
                    bloodPressureCheck: "Blood Pressure Check",
                    annualCheckup: "Annual Checkup",
                    consultation: "Consultation",
                    generalCheckup: "General Checkup"
                }
            },
            patientsPage: {
                title: "Patients",
                subtitle: "registered patients",
                addPatient: "Add Patient",
                searchPlaceholder: "Search patients by name or condition...",
                labels: {
                    condition: "Condition",
                    lastVisit: "Last Visit",
                    ageSuffix: "years old",
                    yrs: "yrs",
                    last: "Last"
                },
                conditions: {
                    hypertension: "Hypertension",
                    arrhythmia: "Arrhythmia",
                    routineCheckup: "Routine Checkup",
                    heartDisease: "Heart Disease",
                    bloodPressure: "Blood Pressure",
                    cholesterol: "Cholesterol",
                    palpitations: "Palpitations",
                    postSurgery: "Post-Surgery",
                    generalCheckup: "General Checkup"
                },
                actions: {
                    call: "Call",
                    chat: "Chat"
                },
                emptyState: {
                    title: "No patients found",
                    subtitle: "Try adjusting your search"
                }
            },
            messagesPage: {
                sidebarTitle: "Messages",
                searchPlaceholder: "Search conversations...",
                inputPlaceholder: "Type a message...",
                online: "Online",
                offline: "Offline",
                demoConversations: {
                    p1: { name: "Sarah Johnson", lastMessage: "Thank you doctor, I'll take the medication as prescribed." },
                    p2: { name: "Mohamed Ali", lastMessage: "When should I come for the next appointment?" },
                    p3: { name: "Fatima Khaled", lastMessage: "I've been feeling much better lately." },
                    p4: { name: "Omar Nasser", lastMessage: "The ECG results look normal." },
                    p5: { name: "Layla Ahmed", lastMessage: "Should I continue with the current dosage?" }
                },
                demoMessages: {
                    m1: "Good morning Dr. Hassan, I wanted to ask about my medication.",
                    m2: "Good morning Sarah! Of course, what would you like to know?",
                    m3: "I've been experiencing some mild dizziness after taking the blood pressure medication.",
                    m4: "That can be a common side effect initially. Are you taking it with food?",
                    m5: "No, I usually take it on an empty stomach in the morning.",
                    m6: "I recommend taking it with breakfast. This should help reduce the dizziness. If it persists for more than a week, please let me know.",
                    m7: "Thank you doctor, I'll take the medication as prescribed."
                }
            },
            schedulePage: {
                title: "Schedule Management",
                subtitle: "Set your availability and working hours",
                weeklySchedule: "Weekly Schedule",
                setYourHours: "Set your working hours for each day",
                days: {
                    sunday: "Sunday",
                    monday: "Monday",
                    tuesday: "Tuesday",
                    wednesday: "Wednesday",
                    thursday: "Thursday",
                    friday: "Friday",
                    saturday: "Saturday",
                },
                addSlot: "Add Time Slot",
                removeSlot: "Remove",
                noSlots: "No time slots",
                dayOff: "Day Off",
                startTime: "Start Time",
                endTime: "End Time",
                saveChanges: "Save Changes",
                saving: "Saving...",
                saved: "Saved!",
                blockedTimes: "Blocked Times",
                blockedTimesDesc: "Block specific dates when you're unavailable",
                addBlockedTime: "Add Blocked Time",
                reason: "Reason",
                reasonPlaceholder: "e.g., Vacation, Conference",
                from: "From",
                to: "To",
                noBlockedTimes: "No blocked times set",
                deleteBlockedTime: "Delete",
            },
        },
        patientDashboard: {
            sidebar: {
                dashboard: "Dashboard",
                appointments: "Appointments",
                findDoctors: "Find Doctors",
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
                healthScore: "Health Score",
            },
            sections: {
                nextAppointment: "Next Appointment",
                upcomingVisit: "Your upcoming visit",
                recentPrescriptions: "Recent Prescriptions",
                quickActions: "Quick Actions",
            },
            actions: {
                bookAppointment: "Book Appointment",
                viewPrescriptions: "View Prescriptions",
                medicalRecords: "Medical Records",
                messageDoctor: "Message Doctor",
            },
            actionDesc: {
                bookAppointment: "Schedule a visit with your doctor",
                viewPrescriptions: "Check your active medications",
                messageDoctor: "Send a message to your care team",
                medicalRecords: "Access your medical history",
            },
            activity: {
                appointment: "Appointment with",
                prescription: "Prescription refilled",
                message: "Message from",
                record: "Lab results uploaded",
            },

            appointmentsPage: {
                title: "My Appointments",
                subtitle: "View and manage your appointments",
                bookNew: "Book Appointment",
                filters: {
                    all: "All",
                    upcoming: "Upcoming",
                    completed: "Completed"
                },
                reschedule: "Reschedule",
                cancel: "Cancel"
            },
            prescriptionsPage: {
                title: "My Prescriptions",
                subtitle: "Manage your medications and refills",
                filters: {
                    all: "All",
                    active: "Active",
                    refillNeeded: "Refill Needed",
                    expired: "Expired"
                },
                status: {
                    active: "Active",
                    refillNeeded: "Refill Needed",
                    expired: "Expired"
                },
                labels: {
                    prescribedBy: "Prescribed by",
                    refillDate: "Refill Date",
                    pillsRemaining: "Pills Remaining",
                    left: "Left",
                    pills: "pills",
                    started: "Started"
                },
                actions: {
                    requestRefill: "Request Refill",
                    viewDetails: "View Details",
                    refill: "Refill",
                    details: "Details"
                },
                upload: {
                    button: "Upload Prescription",
                    modalTitle: "Upload Prescription",
                    documentLabel: "Prescription Document",
                    placeholder: "Click to upload prescription",
                    cancel: "Cancel",
                    submit: "Upload",
                    success: "Prescription uploaded successfully!"
                },
                frequency: {
                    daily: "{n} tablets daily",
                    bedtime: "At bedtime",
                    beforeBreakfast: "Before breakfast",
                },
                instructions: {
                    morningWater: "Take in the morning with water",
                    withMeals: "Take with meals",
                    beforeSleep: "Take before sleep",
                    beforeEating: "Take 30 mins before eating",
                }
            },
            messagesPage: {
                sidebarTitle: "Messages",
                searchPlaceholder: "Search...",
                inputPlaceholder: "Type a message...",
                online: "Online",
                offline: "Offline",
                demoConversations: {
                    p1: { name: "Sarah Johnson", lastMessage: "Thank you doctor, I'll take the medication as prescribed." },
                    p2: { name: "Mohamed Ali", lastMessage: "When should I come for the next appointment?" },
                    p3: { name: "Fatima Khaled", lastMessage: "I've been feeling much better lately." }
                },
                demoMessages: {
                    m1: "Good morning Dr. Hassan, I wanted to ask about my medication.",
                    m2: "Good morning Sarah! Of course, what would you like to know?",
                    m3: "I've been experiencing some mild dizziness after taking the blood pressure medication.",
                    m4: "That can be a common side effect initially. Are you taking it with food?",
                    m5: "No, I usually take it on an empty stomach in the morning.",
                    m6: "I recommend taking it with breakfast. This should help reduce the dizziness. If it persists for more than a week, please let me know.",
                    m7: "Thank you doctor, I'll take the medication as prescribed."
                }
            },
            recordsPage: {
                title: "Medical Records",
                subtitle: "Access your medical history and documents",
                filters: {
                    all: "All Records",
                    lab: "Lab Results",
                    imaging: "Imaging",
                    visits: "Visit Summaries"
                },
                vitals: {
                    title: "Latest Vitals",
                    bloodPressure: "Blood Pressure",
                    heartRate: "Heart Rate",
                    weight: "Weight",
                    bloodGlucose: "Blood Glucose"
                },
                status: {
                    new: "New",
                    viewed: "Viewed"
                },
                trends: {
                    stable: "Stable",
                    up: "Up",
                    down: "Down"
                }
            },
            doctorsPage: {
                title: "Find a Doctor",
                subtitle: "Browse and book appointments with our verified doctors",
                searchPlaceholder: "Search by name or specialty...",
                filters: {
                    all: "All Specialties",
                    available: "Available Now",
                },
                experience: "Experience",
                years: "years",
                perSession: "per session",
                bookNow: "Book Now",
                viewProfile: "View Profile",
                noResults: "No doctors found",
                noResultsDesc: "Try adjusting your search or filters",
                selectDate: "Select Date",
                selectTime: "Select Time",
                availableSlots: "Available Slots",
                noSlots: "No available slots for this date",
                confirmBooking: "Confirm Booking",
                bookingConfirmed: "Appointment booked successfully!",
                bookingFailed: "Failed to book appointment. Please try again.",
                patientNotes: "Notes for Doctor (Optional)",
                patientNotesPlaceholder: "Describe your symptoms or reason for visit...",
                back: "Back",
                booking: "Booking...",
            },
        },
        consultation: {
            inProgress: "Consultation in Progress",
            endCall: "End Call",
            endTitle: "End Consultation?",
            endMessage: "Are you sure you want to end this consultation? This action cannot be undone.",
            justLeave: "Just Leave",
            endAndComplete: "End & Complete",
            joining: "Joining consultation...",
            waitingForDoctor: "Waiting for doctor to start the consultation",
            sessionEnded: "This consultation has ended",
            returnToAppointments: "Return to Appointments",
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
                awaitingReview: "awaiting review",
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
            activity: {
                registration: "New doctor registered",
                payment: "Payment received",
                appointment: "Patient completed appointment",
                approval: "Doctor account approved",
            },
            actionDesc: {
                registerDoctor: "Register new doctor",
                registerPatient: "Register new patient",
                analytics: "Platform analytics",
                config: "System config",
            },
            system: {
                allOperational: "All Systems Operational",
                lastChecked: "Last checked 2 min ago",
                uptime: "System Uptime",
                satisfaction: "User Satisfaction",
                sessions: "Active Sessions",
            },
            usersPage: {
                title: "User Management",
                subtitle: "Manage all users on the platform",
                addUser: "Add User",
                searchPlaceholder: "Search users...",
                stats: {
                    totalUsers: "Total Users",
                    doctors: "Doctors",
                    patients: "Patients",
                    admins: "Admins"
                },
                filters: {
                    all: "All",
                    doctor: "Doctor",
                    patient: "Patient",
                    admin: "Admin",
                    active: "Active",
                    pending: "Pending",
                    inactive: "Inactive"
                },
                table: {
                    role: "Role",
                    status: "Status",
                    joined: "Joined"
                }
            },
            doctorsPage: {
                title: "Doctor Management",
                subtitle: "Manage doctor accounts and approvals",
                addDoctor: "Add Doctor",
                searchPlaceholder: "Search doctors by name or specialty...",
                stats: {
                    totalDoctors: "Total Doctors",
                    active: "Active",
                    pending: "Pending",
                    revenue: "Revenue"
                },
                filters: {
                    all: "All",
                    active: "Active",
                    pending: "Pending",
                    inactive: "Inactive"
                },
                card: {
                    patients: "Patients",
                    consults: "Consults",
                    revenue: "Revenue",
                    viewProfile: "View Profile",
                    approve: "Approve"
                }
            },
            patientsPage: {
                title: "Patient Management",
                subtitle: "View and manage patient accounts",
                addPatient: "Add Patient",
                searchPlaceholder: "Search patients by name, email, or doctor...",
                stats: {
                    totalPatients: "Total Patients",
                    active: "Active",
                    newThisMonth: "New This Month",
                    avgAppointments: "Avg. Appointments"
                },
                filters: {
                    all: "All",
                    active: "Active",
                    inactive: "Inactive"
                },
                card: {
                    age: "Age",
                    visits: "Visits",
                    primaryDoctor: "Primary Doctor",
                    lastVisit: "Last Visit",
                    viewRecords: "View Records"
                }
            },
            analyticsPage: {
                title: "Analytics & Reports",
                subtitle: "Platform performance and insights",
                periods: {
                    week: "Week",
                    month: "Month",
                    year: "Year"
                },
                stats: {
                    revenue: "Total Revenue",
                    users: "Total Users",
                    appointments: "Appointments",
                    session: "Avg. Session"
                },
                charts: {
                    revenue: "Revenue Overview (K EGP)",
                    traffic: "Traffic Sources"
                },
                traffic: {
                    direct: "Direct",
                    referral: "Referral",
                    social: "Social Media",
                    search: "Search"
                },
                table: {
                    title: "Top Performing Doctors",
                    rank: "Rank",
                    doctor: "Doctor",
                    specialty: "Specialty",
                    patients: "Patients",
                    revenue: "Revenue"
                }
            },
            settingsPage: {
                title: "System Settings",
                subtitle: "Configure platform preferences and features",
                save: "Save Changes",
                saved: "Saved!",
                sections: {
                    general: "General Settings",
                    security: "Security Settings",
                    notifications: "Notifications",
                    payment: "Payment Settings",
                    info: "Platform Information"
                },
                items: {
                    maintenance: { label: "Maintenance Mode", desc: "Enable to show maintenance page to users" },
                    registration: { label: "User Registration", desc: "Allow new users to register on the platform" },
                    doctorApproval: { label: "Doctor Auto-Approval", desc: "Automatically approve new doctor registrations" },
                    emailNotifications: { label: "Email Notifications", desc: "Send email notifications for platform events" },
                    twoFactor: { label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts" },
                    sessionTimeout: { label: "Session Timeout", desc: "Automatically log out inactive users after 30 minutes" },
                    ipWhitelist: { label: "IP Whitelist", desc: "Restrict admin access to whitelisted IPs only" },
                    auditLog: { label: "Audit Logging", desc: "Log all admin actions for security review" },
                    newUser: { label: "New User Alerts", desc: "Notify when new users register" },
                    newDoctor: { label: "Doctor Registration", desc: "Notify when doctors await approval" },
                    paymentAlerts: { label: "Payment Alerts", desc: "Notify for payment transactions" },
                    systemAlerts: { label: "System Alerts", desc: "Critical system notifications" },
                    acceptPayments: { label: "Accept Payments", desc: "Enable payment processing on the platform" },
                    refunds: { label: "Automatic Refunds", desc: "Process refunds for cancelled appointments" },
                    invoices: { label: "Generate Invoices", desc: "Automatically generate PDF invoices" }
                },
                info: {
                    version: "Version",
                    environment: "Environment",
                    lastUpdated: "Last Updated",
                    dbStatus: "Database Status"
                }
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
            getStarted: "ابدأ الآن",
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
            neurology: "أعصاب",
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
            subtitle: "انضم إلى طوارئ وتواصل مع آلاف المرضى في جميع أنحاء مصر. حدد جدولك ورسومك واعمل من أي مكان.",
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
            subtitle: "انضم لآلاف المصريين الذين يثقون في طوارئ للرعاية الصحية المريحة والعالية الجودة.",
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
            copyright: "© ٢٠٢٥ طوارئ. جميع الحقوق محفوظة. صنع بعناية في مصر.",
        },
        getStartedPage: {
            title: "ابدأ مع طوارئ",
            subtitle: "اختر كيف تريد الانضمام إلى منصتنا الصحية",
            patientTitle: "أنا مريض",
            patientDesc: "احجز مواعيد مع أفضل الأطباء، واحصل على الوصفات الطبية، وأدر صحتك",
            patientFeature1: "استشارات فيديو على مدار الساعة",
            patientFeature2: "وصفات طبية رقمية",
            patientFeature3: "إدارة السجلات الصحية",
            patientCta: "التسجيل كمريض",
            doctorTitle: "أنا طبيب",
            doctorDesc: "انضم إلى منصتنا ووسّع ممارستك الطبية عبر الطب عن بُعد",
            doctorFeature1: "الوصول لمزيد من المرضى",
            doctorFeature2: "جدول مرن",
            doctorFeature3: "منصة آمنة",
            doctorCta: "التسجيل كطبيب",
            orText: "أو",
            alreadyHaveAccount: "لديك حساب بالفعل؟",
            loginHere: "سجل دخولك هنا",
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
            darkMode: "داكن",
            lightMode: "فاتح",
            themeAppearance: "مظهر السمة",
            systemTheme: "النظام",
            language: "اللغة",
            error: "خطأ",
            goBack: "رجوع",
            time: {
                justNow: "الآن",
                minAgo: "منذ دقيقة",
                minsAgo: "منذ دقائق",
                hourAgo: "منذ ساعة",
                hoursAgo: "منذ ساعات",
                dayAgo: "منذ يوم",
                daysAgo: "منذ أيام",
            },
            priority: {
                high: "عالية",
                medium: "متوسطة",
                low: "منخفضة",
            },
            roles: {
                doctor: "طبيب",
                patient: "مريض",
                administrator: "مدير النظام",
            },
            units: {
                thousand: "ألف",
                egp: "ج.م",
                kEgp: "ألف ج.م",
                min: "د",
                mins: "دقائق",
            },
            demoNames: {
                drHassan: "د. حسن",
                drAhmedHassan: "د. أحمد حسن",
                drOmarKhalil: "د. عمر خليل",
                drFatimaKhaled: "د. فاطمة خالد",
                drOmarNasser: "د. عمر ناصر",
                drSarahAhmed: "د. سارة أحمد",
                drFatimaHassan: "د. فاطمة حسن",
                drMohamedNasser: "د. محمد ناصر",
                drLaylaMahmoud: "د. ليلى محمود",
                sarahJohnson: "سارة جونسون",
                mohamedAli: "محمد علي",
                fatimaKhaled: "فاطمة خالد",
                omarNasser: "عمر ناصر",
                laylaAhmed: "ليلى أحمد",
                ahmedHassan: "أحمد حسن",
                nourIbrahim: "نور إبراهيم",
                youssefMahmoud: "يوسف محمود",
                adminUser: "مدير النظام",
            },
        },
        doctorDashboard: {
            sidebar: {
                dashboard: "لوحة التحكم",
                appointments: "المواعيد",
                patients: "المرضى",
                prescriptions: "الوصفات الطبية",
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
            consultationsPage: {
                title: "الاستشارات",
                subtitle: "إدارة استشارات الفيديو مع المرضى",
                newConsultation: {
                    title: "بدء استشارة جديدة",
                    subtitle: "ابدأ مكالمة فيديو مع مريضك التالي",
                    button: "بدء مكالمة فيديو"
                },
                joinRoom: {
                    title: "انضمام برمز الغرفة",
                    subtitle: "أدخل رمز الغرفة للانضمام إلى جلسة موجودة",
                    placeholder: "أدخل رمز الغرفة...",
                    button: "انضمام"
                },
                active: {
                    title: "نشط الآن",
                    startedAt: "بدأت في",
                    duration: "المدة",
                    rejoin: "إعادة الانضمام",
                    end: "إنهاء المكالمة"
                },
                history: {
                    title: "الاستشارات الأخيرة"
                },
                types: {
                    initialConsultation: "استشارة أولية",
                    followUp: "متابعة",
                    ecgReview: "مراجعة تخطيط القلب",
                    checkup: "فحص",
                    bloodPressure: "ضغط الدم",
                    consultation: "استشارة"
                },
                timeLabels: {
                    min: "دقيقة",
                    startedAt: "بدأت في"
                }
            },
            analyticsPage: {
                title: "التحليلات",
                subtitle: "تتبع أدائك ومقاييسك",
                stats: {
                    totalPatients: "إجمالي المرضى",
                    consultations: "الاستشارات",
                    revenue: "الإيرادات (ج.م)",
                    avgRating: "متوسط التقييم"
                },
                charts: {
                    weekly: {
                        title: "الاستشارات الأسبوعية",
                        subtitle: "أداء هذا الأسبوع",
                        total: "المجموع هذا الأسبوع"
                    },
                    satisfaction: {
                        title: "رضا المرضى",
                        excellent: "ممتاز",
                        good: "جيد",
                        average: "متوسط"
                    }
                },
                diagnoses: {
                    title: "أهم التشخيصات هذا الشهر",
                    patients: "مرضى"
                }
            },

            appointmentsPage: {
                title: "المواعيد",
                subtitle: "إدارة مواعيد مرضاك",
                newAppointment: "موعد جديد",
                searchPlaceholder: "البحث في المواعيد...",
                filters: {
                    all: "الكل",
                    upcoming: "قادمة",
                    completed: "مكتملة",
                    cancelled: "ملغاة"
                },
                sections: {
                    today: "اليوم",
                    upcoming: "القادمة"
                },
                tableHeaders: {
                    time: "الوقت",
                    patient: "المريض",
                    purpose: "الغرض",
                    statusActions: "الحالة والإجراءات",
                    dateTime: "التاريخ والوقت",
                    status: "الحالة"
                },
                status: {
                    inProgress: "جاري",
                    done: "تم",
                    upcoming: "قادم",
                    scheduled: "مجدول"
                },
                actions: {
                    join: "انضمام",
                    details: "تفاصيل",
                    viewDetails: "عرض التفاصيل"
                },
                emptyState: {
                    title: "لا توجد مواعيد",
                    subtitle: "حاول تعديل البحث أو التصنيفات"
                },
                types: {
                    followUp: "متابعة",
                    initialConsultation: "استشارة أولية",
                    heartCheckup: "فحص القلب",
                    ecgReview: "مراجعة تخطيط القلب",
                    bloodPressureCheck: "فحص ضغط الدم",
                    annualCheckup: "فحص سنوي",
                    consultation: "استشارة",
                    generalCheckup: "فحص عام"
                }
            },
            patientsPage: {
                title: "المرضى",
                subtitle: "مرضى مسجلين",
                addPatient: "إضافة مريض",
                searchPlaceholder: "البحث عن المرضى بالاسم أو الحالة...",
                labels: {
                    condition: "الحالة",
                    lastVisit: "آخر زيارة",
                    ageSuffix: "سنة",
                    yrs: "سنة",
                    last: "آخر زيارة"
                },
                conditions: {
                    hypertension: "ارتفاع ضغط الدم",
                    arrhythmia: "عدم انتظام ضربات القلب",
                    routineCheckup: "فحص روتيني",
                    heartDisease: "أمراض القلب",
                    bloodPressure: "ضغط الدم",
                    cholesterol: "الكوليسترول",
                    palpitations: "خفقان القلب",
                    postSurgery: "ما بعد الجراحة",
                    generalCheckup: "فحص عام"
                },
                actions: {
                    call: "اتصال",
                    chat: "دردشة"
                },
                emptyState: {
                    title: "لا يوجد مرضى",
                    subtitle: "حاول تغيير كلمات البحث"
                }
            },
            messagesPage: {
                sidebarTitle: "الرسائل",
                searchPlaceholder: "بحث في المحادثات...",
                inputPlaceholder: "اكتب رسالة...",
                online: "متصل",
                offline: "غير متصل",
                demoConversations: {
                    p1: { name: "سارة جونسون", lastMessage: "شكراً دكتور، سأتناول الدواء كما هو موصوف." },
                    p2: { name: "محمد علي", lastMessage: "متى يجب أن آتي للموعد القادم؟" },
                    p3: { name: "فاطمة خالد", lastMessage: "أشعر بتحسن كبير مؤخراً." },
                    p4: { name: "عمر ناصر", lastMessage: "نتائج تخطيط القلب تبدو طبيعية." },
                    p5: { name: "ليلى أحمد", lastMessage: "هل يجب أن أستمر بالجرعة الحالية؟" }
                },
                demoMessages: {
                    m1: "صباح الخير د. حسن، أردت أن أسألك عن دوائي.",
                    m2: "صباح الخير سارة! بالطبع، ماذا تريدين أن تعرفي؟",
                    m3: "كنت أشعر ببعض الدوار الخفيف بعد تناول دواء ضغط الدم.",
                    m4: "يمكن أن يكون ذلك أثراً جانبياً شائعاً في البداية. هل تتناولينه مع الطعام؟",
                    m5: "لا، عادة ما أتناوله على معدة فارغة في الصباح.",
                    m6: "أنصح بتناوله مع وجبة الإفطار. هذا سيساعد في تقليل الدوار. إذا استمر لأكثر من أسبوع، يرجى إخباري.",
                    m7: "شكراً دكتور، سأتناول الدواء كما هو موصوف."
                }
            },
            schedulePage: {
                title: "إدارة الجدول",
                subtitle: "حدد أوقات عملك وساعات التوفر",
                weeklySchedule: "الجدول الأسبوعي",
                setYourHours: "حدد ساعات عملك لكل يوم",
                days: {
                    sunday: "الأحد",
                    monday: "الإثنين",
                    tuesday: "الثلاثاء",
                    wednesday: "الأربعاء",
                    thursday: "الخميس",
                    friday: "الجمعة",
                    saturday: "السبت",
                },
                addSlot: "إضافة فترة زمنية",
                removeSlot: "إزالة",
                noSlots: "لا توجد فترات زمنية",
                dayOff: "يوم عطلة",
                startTime: "وقت البدء",
                endTime: "وقت الانتهاء",
                saveChanges: "حفظ التغييرات",
                saving: "جاري الحفظ...",
                saved: "تم الحفظ!",
                blockedTimes: "الأوقات المحجوبة",
                blockedTimesDesc: "احجب تواريخ محددة عندما تكون غير متاح",
                addBlockedTime: "إضافة وقت محجوب",
                reason: "السبب",
                reasonPlaceholder: "مثال: إجازة، مؤتمر",
                from: "من",
                to: "إلى",
                noBlockedTimes: "لا توجد أوقات محجوبة",
                deleteBlockedTime: "حذف",
            },
        },
        patientDashboard: {
            sidebar: {
                dashboard: "لوحة التحكم",
                appointments: "المواعيد",
                findDoctors: "البحث عن طبيب",
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
                healthScore: "نقاط الصحة",
            },
            sections: {
                nextAppointment: "الموعد التالي",
                upcomingVisit: "زيارتك القادمة",
                recentPrescriptions: "الوصفات الأخيرة",
                quickActions: "إجراءات سريعة",
            },
            actions: {
                bookAppointment: "حجز موعد",
                viewPrescriptions: "عرض الوصفات",
                medicalRecords: "السجلات الطبية",
                messageDoctor: "مراسلة الطبيب",
            },
            actionDesc: {
                bookAppointment: "حدد موعدًا لزيارة طبيبك",
                viewPrescriptions: "تحقق من أدويتك النشطة",
                messageDoctor: "أرسل رسالة إلى فريق الرعاية الخاص بك",
                medicalRecords: "الوصول إلى سجلك الطبي",
            },
            activity: {
                appointment: "موعد مع",
                prescription: "تم تجديد الوصفة",
                message: "رسالة من",
                record: "تم رفع نتائج المختبر",
            },

            appointmentsPage: {
                title: "مواعيدي",
                subtitle: "عرض وإدارة المواعيد الخاصة بك",
                bookNew: "حجز موعد",
                filters: {
                    all: "الكل",
                    upcoming: "قادمة",
                    completed: "مكتملة"
                },
                reschedule: "إعادة جدولة",
                cancel: "إلغاء"
            },
            prescriptionsPage: {
                title: "وصفاتي الطبية",
                subtitle: "إدارة أدويتك وطلبات إعادة التعبئة",
                filters: {
                    all: "الكل",
                    active: "نشطة",
                    refillNeeded: "بحاجة لتجديد",
                    expired: "منتهية"
                },
                status: {
                    active: "نشطة",
                    refillNeeded: "بحاجة لتجديد",
                    expired: "منتهية"
                },
                labels: {
                    prescribedBy: "وصفها",
                    refillDate: "تاريخ التجديد",
                    pillsRemaining: "الحبوب المتبقية",
                    left: "متبقي",
                    pills: "حبة",
                    started: "بدأ في"
                },
                actions: {
                    requestRefill: "طلب تجديد",
                    viewDetails: "عرض التفاصيل",
                    refill: "تجديد",
                    details: "تفاصيل"
                },
                upload: {
                    button: "رفع وصفة طبية",
                    modalTitle: "رفع وصفة طبية",
                    documentLabel: "مستند الوصفة الطبية",
                    placeholder: "انقر لرفع الوصفة الطبية",
                    cancel: "إلغاء",
                    submit: "رفع",
                    success: "تم رفع الوصفة الطبية بنجاح!"
                },
                frequency: {
                    daily: "{n} أقراص يومياً",
                    bedtime: "عند النوم",
                    beforeBreakfast: "قبل الإفطار",
                },
                instructions: {
                    morningWater: "يؤخذ صباحاً مع الماء",
                    withMeals: "يؤخذ مع الأكل",
                    beforeSleep: "يؤخذ قبل النوم",
                    beforeEating: "يؤخذ قبل الأكل بـ 30 دقيقة",
                }
            },
            messagesPage: {
                sidebarTitle: "الرسائل",
                searchPlaceholder: "بحث...",
                inputPlaceholder: "اكتب رسالة...",
                online: "متصل",
                offline: "غير متصل",
                demoConversations: {
                    p1: { name: "سارة جونسون", lastMessage: "شكراً دكتور، سأتناول الدواء كما هو موصوف." },
                    p2: { name: "محمد علي", lastMessage: "متى يجب أن آتي للموعد القادم؟" },
                    p3: { name: "فاطمة خالد", lastMessage: "أشعر بتحسن كبير مؤخراً." }
                },
                demoMessages: {
                    m1: "صباح الخير د. حسن، أردت أن أسألك عن دوائي.",
                    m2: "صباح الخير سارة! بالطبع، ماذا تريدين أن تعرفي؟",
                    m3: "كنت أشعر ببعض الدوار الخفيف بعد تناول دواء ضغط الدم.",
                    m4: "يمكن أن يكون ذلك أثراً جانبياً شائعاً في البداية. هل تتناولينه مع الطعام؟",
                    m5: "لا، عادة ما أتناوله على معدة فارغة في الصباح.",
                    m6: "أنصح بتناوله مع وجبة الإفطار. هذا سيساعد في تقليل الدوار. إذا استمر لأكثر من أسبوع، يرجى إخباري.",
                    m7: "شكراً دكتور، سأتناول الدواء كما هو موصوف."
                }
            },
            recordsPage: {
                title: "السجلات الطبية",
                subtitle: "الوصول إلى سجلك الطبي والمستندات",
                filters: {
                    all: "كل السجلات",
                    lab: "نتائج المختبر",
                    imaging: "الأشعة والصور",
                    visits: "ملخصات الزيارة"
                },
                vitals: {
                    title: "المؤشرات الحيوية",
                    bloodPressure: "ضغط الدم",
                    heartRate: "معدل ضربات القلب",
                    weight: "الوزن",
                    bloodGlucose: "سكر الدم"
                },
                status: {
                    new: "جديد",
                    viewed: "تم عرضه"
                },
                trends: {
                    stable: "مستقر",
                    up: "مرتفع",
                    down: "منخفض"
                }
            },
            doctorsPage: {
                title: "البحث عن طبيب",
                subtitle: "تصفح واحجز مواعيد مع أطبائنا المعتمدين",
                searchPlaceholder: "ابحث بالاسم أو التخصص...",
                filters: {
                    all: "جميع التخصصات",
                    available: "متاح الآن",
                },
                experience: "الخبرة",
                years: "سنوات",
                perSession: "للجلسة",
                bookNow: "احجز الآن",
                viewProfile: "عرض الملف",
                noResults: "لم يتم العثور على أطباء",
                noResultsDesc: "حاول تعديل البحث أو الفلاتر",
                selectDate: "اختر التاريخ",
                selectTime: "اختر الوقت",
                availableSlots: "المواعيد المتاحة",
                noSlots: "لا توجد مواعيد متاحة لهذا التاريخ",
                confirmBooking: "تأكيد الحجز",
                bookingConfirmed: "تم حجز الموعد بنجاح!",
                bookingFailed: "فشل حجز الموعد. يرجى المحاولة مرة أخرى.",
                patientNotes: "ملاحظات للطبيب (اختياري)",
                patientNotesPlaceholder: "صف أعراضك أو سبب الزيارة...",
                back: "رجوع",
                booking: "جاري الحجز...",
            },
        },
        consultation: {
            inProgress: "الاستشارة جارية",
            endCall: "إنهاء المكالمة",
            endTitle: "إنهاء الاستشارة؟",
            endMessage: "هل أنت متأكد من إنهاء هذه الاستشارة؟ لا يمكن التراجع عن هذا الإجراء.",
            justLeave: "مغادرة فقط",
            endAndComplete: "إنهاء وإكمال",
            joining: "جاري الانضمام للاستشارة...",
            waitingForDoctor: "في انتظار الطبيب لبدء الاستشارة",
            sessionEnded: "انتهت هذه الاستشارة",
            returnToAppointments: "العودة للمواعيد",
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
                awaitingReview: "بانتظار المراجعة",
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
            activity: {
                registration: "تسجيل طبيب جديد",
                payment: "تم استلام الدفعة",
                appointment: "أكمل المريض الموعد",
                approval: "تمت الموافقة على حساب الطبيب",
            },
            actionDesc: {
                registerDoctor: "تسجيل طبيب جديد",
                registerPatient: "تسجيل مريض جديد",
                analytics: "تحليلات المنصة",
                config: "تكوين النظام",
            },
            system: {
                allOperational: "جميع الأنظمة تعمل",
                lastChecked: "آخر فحص قبل دقيقتين",
                uptime: "وقت التشغيل",
                satisfaction: "رضا المستخدمين",
                sessions: "جلسات نشطة",
            },
            usersPage: {
                title: "إدارة المستخدمين",
                subtitle: "إدارة جميع المستخدمين في المنصة",
                addUser: "إضافة مستخدم",
                searchPlaceholder: "البحث عن المستخدمين...",
                stats: {
                    totalUsers: "إجمالي المستخدمين",
                    doctors: "الأطباء",
                    patients: "المرضى",
                    admins: "المسؤولين"
                },
                filters: {
                    all: "الكل",
                    doctor: "طبيب",
                    patient: "مريض",
                    admin: "مشرف",
                    active: "نشط",
                    pending: "معلق",
                    inactive: "غير نشط"
                },
                table: {
                    role: "الدور",
                    status: "الحالة",
                    joined: "تاريخ الانضمام"
                }
            },
            doctorsPage: {
                title: "إدارة الأطباء",
                subtitle: "إدارة حسابات الأطباء والموافقة عليها",
                addDoctor: "إضافة طبيب",
                searchPlaceholder: "البحث عن الأطباء بالاسم أو التخصص...",
                stats: {
                    totalDoctors: "إجمالي الأطباء",
                    active: "نشط",
                    pending: "معلق",
                    revenue: "الإيرادات"
                },
                filters: {
                    all: "الكل",
                    active: "نشط",
                    pending: "معلق",
                    inactive: "غير نشط"
                },
                card: {
                    patients: "المرضى",
                    consults: "الاستشارات",
                    revenue: "الإيرادات",
                    viewProfile: "عرض الملف الشخصي",
                    approve: "موافقة"
                }
            },
            patientsPage: {
                title: "إدارة المرضى",
                subtitle: "عرض وإدارة حسابات المرضى",
                addPatient: "إضافة مريض",
                searchPlaceholder: "البحث عن المرضى بالاسم أو البريد الإلكتروني أو الطبيب...",
                stats: {
                    totalPatients: "إجمالي المرضى",
                    active: "نشط",
                    newThisMonth: "جديد هذا الشهر",
                    avgAppointments: "متوسط المواعيد"
                },
                filters: {
                    all: "الكل",
                    active: "نشط",
                    inactive: "غير نشط"
                },
                card: {
                    age: "العمر",
                    visits: "الزيارات",
                    primaryDoctor: "الطبيب المعالج",
                    lastVisit: "آخر زيارة",
                    viewRecords: "عرض السجلات"
                }
            },
            analyticsPage: {
                title: "التحليلات والتقارير",
                subtitle: "أداء المنصة والرؤى",
                periods: {
                    week: "أسبوع",
                    month: "شهر",
                    year: "سنة"
                },
                stats: {
                    revenue: "إجمالي الإيرادات",
                    users: "إجمالي المستخدمين",
                    appointments: "المواعيد",
                    session: "متوسط الجلسة"
                },
                charts: {
                    revenue: "نظرة عامة على الإيرادات (ألف جنيه)",
                    traffic: "مصادر الزيارات"
                },
                traffic: {
                    direct: "مباشر",
                    referral: "إحالة",
                    social: "وسائل التواصل",
                    search: "بحث"
                },
                table: {
                    title: "أفضل الأطباء أداءً",
                    rank: "الترتيب",
                    doctor: "الطبيب",
                    specialty: "التخصص",
                    patients: "المرضى",
                    revenue: "الإيرادات"
                }
            },
            settingsPage: {
                title: "إعدادات النظام",
                subtitle: "تكوين تفضيلات وميزات المنصة",
                save: "حفظ التغييرات",
                saved: "تم الحفظ!",
                sections: {
                    general: "الإعدادات العامة",
                    security: "إعدادات الأمان",
                    notifications: "الإشعارات",
                    payment: "إعدادات الدفع",
                    info: "معلومات المنصة"
                },
                items: {
                    maintenance: { label: "وضع الصيانة", desc: "تمكين لعرض صفحة الصيانة للمستخدمين" },
                    registration: { label: "تسجيل المستخدمين", desc: "السماح للمستخدمين الجدد بالتسجيل في المنصة" },
                    doctorApproval: { label: "الموافقة التلقائية للطبيب", desc: "الموافقة التلقائية على تسجيلات الأطباء الجديدة" },
                    emailNotifications: { label: "إشعارات البريد الإلكتروني", desc: "إرسال إشعارات البريد الإلكتروني لأحداث المنصة" },
                    twoFactor: { label: "المصادقة الثنائية", desc: "تطلب المصادقة الثنائية لجميع حسابات المسؤولين" },
                    sessionTimeout: { label: "مهلة الجلسة", desc: "تسجيل خروج المستخدمين غير النشطين تلقائيًا بعد 30 دقيقة" },
                    ipWhitelist: { label: "القائمة البيضاء للـ IP", desc: "قصر الوصول الإداري على عناوين IP المدرجة في القائمة البيضاء فقط" },
                    auditLog: { label: "سجل التدقيق", desc: "سجل جميع إجراءات المسؤول لمراجعة الأمان" },
                    newUser: { label: "تنبيهات مستخدم جديد", desc: "إعلام عند تسجيل مستخدمين جدد" },
                    newDoctor: { label: "تسجيل طبيب", desc: "إعلام عندما ينتظر الأطباء الموافقة" },
                    paymentAlerts: { label: "تنبيهات الدفع", desc: "إعلام لمعاملات الدفع" },
                    systemAlerts: { label: "تنبيهات النظام", desc: "إشعارات النظام الحرجة" },
                    acceptPayments: { label: "قبول المدفوعات", desc: "تمكين معالجة الدفع على المنصة" },
                    refunds: { label: "المبالغ المستردة التلقائية", desc: "معالجة المبالغ المستردة للمواعيد الملغاة" },
                    invoices: { label: "إنشاء الفواتير", desc: "إنشاء فواتير PDF تلقائيًا" }
                },
                info: {
                    version: "الإصدار",
                    environment: "البيئة",
                    lastUpdated: "آخر تحديث",
                    dbStatus: "حالة قاعدة البيانات"
                }
            },
        },

    },
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationStrings;
    isRTL: boolean;
    formatNumber: (num: number | string) => string;
    formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Single localStorage key for language preference
const LANGUAGE_STORAGE_KEY = "tawari-app-language";

export function I18nProvider({ children, locale }: { children: React.ReactNode; locale: Language }) {
    const [language, setLanguageState] = useState<Language>(locale);

    // Initialize language from localStorage if available, sync with URL locale
    useEffect(() => {
        // Store current language in localStorage for persistence
        localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
        setLanguageState(locale);

        // Ensure document direction is set correctly
        document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        document.documentElement.setAttribute("lang", locale);
    }, [locale]);

    const setLanguage = (lang: Language) => {
        // Store in localStorage for immediate access
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

        // Set cookie for middleware (server-side)
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;

        // Navigate to the new language path
        const currentPath = window.location.pathname;
        const segments = currentPath.split('/');

        // segments[0] is empty, segments[1] is 'en' or 'ar' usually
        if (segments[1] === 'en' || segments[1] === 'ar') {
            segments[1] = lang;
            window.location.href = segments.join('/');
        } else {
            // Fallback if path doesn't have lang prefix
            window.location.href = `/${lang}${currentPath}`;
        }
    };

    const formatNumber = (num: number | string): string => {
        if (!num && num !== 0) return "";
        const str = num.toString();
        if (language === "ar") {
            return str.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
        }
        return str;
    };

    const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
        if (!date) return "";
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return date.toString(); // Return original if invalid date

            const defaultOptions: Intl.DateTimeFormatOptions = {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            };

            return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', options || defaultOptions).format(d);
        } catch {
            return date.toString();
        }
    };

    const value: I18nContextType = {
        language,
        setLanguage,
        t: translations[language],
        isRTL: language === "ar",
        formatNumber,
        formatDate,
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
