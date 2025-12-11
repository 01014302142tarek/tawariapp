"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

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
    },
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationStrings;
    isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        // Check localStorage for saved preference
        const saved = localStorage.getItem("tawari-lang") as Language;
        if (saved && (saved === "en" || saved === "ar")) {
            setLanguage(saved);
        }
    }, []);

    useEffect(() => {
        // Save preference and update document direction
        localStorage.setItem("tawari-lang", language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }, [language]);

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
