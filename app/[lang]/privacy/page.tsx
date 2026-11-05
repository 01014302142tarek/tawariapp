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

export default function PrivacyPage() {
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
            title: "Privacy Policy",
            lastUpdated: "Last updated: December 2024",
            sections: [
                {
                    title: "Information We Collect",
                    content: "We collect information you provide directly to us, including your name, email address, phone number, and medical information when you create an account, book appointments, or communicate with doctors through our platform."
                },
                {
                    title: "How We Use Your Information",
                    content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions."
                },
                {
                    title: "Medical Information",
                    content: "Your medical information is treated with the highest level of confidentiality. We only share your medical data with the healthcare providers you choose to consult with. All medical records are encrypted and stored securely."
                },
                {
                    title: "Data Security",
                    content: "We implement industry-standard security measures to protect your personal and medical information. This includes encryption in transit and at rest, secure data centers, and regular security audits."
                },
                {
                    title: "Data Sharing",
                    content: "We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our platform, subject to strict confidentiality agreements."
                },
                {
                    title: "Your Rights",
                    content: "You have the right to access, correct, or delete your personal information at any time. You can also request a copy of your data or ask us to stop processing your information."
                },
                {
                    title: "Cookies",
                    content: "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and personalize content. You can control cookie preferences through your browser settings."
                },
                {
                    title: "Contact Us",
                    content: "If you have any questions about this Privacy Policy, please contact us at privacy@tabibi.com."
                }
            ]
        },
        ar: {
            title: "سياسة الخصوصية",
            lastUpdated: "آخر تحديث: ديسمبر 2024",
            sections: [
                {
                    title: "المعلومات التي نجمعها",
                    content: "نجمع المعلومات التي تقدمها لنا مباشرة، بما في ذلك اسمك وعنوان بريدك الإلكتروني ورقم هاتفك ومعلوماتك الطبية عند إنشاء حساب أو حجز مواعيد أو التواصل مع الأطباء عبر منصتنا."
                },
                {
                    title: "كيف نستخدم معلوماتك",
                    content: "نستخدم المعلومات التي نجمعها لتوفير خدماتنا وصيانتها وتحسينها، ومعالجة المعاملات، وإرسال إشعارات تقنية ورسائل دعم، والرد على تعليقاتك وأسئلتك."
                },
                {
                    title: "المعلومات الطبية",
                    content: "يتم التعامل مع معلوماتك الطبية بأعلى مستوى من السرية. نحن نشارك بياناتك الطبية فقط مع مقدمي الرعاية الصحية الذين تختار استشارتهم. جميع السجلات الطبية مشفرة ومخزنة بشكل آمن."
                },
                {
                    title: "أمان البيانات",
                    content: "نطبق إجراءات أمان معيارية في الصناعة لحماية معلوماتك الشخصية والطبية. يشمل ذلك التشفير أثناء النقل والتخزين، ومراكز بيانات آمنة، وعمليات تدقيق أمني منتظمة."
                },
                {
                    title: "مشاركة البيانات",
                    content: "نحن لا نبيع أو نتاجر أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك المعلومات مع مقدمي الخدمات الذين يساعدوننا في تشغيل منصتنا، وفقًا لاتفاقيات سرية صارمة."
                },
                {
                    title: "حقوقك",
                    content: "لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها في أي وقت. يمكنك أيضًا طلب نسخة من بياناتك أو مطالبتنا بالتوقف عن معالجة معلوماتك."
                },
                {
                    title: "ملفات تعريف الارتباط",
                    content: "نستخدم ملفات تعريف الارتباط والتقنيات المماثلة لتحسين تجربتك وتحليل أنماط الاستخدام وتخصيص المحتوى. يمكنك التحكم في تفضيلات ملفات تعريف الارتباط من خلال إعدادات متصفحك."
                },
                {
                    title: "تواصل معنا",
                    content: "إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا على privacy@tabibi.com."
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
