"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

// Logo Component
const LogoFull = ({ className = "", isDark = true }: { className?: string; isDark?: boolean }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg className="h-10 w-10 flex-shrink-0" viewBox="0 0 100 90" fill="none">
            <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="50%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
            </defs>
            <path d="M50 85 C50 85 10 55 10 30 C10 15 22 5 35 5 C42 5 48 10 50 15 C52 10 58 5 65 5 C78 5 90 15 90 30 C90 55 50 85 50 85Z" fill="none" stroke="url(#heartGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 45 L25 45 L35 25 L50 65 L65 35 L75 45 L95 45" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xl font-bold tracking-tight">
            <span className={isDark ? "text-white" : "text-slate-900"}>Tawari</span>
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>App</span>
        </span>
    </div>
);

// Icons
const Icons = {
    menu: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    close: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    language: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
    email: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
    phone: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
    location: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
    clock: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

// Language Toggle
function LanguageToggle({ isDark = true }: { isDark?: boolean }) {
    const { language, setLanguage } = useI18n();
    return (
        <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isDark ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"}`}>
            {Icons.language}
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}

export default function ContactPage() {
    const { t, isRTL, language } = useI18n();
    const { theme } = useGlobalTheme();
    const isDark = theme === "dark";
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

    const translations = {
        en: {
            title: "Contact Us",
            subtitle: "We'd love to hear from you. Get in touch with our team.",
            name: "Your Name",
            email: "Email Address",
            subject: "Subject",
            message: "Your Message",
            send: "Send Message",
            contactInfo: "Contact Information",
            emailUs: "Email Us",
            emailValue: "support@tawariapp.com",
            callUs: "Call Us",
            callValue: "+20 123 456 7890",
            visitUs: "Visit Us",
            visitValue: "Cairo, Egypt",
            hours: "Working Hours",
            hoursValue: "24/7 Support Available",
        },
        ar: {
            title: "تواصل معنا",
            subtitle: "نحب أن نسمع منك. تواصل مع فريقنا.",
            name: "اسمك",
            email: "البريد الإلكتروني",
            subject: "الموضوع",
            message: "رسالتك",
            send: "إرسال الرسالة",
            contactInfo: "معلومات التواصل",
            emailUs: "راسلنا",
            emailValue: "support@tawariapp.com",
            callUs: "اتصل بنا",
            callValue: "+20 123 456 7890",
            visitUs: "زورنا",
            visitValue: "القاهرة، مصر",
            hours: "ساعات العمل",
            hoursValue: "دعم متاح على مدار الساعة",
        }
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual contact form submission
    };

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#0F172A] text-white' : 'bg-gray-50 text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]' : 'bg-gradient-to-br from-teal-50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-teal-500/10' : 'bg-teal-500/5'}`} />
            </div>

            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#0F172A]/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity"><LogoFull isDark={isDark} /></Link>
                        <div className="hidden lg:flex items-center gap-3">
                            <LanguageToggle isDark={isDark} />
                            <Link href={`/${language}/login`} className={`font-medium text-sm px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{t.nav.login}</Link>
                            <Link href={`/${language}/get-started`} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-5 py-2 rounded-full text-sm transition-all">{t.nav.getStarted}</Link>
                        </div>
                        <button className={`lg:hidden p-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? Icons.close : Icons.menu}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="lg:hidden py-4">
                            <div className="flex flex-col gap-3 items-start">
                                <Link href={`/${language}/login`} className={`py-2 font-medium ${isDark ? 'text-gray-300 hover:text-teal-400' : 'text-gray-600 hover:text-teal-600'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.login}</Link>
                                <LanguageToggle isDark={isDark} />
                                <Link href={`/${language}/get-started`} className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2.5 rounded-full text-center" onClick={() => setMobileMenuOpen(false)}>{t.nav.getStarted}</Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">{text.title}</span>
                    </h1>
                    <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{text.subtitle}</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <form onSubmit={handleSubmit} className={`rounded-2xl p-6 md:p-8 space-y-5 ${isDark ? 'bg-slate-800/30 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}`}>
                        <div>
                            <input type="text" placeholder={text.name} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-3.5 border rounded-xl transition-all outline-none ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20' : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                        </div>
                        <div>
                            <input type="email" placeholder={text.email} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-3.5 border rounded-xl transition-all outline-none ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20' : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                        </div>
                        <div>
                            <input type="text" placeholder={text.subject} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={`w-full px-4 py-3.5 border rounded-xl transition-all outline-none ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20' : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                        </div>
                        <div>
                            <textarea placeholder={text.message} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5} className={`w-full px-4 py-3.5 border rounded-xl transition-all outline-none resize-none ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder-gray-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20' : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'}`} />
                        </div>
                        <button type="submit" className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-lg shadow-teal-500/25 transition-all">
                            {text.send}
                        </button>
                    </form>

                    <div className="space-y-4">
                        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.contactInfo}</h2>
                        {[
                            { icon: Icons.email, title: text.emailUs, value: text.emailValue },
                            { icon: Icons.phone, title: text.callUs, value: text.callValue },
                            { icon: Icons.location, title: text.visitUs, value: text.visitValue },
                            { icon: Icons.clock, title: text.hours, value: text.hoursValue },
                        ].map((item, idx) => (
                            <div key={idx} className={`rounded-xl p-5 flex items-start gap-4 transition-colors ${isDark ? 'bg-slate-800/30 border border-white/10 hover:bg-slate-800/50' : 'bg-white border border-gray-200 hover:shadow-lg shadow-md'}`}>
                                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.title}</p>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className={`relative z-10 border-t py-8 ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500 text-sm">{t.footer.copyright}</p>
                </div>
            </footer>
        </div>
    );
}
