"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useI18n } from "./i18n";

// Custom Logo Component
const Logo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-500/20 transform rotate-3 hover:rotate-6 transition-transform"></div>
    <svg className="relative w-6 h-6 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" className="text-white/20 fill-white/10 stroke-none" />
      <path d="M3 13h2l2-5 4 10 3-8h7" className="stroke-white" />
    </svg>
    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#0F172A]"></div>
  </div>
);

// Professional SVG Icons
const Icons = {
  menu: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  close: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  check: <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>,
  star: <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
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
  general: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  pediatrics: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>,
  obgyn: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  internal: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  dermatology: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" /></svg>,
  mental: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  cardiology: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  orthopedics: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
};

// Stats icons
const statsIcons = [Icons.doctor, Icons.patients, Icons.consultation, Icons.rating];

// Why Us icons
const whyUsIcons = [Icons.verified, Icons.prescription, Icons.payment, Icons.globe];

// Doctor data
const doctors = [
  { name: "Dr. Ahmed Hassan", nameAr: "د. أحمد حسن", specialty: "Cardiologist", specialtyAr: "قلب", experience: "15", rating: 4.9, reviews: 234, fee: 300, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face", available: true },
  { name: "Dr. Sara Mahmoud", nameAr: "د. سارة محمود", specialty: "Pediatrician", specialtyAr: "أطفال", experience: "8", rating: 5.0, reviews: 189, fee: 250, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face", available: true },
  { name: "Dr. Omar Khaled", nameAr: "د. عمر خالد", specialty: "Dermatologist", specialtyAr: "جلدية", experience: "12", rating: 4.8, reviews: 156, fee: 280, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face", available: false },
  { name: "Dr. Mariam Nabil", nameAr: "د. مريم نبيل", specialty: "OB/GYN", specialtyAr: "نساء", experience: "10", rating: 4.9, reviews: 312, fee: 320, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face", available: true },
];

// Testimonial data
const testimonials = [
  { name: "Nour E.", nameAr: "نور", location: "Cairo", locationAr: "القاهرة", rating: 5, text: "Saved me a trip to the hospital late at night. The pediatrician was very professional and calming.", textAr: "وفرت عليّ رحلة للمستشفى في وقت متأخر من الليل. كان طبيب الأطفال محترفًا جدًا ومطمئنًا.", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  { name: "Karim M.", nameAr: "كريم", location: "Alexandria", locationAr: "الإسكندرية", rating: 5, text: "The app is so easy to use. I got my prescription immediately after the call.", textAr: "التطبيق سهل الاستخدام جدًا. حصلت على الوصفة الطبية مباشرة بعد المكالمة.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { name: "Fatma H.", nameAr: "فاطمة", location: "Giza", locationAr: "الجيزة", rating: 5, text: "As a working mother, TawariApp is a lifesaver. I can consult a doctor during my lunch break.", textAr: "كأم عاملة، تواري منقذ للحياة. يمكنني استشارة طبيب أثناء استراحة الغداء.", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face" },
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

// Language Toggle Button
function LanguageToggle() {
  const { language, setLanguage, isRTL } = useI18n();
  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
    >
      {Icons.language}
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, isRTL, language } = useI18n();
  const specialtyKeys = ['general', 'pediatrics', 'obgyn', 'internal', 'dermatology', 'mental', 'cardiology', 'orthopedics'] as const;

  return (
    <div className={`min-h-screen bg-[#0F172A] text-white overflow-x-hidden ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo />
              <span className="text-2xl font-bold tracking-tight group-hover:opacity-90 transition-opacity"><span className="text-teal-400">Tawari</span><span className="text-white">App</span></span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">{t.nav.howItWorks}</Link>
              <Link href="#specialties" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">{t.nav.specialties}</Link>
              <Link href="#doctors" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">{t.nav.doctors}</Link>
              <Link href="#for-doctors" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">{t.nav.forDoctors}</Link>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <LanguageToggle />
              <Link href="/login" className="text-gray-300 hover:text-white font-medium text-sm px-4 py-2 transition-colors">{t.nav.login}</Link>
              <Link href="/register" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-teal-500/25">{t.nav.getStarted}</Link>
            </div>

            <button className="lg:hidden p-2 text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? Icons.close : Icons.menu}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                <Link href="#how-it-works" className="text-gray-300 hover:text-teal-400 py-2">{t.nav.howItWorks}</Link>
                <Link href="#specialties" className="text-gray-300 hover:text-teal-400 py-2">{t.nav.specialties}</Link>
                <Link href="#doctors" className="text-gray-300 hover:text-teal-400 py-2">{t.nav.doctors}</Link>
                <Link href="#for-doctors" className="text-gray-300 hover:text-teal-400 py-2">{t.nav.forDoctors}</Link>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <LanguageToggle />
                  <Link href="/register" className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2 rounded-full flex-1 text-center">{t.nav.getStarted}</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]" />
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className={`text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-full mb-6">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span></span>
                <span className="text-teal-400 text-sm font-medium">{t.hero.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
                {t.hero.headline} <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">{t.hero.headlineHighlight}</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">{t.hero.subheadline}</p>

              <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'} mb-10`}>
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-lg px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-teal-500/30">
                  {t.hero.cta}
                  {isRTL ? Icons.arrowLeft : Icons.arrow}
                </Link>
                <Link href="#how-it-works" className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors">
                  {Icons.play}
                  {t.hero.ctaSecondary}
                </Link>
              </div>

              <div className={`flex flex-wrap items-center justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'} gap-6`}>
                {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-400">{Icons.check}<span className="text-sm">{text}</span></div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/20 rounded-2xl blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-500/20 rounded-2xl blur-xl" />
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10">
                  <Image src="/hero-doctor.png" alt="Doctor consultation" fill className="object-cover" priority />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[{ n: "500+", l: t.stats.doctors }, { n: "10,000+", l: t.stats.patients }, { n: "25,000+", l: t.stats.consultations }, { n: "4.9/5", l: t.stats.rating }].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-teal-400 flex justify-center mb-3">{statsIcons[idx]}</div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1"><AnimatedCounter target={stat.n} /></div>
                <div className="text-gray-400 text-sm">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">{t.howItWorks.badge}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">{t.howItWorks.title} <span className="text-teal-400">{t.howItWorks.titleHighlight}</span></h2>
            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc, icon: Icons.search, color: "from-teal-500 to-teal-600" },
              { step: "02", title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc, icon: Icons.calendar, color: "from-amber-500 to-amber-600" },
              { step: "03", title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc, icon: Icons.video, color: "from-purple-500 to-purple-600" },
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-[#1E293B]/50 border border-white/5 rounded-3xl p-8 transition-all hover:border-white/20 hover:bg-[#1E293B]">
                <div className="absolute -top-4 left-8 bg-[#0F172A] px-3 py-1 rounded-full border border-white/10"><span className="text-gray-500 text-sm font-mono">{item.step}</span></div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialties" className="py-20 lg:py-28 bg-gradient-to-b from-[#0F172A] to-[#1E293B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">{t.specialties.badge}</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">{t.specialties.title}</h2>
            </div>
            <Link href="/doctors" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors flex items-center gap-1">{t.specialties.viewAll}{Icons.chevron}</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialtyKeys.map((key) => (
              <Link key={key} href={`/doctors?specialty=${key}`} className="group flex flex-col items-center justify-center gap-3 bg-[#1E293B]/50 border border-white/5 rounded-2xl p-6 cursor-pointer transition-all hover:border-teal-500/50 hover:bg-[#1E293B] hover:shadow-lg hover:shadow-teal-500/10">
                <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all group-hover:scale-110">{SpecialtyIcons[key]}</div>
                <p className="font-semibold text-white text-center">{t.specialties[key as keyof typeof t.specialties]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section id="doctors" className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">{t.doctorsSection.badge}</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">{t.doctorsSection.title}</h2>
            </div>
            <Link href="/doctors" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors flex items-center gap-1">{t.doctorsSection.viewAll}{Icons.chevron}</Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.name} className="group bg-[#1E293B]/50 border border-white/5 rounded-2xl p-5 transition-all hover:border-teal-500/30 hover:bg-[#1E293B]">
                <div className="relative mb-4">
                  <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-teal-500/50 group-hover:border-teal-500 transition-colors">
                    <Image src={doctor.image} alt={isRTL ? doctor.nameAr : doctor.name} fill className="object-cover" unoptimized />
                  </div>
                  {doctor.available && (
                    <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />{t.doctorsSection.available}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white mb-1">{isRTL ? doctor.nameAr : doctor.name}</h3>
                  <p className="text-teal-400 text-sm font-medium mb-1">{isRTL ? doctor.specialtyAr : doctor.specialty}</p>
                  <p className="text-gray-500 text-xs mb-3">{doctor.experience} {t.doctorsSection.experience}</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <div className="flex">{[1, 2, 3, 4, 5].map((star) => <span key={star}>{star <= Math.floor(doctor.rating) ? Icons.star : Icons.starEmpty}</span>)}</div>
                    <span className="text-sm text-gray-400">({doctor.reviews})</span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-white font-bold mb-3">{doctor.fee} {isRTL ? 'جنيه' : 'EGP'} <span className="text-xs font-normal text-gray-500">{t.doctorsSection.session}</span></p>
                    <button className="w-full bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white font-semibold text-sm py-2.5 rounded-xl transition-all">{t.doctorsSection.bookNow}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TawariApp */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-[#0F172A] to-[#1E293B]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">{t.whyUs.badge}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">{t.whyUs.title} <span className="text-teal-400">{t.whyUs.titleHighlight}</span></h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: t.whyUs.item1Title, desc: t.whyUs.item1Desc },
              { title: t.whyUs.item2Title, desc: t.whyUs.item2Desc },
              { title: t.whyUs.item3Title, desc: t.whyUs.item3Desc },
              { title: t.whyUs.item4Title, desc: t.whyUs.item4Desc },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#1E293B]/30 border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-colors">
                <div className="text-teal-400 flex justify-center mb-4">{whyUsIcons[idx]}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">{t.testimonials.badge}</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">{t.testimonials.title}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-[#1E293B]/80 to-[#1E293B]/40 border border-white/5 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map((star) => <span key={star}>{star <= testimonial.rating ? Icons.star : Icons.starEmpty}</span>)}</div>
                <p className="text-gray-300 leading-relaxed mb-6">&ldquo;{isRTL ? testimonial.textAr : testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden"><Image src={testimonial.image} alt={isRTL ? testimonial.nameAr : testimonial.name} fill className="object-cover" unoptimized /></div>
                  <div>
                    <p className="font-semibold text-white">{isRTL ? testimonial.nameAr : testimonial.name}</p>
                    <p className="text-sm text-gray-500">{isRTL ? testimonial.locationAr : testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Doctors CTA */}
      <section id="for-doctors" className="py-20 lg:py-28 bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">{t.forDoctors.badge}</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-6">{t.forDoctors.title} <span className="text-amber-400">{t.forDoctors.titleHighlight}</span></h2>
              <p className="text-gray-400 text-lg mb-8">{t.forDoctors.subtitle}</p>

              <div className="space-y-4 mb-8">
                {[t.forDoctors.benefit1, t.forDoctors.benefit2, t.forDoctors.benefit3, t.forDoctors.benefit4, t.forDoctors.benefit5].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link href="/register/doctor" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-amber-500/25">
                {t.forDoctors.cta}
                {isRTL ? Icons.arrowLeft : Icons.arrow}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { number: "50+", label: t.forDoctors.stat1, sublabel: t.forDoctors.stat1Sub },
                { number: "25K+", label: t.forDoctors.stat2, sublabel: t.forDoctors.stat2Sub },
                { number: "4.9", label: t.forDoctors.stat3, sublabel: t.forDoctors.stat3Sub },
                { number: isRTL ? "٥٠ ألف+" : "EGP 50K+", label: t.forDoctors.stat4, sublabel: t.forDoctors.stat4Sub },
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#0F172A]/50 border border-white/5 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-amber-400 mb-1">{stat.number}</div>
                  <div className="text-white font-medium text-sm">{stat.label}</div>
                  <div className="text-gray-500 text-xs">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 md:p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4">{t.cta.title}</h2>
              <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">{t.cta.subtitle}</p>
              <Link href="/register" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold text-lg px-10 py-4 rounded-full transition-all transform hover:scale-105 shadow-xl">
                {t.cta.button}
                {isRTL ? Icons.arrowLeft : Icons.arrow}
              </Link>
              <p className="text-teal-200 text-sm mt-4">{t.cta.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1a] border-t border-white/5 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <Logo />
                <span className="text-2xl font-bold tracking-tight group-hover:opacity-90 transition-opacity"><span className="text-teal-400">Tawari</span><span className="text-white">App</span></span>
              </Link>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">{t.footer.tagline}</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t.footer.forPatients}</h4>
              <div className="flex flex-col gap-3">
                <Link href="/doctors" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.findDoctors}</Link>
                <Link href="/how-it-works" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.howItWorks}</Link>
                <Link href="/faq" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.faq}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t.footer.forDoctorsTitle}</h4>
              <div className="flex flex-col gap-3">
                <Link href="/register/doctor" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.joinAsDoctor}</Link>
                <Link href="/doctor-faq" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.doctorFaq}</Link>
                <Link href="/pricing" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.pricing}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t.footer.company}</h4>
              <div className="flex flex-col gap-3">
                <Link href="/about" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.aboutUs}</Link>
                <Link href="/contact" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.contact}</Link>
                <Link href="/privacy" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.privacy}</Link>
                <Link href="/terms" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">{t.footer.terms}</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">{t.footer.paymentMethods}</span>
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-gray-400">VISA</div>
                  <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-gray-400">MC</div>
                  <div className="w-10 h-6 bg-red-500/20 rounded flex items-center justify-center text-xs font-bold text-red-400">VC</div>
                </div>
              </div>
              <p className="text-xs text-gray-500">{t.footer.copyright}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
