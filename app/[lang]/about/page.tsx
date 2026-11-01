"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import Footer from "@/components/landing/Footer";
import { GlowingCard } from "@/components/ui/glowing-card";
import { Logo } from "@/components/ui/Logo";

// Icons
const Icons = {
    menu: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    close: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    language: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
    heart: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
    shield: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    users: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    globe: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
};

// Language Toggle
function LanguageToggle({ isDark = true }: { isDark?: boolean }) {
    const { language, setLanguage } = useI18n();
    return (
        <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isDark ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200" : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"}`}>
            {Icons.language}
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}

export default function AboutPage() {
    const { t, isRTL, language } = useI18n();
    const { theme } = useGlobalTheme();
    const isDark = theme === "dark";
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll to top on mount with smooth animation
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }, 100);
    }, []);

    const translations = {
        en: {
            title: "About Tabibi",
            subtitle: "Transforming healthcare access across Egypt through technology",
            mission: "Our Mission",
            missionText: "To make quality healthcare accessible to every Egyptian, regardless of their location. We connect patients with licensed doctors through secure video consultations, making medical care just a tap away.",
            vision: "Our Vision",
            visionText: "A future where no one has to travel hours for a doctor's appointment, where prescriptions are digital, and where healthcare is truly accessible 24/7.",
            values: "Our Values",
            value1Title: "Patient First",
            value1Text: "Every decision we make prioritizes patient care and safety.",
            value2Title: "Trust & Security",
            value2Text: "Your health data is protected with industry-leading encryption.",
            value3Title: "Quality Care",
            value3Text: "All doctors are verified and licensed medical professionals.",
            value4Title: "Accessibility",
            value4Text: "Healthcare should be available to everyone, everywhere.",
            team: "Built in Egypt",
            teamText: "Tabibi was founded with a simple goal: bring quality healthcare to every home in Egypt. Our team combines medical expertise with cutting-edge technology to create a seamless telemedicine experience.",
        },
        ar: {
            title: "عن طبيبي",
            subtitle: "تحويل الوصول للرعاية الصحية في جميع أنحاء مصر من خلال التكنولوجيا",
            mission: "مهمتنا",
            missionText: "جعل الرعاية الصحية عالية الجودة متاحة لكل مصري، بغض النظر عن موقعه. نحن نربط المرضى بأطباء مرخصين من خلال استشارات فيديو آمنة، مما يجعل الرعاية الطبية على بعد نقرة واحدة.",
            vision: "رؤيتنا",
            visionText: "مستقبل لا يضطر فيه أحد للسفر ساعات للحصول على موعد طبيب، حيث الوصفات الطبية رقمية، وحيث الرعاية الصحية متاحة حقًا على مدار الساعة.",
            values: "قيمنا",
            value1Title: "المريض أولاً",
            value1Text: "كل قرار نتخذه يعطي الأولوية لرعاية المريض وسلامته.",
            value2Title: "الثقة والأمان",
            value2Text: "بياناتك الصحية محمية بتشفير رائد في الصناعة.",
            value3Title: "رعاية عالية الجودة",
            value3Text: "جميع الأطباء متحققون ومرخصون كمحترفين طبيين.",
            value4Title: "إمكانية الوصول",
            value4Text: "يجب أن تكون الرعاية الصحية متاحة للجميع، في كل مكان.",
            team: "صُنع في مصر",
            teamText: "تأسست منصة طبيبي بهدف بسيط: توفير رعاية صحية عالية الجودة لكل منزل في مصر. يجمع فريقنا بين الخبرة الطبية والتكنولوجيا المتطورة لإنشاء تجربة طب عن بُعد سلسة.",
        }
    };

    const text = translations[language as keyof typeof translations] || translations.en;
    const values: { icon: React.ReactNode; title: string; desc: string; color: "amber" | "purple" | "blue" | "pink" | "green" }[] = [
        { icon: Icons.heart, title: text.value1Title, desc: text.value1Text, color: "blue" },
        { icon: Icons.shield, title: text.value2Title, desc: text.value2Text, color: "blue" },
        { icon: Icons.users, title: text.value3Title, desc: text.value3Text, color: "green" },
        { icon: Icons.globe, title: text.value4Title, desc: text.value4Text, color: "amber" },
    ];

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#060B18] text-white' : 'bg-gray-50 text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0B1528] via-[#060B18] to-[#060B18]' : 'bg-gradient-to-br from-blue-50/50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-blue-600/10' : 'bg-blue-500/5'}`} />
                <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-amber-500/5' : 'bg-amber-500/5'}`} />
            </div>

            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#060B18]/85 border-blue-500/20' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity"><Logo isDark={isDark} /></Link>
                        <div className="hidden lg:flex items-center gap-3">
                            <LanguageToggle isDark={isDark} />
                            <Link href={`/${language}/login`} className={`font-medium text-sm px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{t.nav.login}</Link>
                            <Link href={`/${language}/get-started`} className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 text-white font-bold px-5 py-2 rounded-full text-sm transition-all shadow-lg shadow-blue-500/25">{t.nav.getStarted}</Link>
                        </div>
                        <button className={`lg:hidden p-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? Icons.close : Icons.menu}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="lg:hidden py-4 border-t border-blue-500/20">
                            <div className="flex flex-col gap-3 items-start">
                                <Link href={`/${language}/login`} className={`py-2 font-medium ${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.login}</Link>
                                <LanguageToggle isDark={isDark} />
                                <Link href={`/${language}/get-started`} className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 text-white font-bold px-5 py-2.5 rounded-full text-center" onClick={() => setMobileMenuOpen(false)}>{t.nav.getStarted}</Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                        <span className={`text-transparent bg-clip-text ${
                            isDark
                                ? "bg-gradient-to-r from-white via-blue-100 to-blue-400"
                                : "bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600"
                        }`}>{text.title}</span>
                    </h1>
                    <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{text.subtitle}</p>
                </div>

                <div className="space-y-12">
                    <GlowingCard isDark={isDark} glowColor="blue" className="p-6 md:p-8">
                        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{text.mission}</h2>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{text.missionText}</p>
                    </GlowingCard>

                    <GlowingCard isDark={isDark} glowColor="blue" className="p-6 md:p-8">
                        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{text.vision}</h2>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{text.visionText}</p>
                    </GlowingCard>

                    <div>
                        <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.values}</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {values.map((value, idx) => (
                                <GlowingCard key={idx} isDark={isDark} glowColor={value.color} className="p-5 transition-all hover:scale-[1.02]">
                                    <div className={`w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3`}>
                                        {value.icon}
                                    </div>
                                    <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value.title}</h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{value.desc}</p>
                                </GlowingCard>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-2xl p-6 md:p-8 text-center ${isDark ? 'bg-gradient-to-br from-blue-900/20 to-blue-950/40 border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.15)]' : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200'}`}>
                        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.team}</h2>
                        <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{text.teamText}</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer isDark={isDark} />
        </div>
    );
}
