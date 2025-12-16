"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";

// Logo Component
const LogoFull = ({ className = "" }: { className?: string }) => (
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
            <span className="text-white">Tawari</span>
            <span className="text-gray-400">App</span>
        </span>
    </div>
);

// Icons
const Icons = {
    menu: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    close: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    language: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>,
};

// Language Toggle
function LanguageToggle() {
    const { language, setLanguage } = useI18n();
    return (
        <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors">
            {Icons.language}
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}

export default function TermsPage() {
    const { t, isRTL, language } = useI18n();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const translations = {
        en: {
            title: "Terms and Conditions",
            lastUpdated: "Last updated: December 2024",
            sections: [
                {
                    title: "1. Acceptance of Terms",
                    content: "By accessing and using TawariApp, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you may not use our services."
                },
                {
                    title: "2. Medical Disclaimer",
                    content: "TawariApp is a platform that connects patients with doctors. We do not provide medical advice, diagnosis, or treatment. The content on our platform is for informational purposes only. In case of a medical emergency, please call your local emergency number immediately."
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
                    content: "All content, features, and functionality of TawariApp are owned by us and are protected by international copyright, trademark, and other intellectual property laws."
                },
                {
                    title: "7. Limitation of Liability",
                    content: "TawariApp shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service."
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
                    content: "من خلال الوصول إلى طوارئ واستخدامه، فإنك توافق على الالتزام بهذه الشروط والأحكام وسياسة الخصوصية الخاصة بنا. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يجوز لك استخدام خدماتنا."
                },
                {
                    title: "2. إخلاء المسؤولية الطبية",
                    content: "طوارئ هي منصة تربط المرضى بالأطباء. نحن لا نقدم المشورة الطبية أو التشخيص أو العلاج. المحتوى الموجود على منصتنا هو لأغراض إعلامية فقط. في حالة الطوارئ الطبية، يرجى الاتصال برقم الطوارئ المحلي فوراً."
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
                    content: "جميع المحتويات والميزات والوظائف الخاصة بطوارئ مملوكة لنا ومحمية بقوانين حقوق النشر والعلامات التجارية وغيرها من قوانين الملكية الفكرية الدولية."
                },
                {
                    title: "7. تحديد المسؤولية",
                    content: "لن تكون طوارئ مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية ناتجة عن استخدامك أو عدم قدرتك على استخدام الخدمة."
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
        <div className={`min-h-screen bg-[#0F172A] text-white overflow-x-hidden ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]" />
            </div>

            <nav className="relative z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity"><LogoFull /></Link>
                        <div className="hidden lg:flex items-center gap-3">
                            <LanguageToggle />
                            <Link href={`/${language}/login`} className="text-gray-300 hover:text-white font-medium text-sm px-4 py-2 transition-colors">{t.nav.login}</Link>
                            <Link href={`/${language}/get-started`} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-5 py-2 rounded-full text-sm transition-all">{t.nav.getStarted}</Link>
                        </div>
                        <button className="lg:hidden p-2 text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? Icons.close : Icons.menu}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="lg:hidden py-4">
                            <div className="flex flex-col gap-3 items-start">
                                <Link href={`/${language}/login`} className="text-gray-300 hover:text-teal-400 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>{t.nav.login}</Link>
                                <LanguageToggle />
                                <Link href={`/${language}/get-started`} className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2.5 rounded-full text-center" onClick={() => setMobileMenuOpen(false)}>{t.nav.getStarted}</Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">{text.title}</span>
                    </h1>
                    <p className="text-gray-500 text-sm">{text.lastUpdated}</p>
                </div>

                <div className="space-y-8">
                    {text.sections.map((section, idx) => (
                        <div key={idx} className="bg-slate-800/30 border border-white/10 rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
                            <p className="text-gray-400 leading-relaxed">{section.content}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="relative z-10 border-t border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-500 text-sm">{t.footer.copyright}</p>
                </div>
            </footer>
        </div>
    );
}
