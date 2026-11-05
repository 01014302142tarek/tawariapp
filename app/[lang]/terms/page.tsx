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

export default function TermsPage() {
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
            title: "Terms and Conditions",
            lastUpdated: "Last updated: December 2024",
            sections: [
                {
                    title: "1. Acceptance of Terms",
                    content: "By accessing and using Tabibi, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you may not use our services."
                },
                {
                    title: "2. Medical Disclaimer",
                    content: "Tabibi is a platform that connects patients with licensed doctors. We do not provide medical advice, diagnosis, or treatment. The content on our platform is for informational purposes only. In case of a medical emergency, please call your local emergency number immediately."
                },
                {
                    title: "3. User Accounts",
                    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when registering."
                },
                {
                    title: "4. Appointments and Cancellations",
                    content: "When you book an appointment, you agree to pay the specified fees. Cancellations made less than 2 hours before the appointment time may be subject to a cancellation fee. Doctors reserve the right to reschedule or cancel appointments in case of emergencies."
                },
                {
                    title: "5. Code of Conduct",
                    content: "Users must treat doctors and support staff with respect. Any abusive, harassing, or inappropriate behavior will result in immediate account termination."
                },
                {
                    title: "6. Intellectual Property",
                    content: "All content, features, and functionality of Tabibi are owned by us and are protected by international copyright, trademark, and other intellectual property laws."
                },
                {
                    title: "7. Limitation of Liability",
                    content: "Tabibi shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service."
                },
                {
                    title: "8. Changes to Terms",
                    content: "We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the platform after changes constitutes acceptance of the new terms."
                }
            ]
        },
        ar: {
            title: "الشروط والأحكام",
            lastUpdated: "آخر تحديث: ديسمبر 2024",
            sections: [
                {
                    title: "1. قبول الشروط",
                    content: "من خلال الوصول إلى طبيبي واستخدامه، فإنك توافق على الالتزام بهذه الشروط والأحكام وسياسة الخصوصية الخاصة بنا. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يجوز لك استخدام خدماتنا."
                },
                {
                    title: "2. إخلاء المسؤولية الطبية",
                    content: "طبيبي هي منصة تربط المرضى بالأطباء المرخصين. نحن لا نقدم المشورة الطبية أو التشخيص أو العلاج بشكل مباشر. المحتوى الموجود على منصتنا هو لأغراض إعلامية وتنسيقية. في حالة الطوارئ الطبية الحرجة، يرجى الاتصال برقم الطوارئ المحلي فوراً."
                },
                {
                    title: "3. حسابات المستخدمين",
                    content: "أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك وعن جميع الأنشطة التي تحدث تحت حسابك. أنت توافق على تقديم معلومات دقيقة وكاملة عند التسجيل."
                },
                {
                    title: "4. المواعيد والإلغاء",
                    content: "عند حجز موعد، فإنك توافق على دفع الرسوم المحددة. قد تخضع الإلغاءات التي تتم قبل أقل من ساعتين من وقت الموعد لرسوم إلغاء. يحتفظ الأطباء بالحق في إعادة جدولة أو إلغاء المواعيد في حالات الطوارئ."
                },
                {
                    title: "5. قواعد السلوك",
                    content: "يجب على المستخدمين معاملة الأطباء وموظفي الدعم باحترام. سيؤدي أي سلوك مسيء أو مضايق أو غير لائق إلى إنهاء الحساب فوراً."
                },
                {
                    title: "6. حقوق الملكية الفكرية",
                    content: "جميع المحتويات والميزات والوظائف الخاصة بطبيبي مملوكة لنا ومحمية بقوانين حقوق النشر والعلامات التجارية وغيرها من قوانين الملكية الفكرية الدولية."
                },
                {
                    title: "7. تحديد المسؤولية",
                    content: "لن تكون طبيبي مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية ناتجة عن استخدامك أو عدم قدرتك على استخدام الخدمة."
                },
                {
                    title: "8. تغييرات الشروط",
                    content: "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإخطار المستخدمين بأي تغييرات جوهرية. استمرار استخدامك للمنصة بعد التغييرات يشكل قبولاً للشروط الجديدة."
                }
            ]
        }
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#031326] text-white' : 'bg-gray-50 text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#042642] via-[#031326] to-[#060B18]' : 'bg-gradient-to-br from-amber-50/50 via-white to-white'}`} />
            </div>

            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#031326]/85 border-[#044C87]/40' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity"><Logo isDark={isDark} /></Link>
                        <div className="hidden lg:flex items-center gap-3">
                            <LanguageToggle isDark={isDark} />
                            <Link href={`/${language}/login`} className={`font-medium text-sm px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{t.nav.login}</Link>
                            <Link href={`/${language}/get-started`} className="bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-bold px-5 py-2 rounded-full text-sm transition-all shadow-lg shadow-[#FD614B]/30">{t.nav.getStarted}</Link>
                        </div>
                        <button className={`lg:hidden p-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? Icons.close : Icons.menu}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="lg:hidden py-4 border-t border-white/5">
                            <div className="flex flex-col gap-3 items-start">
                                <Link href={`/${language}/login`} className={`py-2 font-medium ${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`} onClick={() => setMobileMenuOpen(false)}>{t.nav.login}</Link>
                                <LanguageToggle isDark={isDark} />
                                <Link href={`/${language}/get-started`} className="bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-full text-center" onClick={() => setMobileMenuOpen(false)}>{t.nav.getStarted}</Link>
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
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{text.lastUpdated}</p>
                </div>

                <div className="space-y-8">
                    {text.sections.map((section, idx) => (
                        <GlowingCard key={idx} isDark={isDark} glowColor="blue" className="p-6 md:p-8">
                            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{section.title}</h2>
                            <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{section.content}</p>
                        </GlowingCard>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <Footer isDark={isDark} />
        </div>
    );
}
