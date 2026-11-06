"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import DoctorsCarousel from "@/components/landing/DoctorsCarousel";
import { Logo } from "@/components/ui/Logo";

// Tabibi Sapphire & Gold Logo Component with Rotating Coral Rope Border
const LogoFull = ({ className = "", isDark = true }: { className?: string; isDark?: boolean }) => (
  <Logo className={className} isDark={isDark} withMovingBorder={true} />
);

// Professional SVG Icons
const Icons = {
  menu: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  close: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  check: <svg className="w-5 h-5 text-[#FD614B]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>,
  star: <svg className="w-4 h-4 text-[#FD614B]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  starEmpty: <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  play: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
  arrow: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
  arrowLeft: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8l-4 4m0 0l4 4m-4-4h18" /></svg>,
  chevron: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  search: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  calendar: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  video: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  doctor: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  patients: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  consultation: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  rating: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  verified: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  prescription: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  payment: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  globe: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  heart: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  language: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
};

// Specialty Icons Map
const SpecialtyIcons: Record<string, React.ReactNode> = {
  general: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 12.75l6 6 9-13.5M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3" />
    </svg>
  ),
  cardiology: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  pediatrics: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
    </svg>
  ),
  mental: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" />
    </svg>
  ),
  dermatology: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  nutrition: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2.25m0 0a4.5 4.5 0 00-4.5 4.5v1.5a4.5 4.5 0 009 0v-1.5a4.5 4.5 0 00-4.5-4.5zM3.75 13.5A8.25 8.25 0 0012 21.75a8.25 8.25 0 008.25-8.25" />
    </svg>
  ),
};

// Stats icons
const statsIcons = [Icons.doctor, Icons.patients, Icons.consultation, Icons.rating];

// Why Us icons
const whyUsIcons = [Icons.verified, Icons.prescription, Icons.payment, Icons.globe];

// Doctor data - 8 distinguished doctors with diverse specialties
const doctors = [
  {
    name: "Dr. Aisha Khan",
    nameAr: "د. عائشة خان",
    specialty: "Cardiology",
    specialtyAr: "أمراض القلب والأوعية الدموية",
    experience: "12",
    rating: 5.0,
    reviews: 248,
    fee: 350,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    available: false
  },
  {
    name: "Dr. Omar Al-Fayed",
    nameAr: "د. عمر الفايد",
    specialty: "General Physician",
    specialtyAr: "طب عام واستشارات طوارئ",
    experience: "15",
    rating: 5.0,
    reviews: 312,
    fee: 300,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
    available: false
  },
  {
    name: "Dr. Layla Ahmed",
    nameAr: "د. ليلى أحمد",
    specialty: "Pediatrics",
    specialtyAr: "طب الأطفال وحديثي الولادة",
    experience: "10",
    rating: 5.0,
    reviews: 195,
    fee: 280,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    available: false
  },
  {
    name: "Dr. Mohamed Ibrahim",
    nameAr: "د. محمد إبراهيم",
    specialty: "Dermatology",
    specialtyAr: "جلدية وتجميل وعلاج بالليزر",
    experience: "14",
    rating: 5.0,
    reviews: 280,
    fee: 320,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    available: false
  },
  {
    name: "Dr. Sarah Mansour",
    nameAr: "د. سارة منصور",
    specialty: "Neurology & Mental Health",
    specialtyAr: "مخ وأعصاب واستشارات نفسية",
    experience: "11",
    rating: 5.0,
    reviews: 215,
    fee: 380,
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face",
    available: false
  },
  {
    name: "Dr. Tarek El-Kady",
    nameAr: "د. طارق القاضي",
    specialty: "Orthopedic Surgery",
    specialtyAr: "جراحة العظام والمفاصل",
    experience: "16",
    rating: 5.0,
    reviews: 340,
    fee: 340,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
    available: false
  },
  {
    name: "Dr. Reem Hassan",
    nameAr: "د. ريم حسن",
    specialty: "Clinical Nutrition",
    specialtyAr: "التغذية العلاجية وإدارة الوزن",
    experience: "9",
    rating: 5.0,
    reviews: 178,
    fee: 260,
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face",
    available: false
  },
  {
    name: "Dr. Khaled Mostafa",
    nameAr: "د. خالد مصطفى",
    specialty: "Ophthalmology",
    specialtyAr: "طب وجراحة العيون والليزر",
    experience: "18",
    rating: 5.0,
    reviews: 410,
    fee: 360,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    available: false
  }
];

// Testimonial data
const testimonials = [
  { name: "Nour E.", nameAr: "نور", location: "Cairo", locationAr: "القاهرة", rating: 5, text: "Saved me a trip to the hospital late at night. The pediatrician was very professional and calming.", textAr: "وفرت عليّ رحلة للمستشفى في وقت متأخر من الليل. كان طبيب الأطفال محترفًا جدًا ومطمئنًا.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  { name: "Karim M.", nameAr: "كريم", location: "Alexandria", locationAr: "الإسكندرية", rating: 5, text: "The app is so easy to use. I got my prescription immediately after the call.", textAr: "التطبيق سهل الاستخدام جدًا. حصلت على الوصفة الطبية مباشرة بعد المكالمة.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { name: "Fatma H.", nameAr: "فاطمة", location: "Giza", locationAr: "الجيزة", rating: 5, text: "As a working mother, Tabibi is a lifesaver. I can consult a doctor during my lunch break.", textAr: "كأم عاملة، طبيبي منقذ للحياة. يمكنني استشارة طبيب أثناء استراحة الغداء.", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
];

// Animated counter
function AnimatedCounter({ target }: { target: string }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(target.replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) { setCount(numericValue); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue]);

  const formatNumber = (num: number) => num >= 1000 ? `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K` : num.toString();
  return <span>{target.includes('+') ? `${formatNumber(count)}+` : target.includes('/') ? target : formatNumber(count)}</span>;
}

// Theme Toggle Button
function ThemeToggle() {
  const { toggleTheme, isDark } = useGlobalTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isDark
        ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-[#FD614B]'
        : 'bg-[#044C87] hover:bg-[#033a68] border border-[#044C87] text-white shadow-sm'
        }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="white" viewBox="0 0 24 24">
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

// Language Toggle Button
function LanguageToggle() {
  const { language, setLanguage } = useI18n();
  const { isDark } = useGlobalTheme();
  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isDark
        ? 'bg-white/5 hover:bg-white/10 border border-white/10'
        : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
        }`}
    >
      {Icons.language}
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}

export default function LandingPage() {
  return <LandingPageContent />;
}

function LandingPageContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNavIdx, setHoveredNavIdx] = useState<number | null>(null);
  const [clickedNavIdx, setClickedNavIdx] = useState<number | null>(null);
  const { t, isRTL, language } = useI18n();
  const { isDark } = useGlobalTheme();

  const navItems = [
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#specialties", label: t.nav.specialties },
    { href: "#doctors", label: t.nav.doctors },
    { href: "#for-doctors", label: t.nav.forDoctors },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, idx: number) => {
    setClickedNavIdx(idx);
    setTimeout(() => setClickedNavIdx(null), 300);
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        const navOffset = 85;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navOffset,
          behavior: "smooth",
        });
      }
    }
  };

  const mainSpecialties = [
    { key: 'general', nameEn: 'General Medicine', nameAr: 'طب عام', icon: SpecialtyIcons.general },
    { key: 'cardiology', nameEn: 'Cardiology', nameAr: 'أمراض القلب', icon: SpecialtyIcons.cardiology },
    { key: 'pediatrics', nameEn: 'Pediatrics', nameAr: 'طب الأطفال', icon: SpecialtyIcons.pediatrics },
    { key: 'mental', nameEn: 'Mental Health', nameAr: 'الصحة النفسية', icon: SpecialtyIcons.mental },
    { key: 'dermatology', nameEn: 'Dermatology', nameAr: 'جلدية وتجميل', icon: SpecialtyIcons.dermatology },
    { key: 'nutrition', nameEn: 'Nutrition', nameAr: 'التغذية العلاجية', icon: SpecialtyIcons.nutrition },
  ];

  // Theme-aware class helpers - Azure Navy & Coral Red Theme
  const bgMain = isDark ? 'bg-[#031326]' : 'bg-[#F4F8FC]';
  const bgSection = isDark ? 'bg-[#031326]' : 'bg-white';
  const bgSectionAlt = isDark ? 'bg-gradient-to-b from-[#031326] via-[#061D38] to-[#031326]' : 'bg-gradient-to-b from-[#F4F8FC] to-[#EBF3FA]';
  const textPrimary = isDark ? 'text-[#FEFDFE]' : 'text-[#042642]';
  const textSecondary = isDark ? 'text-[#CBD5E1]' : 'text-[#334E68]';
  const textMuted = isDark ? 'text-[#94A3B8]' : 'text-[#627D98]';
  const borderColor = isDark ? 'border-[#044C87]/35' : 'border-[#D0E1F0]';
  const navBg = isDark ? 'bg-[#031326]/90' : 'bg-[#F4F8FC]/92';

  // Glowing card styles - Azure Navy & Coral
  const glowCardClass = isDark
    ? 'bg-[#08213D]/85 border border-[#044C87]/40 hover:border-[#FD614B]/70 hover:shadow-[0_0_25px_rgba(253,97,75,0.25)] hover:bg-[#0B2C52]'
    : 'bg-white border-2 border-[#D0E1F0] shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-[#FD614B]/20 hover:border-[#FD614B]';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} overflow-x-hidden transition-colors duration-300 ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${navBg} backdrop-blur-xl border-b ${borderColor} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity">
              <LogoFull isDark={isDark} />
            </Link>

            {/* Desktop Navigation Links with Spring Pill & Click Ripple */}
            <div
              className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] dark:bg-white/[0.04] border border-white/[0.08] backdrop-blur-md relative"
              onMouseLeave={() => setHoveredNavIdx(null)}
            >
              {navItems.map((item, idx) => {
                const isHovered = hoveredNavIdx === idx;

                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href, idx)}
                    onMouseEnter={() => setHoveredNavIdx(idx)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    className={cn(
                      "relative px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 select-none cursor-pointer flex items-center justify-center",
                      isHovered
                        ? (isDark ? "text-white" : "text-[#08213D]")
                        : (isDark ? "text-[#CBD5E1] hover:text-white" : "text-[#334E68] hover:text-[#042642]")
                    )}
                  >
                    {/* Liquid Sliding Pill Background */}
                    {isHovered && (
                      <motion.span
                        layoutId="nav-sliding-pill"
                        className={cn(
                          "absolute inset-0 rounded-full -z-10",
                          isDark
                            ? "bg-gradient-to-r from-white/[0.08] via-white/[0.13] to-white/[0.08] border border-white/15 shadow-[0_0_15px_rgba(253,97,75,0.22)]"
                            : "bg-white border border-[#044C87]/15 shadow-sm"
                        )}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 28,
                        }}
                      />
                    )}

                    {/* Micro Coral Glow Accent on Hover */}
                    {isHovered && (
                      <motion.span
                        layoutId="nav-bottom-glow"
                        className="absolute bottom-1 w-4 h-0.5 rounded-full bg-[#FD614B] shadow-[0_0_8px_#FD614B]"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 28,
                        }}
                      />
                    )}

                    <span className="relative z-10">{item.label}</span>
                  </motion.a>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle />
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                <Link href={`/${language}/login`} className={`${textSecondary} hover:${textPrimary} font-medium text-sm px-4 py-2 transition-colors inline-block`}>{t.nav.login}</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                <Link href={`/${language}/get-started`} className="inline-block bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-[#FD614B]/30">{t.nav.getStarted}</Link>
              </motion.div>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <button className={`p-2 ${textSecondary} hover:${textPrimary}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? Icons.close : Icons.menu}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className={`lg:hidden py-4 border-t ${borderColor}`}>
              <div className="flex flex-col gap-2">
                {navItems.map((item, idx) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleNavClick(e, item.href, idx);
                    }}
                    whileTap={{ scale: 0.96, x: isRTL ? -4 : 4 }}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-base font-medium transition-colors select-none",
                      textSecondary,
                      "hover:text-[#FD614B] hover:bg-white/5 active:bg-white/10"
                    )}
                  >
                    {item.label}
                  </motion.a>
                ))}
                <div className={`flex flex-col gap-3 pt-4 border-t ${borderColor}`}>
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <LanguageToggle />
                    <Link href={`/${language}/login`} onClick={() => setMobileMenuOpen(false)} className={`${textSecondary} hover:${textPrimary} font-medium text-sm px-4 py-2 transition-colors`}>{t.nav.login}</Link>
                  </div>
                  <Link href={`/${language}/get-started`} onClick={() => setMobileMenuOpen(false)} className="bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-semibold px-5 py-2 rounded-full text-center shadow-md shadow-[#FD614B]/30">{t.nav.getStarted}</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background & Azure/Coral Light Waves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#061D38] via-[#031326] to-[#020B16]' : 'bg-gradient-to-br from-blue-50 via-white to-white'}`} />
          <div className={`absolute top-1/4 -right-1/4 w-[800px] h-[800px] ${isDark ? 'bg-[#044C87]/20' : 'bg-blue-200/30'} rounded-full blur-3xl`} />
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#0C67B3]/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-[#FD614B]/10 rounded-full blur-3xl" />

          {/* Sweeping Light Ribbon Wave */}
          <svg className="absolute top-10 left-0 w-full h-[650px] opacity-35" viewBox="0 0 1440 650" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 280C300 120 700 500 1150 220C1320 110 1520 300 1600 240" stroke="url(#heroBlueStreak1)" strokeWidth="3" />
            <path d="M-100 290C320 140 720 520 1170 240C1340 130 1540 320 1600 260" stroke="url(#heroBlueStreak2)" strokeWidth="1.5" strokeOpacity="0.6" />
            <defs>
              <linearGradient id="heroBlueStreak1" x1="0" y1="0" x2="1440" y2="400" gradientUnits="userSpaceOnUse">
                <stop stopColor="#044C87" stopOpacity="0" />
                <stop offset="0.3" stopColor="#0C67B3" stopOpacity="0.9" />
                <stop offset="0.6" stopColor="#38BDF8" stopOpacity="0.95" />
                <stop offset="1" stopColor="#044C87" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="heroBlueStreak2" x1="0" y1="0" x2="1440" y2="400" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FD614B" stopOpacity="0" />
                <stop offset="0.5" stopColor="#FF8270" stopOpacity="0.8" />
                <stop offset="1" stopColor="#E84D37" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className={`text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <div className={`inline-flex items-center gap-2 ${isDark ? 'bg-[#044C87]/20 border-[#044C87]/40 text-[#38BDF8]' : 'bg-blue-50 border-blue-200 text-[#044C87]'} border px-4 py-2 rounded-full mb-6`}>
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FD614B] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#FD614B]"></span></span>
                <span className="text-sm font-medium">{t.hero.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight mb-6">
                <span className={isDark ? "text-white drop-shadow-[0_2px_20px_rgba(4,76,135,0.4)]" : "text-slate-900 drop-shadow-sm"}>
                  {isRTL ? "استشر طبيبك من البيت" : "Consult Your Doctor from Home"}
                </span>
              </h1>

              <p className={`text-base sm:text-lg ${isDark ? 'text-blue-100/75' : 'text-slate-600'} mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal`}>
                {isRTL 
                  ? "رعاية صحية موثوقة وفورية في أي وقت ومن أي مكان. طبيبي يمنحك وصولاً مباشراً لأفضل الاستشاريين المعتمدين." 
                  : "Tabibi offers exclusive access to world-class medical specialists 24/7. Connect instantly via secure video consultations from the comfort of your home."}
              </p>

              <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'} mb-10`}>
                <Link 
                  href={`/${language}/register`} 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg text-white bg-gradient-to-r from-[#FD614B] via-[#FF7461] to-[#FD614B] hover:from-[#E84D37] hover:to-[#FD614B] border border-[#FD614B]/60 shadow-[0_0_30px_rgba(253,97,75,0.55)] hover:shadow-[0_0_45px_rgba(253,97,75,0.8)] hover:scale-105 transition-all duration-300"
                >
                  {isRTL ? "ابدأ الآن" : "Start Now"}
                  {isRTL ? Icons.arrowLeft : Icons.arrow}
                </Link>
                <Link href="#how-it-works" className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 ${isDark ? 'bg-[#08213D]/80 hover:bg-[#0D2C4F] border-[#044C87]/50 text-white' : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-[#044C87]'} border font-semibold text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition-colors`}>
                  {Icons.play}
                  {t.hero.ctaSecondary}
                </Link>
              </div>

              <div className={`flex flex-wrap items-center justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'} gap-6`}>
                {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((text, idx) => (
                  <div key={idx} className={`flex items-center gap-2 ${textSecondary}`}>{Icons.check}<span className="text-sm">{text}</span></div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className={`absolute -top-4 -right-4 w-24 h-24 ${isDark ? 'bg-blue-500/20' : 'bg-blue-300/30'} rounded-2xl blur-xl`} />
                <div className={`absolute -bottom-4 -left-4 w-32 h-32 ${isDark ? 'bg-[#044C87]/20' : 'bg-blue-200/40'} rounded-2xl blur-xl`} />
                <div className={`relative w-full h-full rounded-3xl overflow-hidden border-2 ${isDark ? 'border-blue-500/40 shadow-[0_0_35px_rgba(37,99,235,0.3)]' : 'border-blue-500/20 shadow-2xl shadow-blue-500/10'}`}>
                  <Image src="/hero-doctor-telehealth.png" alt="Doctor consultation" fill className="object-cover" priority />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Doctors - Our Distinguished Doctors */}
      <section id="doctors" className="py-12 lg:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Golden Accent Bar */}
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="w-1.5 h-6 sm:h-7 bg-[#FD614B] rounded-full inline-block shrink-0 shadow-[0_0_12px_rgba(253,97,75,0.6)]" />
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textPrimary} tracking-wide truncate sm:whitespace-normal`}>
                {isRTL ? "أطباؤنا المتميزون" : "Our Distinguished Doctors"}
              </h2>
            </div>
            <Link href={`/${language}/doctors`} className={`text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap ${isDark ? "text-blue-400 hover:text-[#FD614B]" : "text-[#044C87] hover:text-[#FD614B]"}`}>
              {isRTL ? "عرض الكل" : "View All"}
              {Icons.chevron}
            </Link>
          </div>

          {/* Dynamic Auto-Scrolling Doctors Carousel */}
          <DoctorsCarousel doctors={doctors} isRTL={isRTL} language={language} />
        </div>
      </section>

      {/* Specialties - Medical Specialties */}
      <section id="specialties" className="py-12 lg:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Coral Accent Bar */}
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="w-1.5 h-6 sm:h-7 bg-[#FD614B] rounded-full inline-block shrink-0 shadow-[0_0_12px_rgba(253,97,75,0.6)]" />
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textPrimary} tracking-wide truncate sm:whitespace-normal`}>
                {isRTL ? "التخصصات الطبية" : "Medical Specialties"}
              </h2>
            </div>
            <Link href={`/${language}/doctors`} className={`text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap ${isDark ? "text-blue-400 hover:text-[#FD614B]" : "text-[#044C87] hover:text-[#FD614B]"}`}>
              {isRTL ? "عرض الكل" : "View All"}
              {Icons.chevron}
            </Link>
          </div>

          {/* Capsule/Pill Grid matching the user's mockup */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {mainSpecialties.map((spec) => (
              <Link
                key={spec.key}
                href={`/${language}/doctors?specialty=${spec.key}`}
                className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-full transition-all group cursor-pointer hover:-translate-y-0.5 min-w-0 ${
                  isDark
                    ? "bg-[#08213D]/90 hover:bg-[#0C2E54] border border-[#044C87]/50 hover:border-[#FD614B]/60 shadow-[0_0_14px_rgba(4,76,135,0.25)] hover:shadow-[0_0_22px_rgba(253,97,75,0.3)]"
                    : "bg-white hover:bg-blue-50/70 border border-[#D0E1F0] hover:border-[#FD614B] shadow-sm hover:shadow-md"
                }`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  isDark
                    ? "bg-[#044C87]/30 border border-[#044C87]/40 text-[#38BDF8] group-hover:bg-[#FD614B] group-hover:text-white"
                    : "bg-blue-50 border border-blue-200 text-[#044C87] group-hover:bg-[#FD614B] group-hover:text-white"
                }`}>
                  {spec.icon}
                </div>
                <span className={`text-xs sm:text-sm font-semibold truncate ${isDark ? "text-[#FEFDFE]" : "text-slate-800"}`}>
                  {isRTL ? spec.nameAr : spec.nameEn}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 border-y ${borderColor} ${bgSection} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[{ n: "500+", l: t.stats.doctors }, { n: "10,000+", l: t.stats.patients }, { n: "25,000+", l: t.stats.consultations }, { n: "4.9/5", l: t.stats.rating }].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0284C7] shadow-[0_0_18px_rgba(14,165,233,0.55)] border border-sky-300/40 flex items-center justify-center text-white mx-auto mb-3">
                  {statsIcons[idx]}
                </div>
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${textPrimary} mb-1`}><AnimatedCounter target={stat.n} /></div>
                <div className={textSecondary + " text-sm"}>{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={`py-20 lg:py-28 ${bgSection} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">{t.howItWorks.badge}</span>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 ${textPrimary}`}>{t.howItWorks.title} <span className="text-blue-400">{t.howItWorks.titleHighlight}</span></h2>
            <p className={`${textSecondary} text-lg mt-4 max-w-2xl mx-auto`}>{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, icon: Icons.search },
              { title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, icon: Icons.calendar },
              { title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, icon: Icons.video },
            ].map((item, idx) => (
              <div key={idx} className={`group relative rounded-3xl p-8 transition-all ${glowCardClass}`}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.55)] border border-blue-300/40 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${textPrimary}`}>{item.title}</h3>
                <p className={`${textSecondary} leading-relaxed`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Tabibi */}
      <section className={`py-20 lg:py-28 ${bgSectionAlt} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">{t.whyUs.badge}</span>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 ${textPrimary}`}>{t.whyUs.title} <span className="text-blue-400">{t.whyUs.titleHighlight}</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: t.whyUs.item1Title, desc: t.whyUs.item1Desc },
              { title: t.whyUs.item2Title, desc: t.whyUs.item2Desc },
              { title: t.whyUs.item3Title, desc: t.whyUs.item3Desc },
              { title: t.whyUs.item4Title, desc: t.whyUs.item4Desc },
            ].map((item, idx) => (
              <div key={idx} className={`rounded-2xl p-6 text-center transition-all ${glowCardClass}`}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_18px_rgba(37,99,235,0.55)] border border-blue-300/40 flex items-center justify-center text-white mx-auto mb-4">
                  {whyUsIcons[idx]}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>{item.title}</h3>
                <p className={`${textSecondary} text-sm leading-relaxed`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 lg:py-28 ${bgSection} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">{t.testimonials.badge}</span>
            <h2 className={`text-3xl sm:text-4xl font-bold mt-3 ${textPrimary}`}>{t.testimonials.title}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className={`rounded-2xl p-6 transition-all ${isDark ? 'bg-gradient-to-br from-[#0B152B]/90 to-[#070D1E]/90 border border-blue-500/30' : 'bg-white border-2 border-blue-200 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/60 hover:border-blue-400'}`}>
                <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map((star) => <span key={star}>{star <= testimonial.rating ? Icons.star : Icons.starEmpty}</span>)}</div>
                <p className={`${isDark ? 'text-blue-100/80' : 'text-slate-600'} leading-relaxed mb-6`}>&ldquo;{isRTL ? testimonial.textAr : testimonial.text}&rdquo;</p>
                <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? 'border-blue-900/40' : 'border-blue-100'}`}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-400/50"><Image src={testimonial.image} alt={isRTL ? testimonial.nameAr : testimonial.name} fill className="object-cover" unoptimized /></div>
                  <div>
                    <p className={`font-semibold ${textPrimary}`}>{isRTL ? testimonial.nameAr : testimonial.name}</p>
                    <p className={`text-sm ${textMuted}`}>{isRTL ? testimonial.locationAr : testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Doctors CTA */}
      <section id="for-doctors" className={`py-20 lg:py-28 ${isDark ? 'bg-gradient-to-br from-[#060B18] to-[#0A132C]' : 'bg-gradient-to-br from-blue-50 to-white'} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">{t.forDoctors.badge}</span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-6 ${textPrimary}`}>{t.forDoctors.title} <span className="text-blue-400">{t.forDoctors.titleHighlight}</span></h2>
              <p className={`${textSecondary} text-lg mb-8`}>{t.forDoctors.subtitle}</p>

              <div className="space-y-4 mb-8">
                {[t.forDoctors.benefit1, t.forDoctors.benefit2, t.forDoctors.benefit3, t.forDoctors.benefit4, t.forDoctors.benefit5].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span className={isDark ? 'text-gray-300' : 'text-slate-600'}>{benefit}</span>
                  </div>
                ))}
              </div>

              <Link href={`/${language}/doctor-onboarding`} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30">
                {t.forDoctors.cta}
                {isRTL ? Icons.arrowLeft : Icons.arrow}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {[
                { number: "50+", label: t.forDoctors.stat1, sublabel: t.forDoctors.stat1Sub },
                { number: "25K+", label: t.forDoctors.stat2, sublabel: t.forDoctors.stat2Sub },
                { number: "4.9", label: t.forDoctors.stat3, sublabel: t.forDoctors.stat3Sub },
                { number: isRTL ? "٥٠ ألف+" : "EGP 50K+", label: t.forDoctors.stat4, sublabel: t.forDoctors.stat4Sub },
              ].map((stat, idx) => (
                <div key={idx} className={`rounded-2xl p-4 sm:p-6 text-center transition-all ${isDark ? 'bg-[#0B152B]/85 border border-blue-500/30' : 'bg-white border-2 border-blue-200 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/60 hover:border-blue-400'}`}>
                  <div className="text-2xl sm:text-3xl font-black text-[#FD614B] mb-1">{stat.number}</div>
                  <div className={`${textPrimary} font-medium text-sm`}>{stat.label}</div>
                  <div className={`${textMuted} text-xs`}>{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`py-20 px-4 ${bgSection}`}>
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#044C87] via-[#033660] to-[#021A30] border border-[#FD614B]/40 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-[#044C87]/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 text-white">{t.cta.title}</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">{t.cta.subtitle}</p>
              <Link href={`/${language}/register`} className="inline-flex items-center gap-2 bg-[#FD614B] hover:bg-[#E84D37] text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all transform hover:scale-105 shadow-xl hover:shadow-[0_0_30px_rgba(253,97,75,0.6)]">
                {t.cta.button}
                {isRTL ? Icons.arrowLeft : Icons.arrow}
              </Link>
              <p className="text-[#CBD5E1] text-sm mt-4 font-medium">{t.cta.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-[#020B16]' : 'bg-[#F4F8FC]'} border-t ${borderColor} py-16 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-1">
              <Link href={`/${language}`} className="block mb-6 group hover:opacity-90 transition-opacity">
                <LogoFull isDark={isDark} />
              </Link>
              <p className={`${textMuted} text-sm mb-6 max-w-xs`}>{t.footer.tagline}</p>
            </div>
            <div>
              <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.forPatients}</h4>
              <div className="flex flex-col gap-3">
                <Link href={`/${language}#doctors`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.findDoctors}</Link>
                <Link href={`/${language}#how-it-works`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.howItWorks}</Link>
                <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.faq}</Link>
              </div>
            </div>
            <div>
              <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.forDoctorsTitle}</h4>
              <div className="flex flex-col gap-3">
                <Link href={`/${language}/doctor-onboarding`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.joinAsDoctor}</Link>
                <Link href={`/${language}/faq`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.doctorFaq}</Link>
              </div>
            </div>
            <div>
              <h4 className={`font-bold mb-4 ${textPrimary}`}>{t.footer.company}</h4>
              <div className="flex flex-col gap-3">
                <Link href={`/${language}/about`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.aboutUs}</Link>
                <Link href={`/${language}/contact`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.contact}</Link>
                <Link href={`/${language}/privacy`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.privacy}</Link>
                <Link href={`/${language}/terms`} className={`${textSecondary} text-sm hover:text-[#FD614B] transition-colors`}>{t.footer.terms}</Link>
              </div>
            </div>
          </div>

          <div className={`border-t ${borderColor} pt-8`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`text-xs ${textMuted}`}>{t.footer.paymentMethods}</span>
                <div className="flex gap-2">
                  <div className={`w-10 h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded flex items-center justify-center text-xs font-bold ${textSecondary}`}>VISA</div>
                  <div className={`w-10 h-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded flex items-center justify-center text-xs font-bold ${textSecondary}`}>MC</div>
                  <div className={`w-10 h-6 ${isDark ? 'bg-[#FD614B]/20' : 'bg-red-100'} rounded flex items-center justify-center text-xs font-bold text-[#FD614B]`}>VC</div>
                </div>
              </div>
              <p className={`text-xs ${textMuted}`}>{t.footer.copyright}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
