"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "../../i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";
import Footer from "@/components/landing/Footer";
import { GlowingCard } from "@/components/ui/glowing-card";
import { Logo } from "@/components/ui/Logo";

// Icons
const Icons = {
    menu: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    close: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    chevron: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    patient: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    doctor: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
            <path d="M11 2v2" />
            <path d="M5 2v2" />
            <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
            <path d="M8 15a6 6 0 0 0 12 0v-3" />
            <circle cx="20" cy="10" r="2" />
        </svg>
    ),
    language: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
    ),
};

// Language Toggle
function LanguageToggle({ isDark = true }: { isDark?: boolean }) {
    const { language, setLanguage } = useI18n();
    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${isDark ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200" : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"}`}
        >
            {Icons.language}
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
    );
}

// FAQ Accordion Item
function FAQItem({ question, answer, isOpen, onClick, isDark = true }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
    isDark?: boolean;
}) {
    return (
        <GlowingCard
            isDark={isDark}
            glowColor="blue"
            className="overflow-hidden transition-all hover:scale-[1.01] p-5"
        >
            <button
                onClick={onClick}
                className="w-full text-left"
            >
                <div className="flex items-center justify-between">
                    <span className={`font-medium pr-4 ${isDark ? "text-white" : "text-slate-900"}`}>{question}</span>
                    <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-blue-400 group-hover:text-blue-400 flex-shrink-0"
                    >
                        {Icons.chevron}
                    </motion.span>
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className={`pt-2 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlowingCard>
    );
}

export default function FAQPage() {
    const { t, isRTL, language } = useI18n();
    const { theme } = useGlobalTheme();
    const isDark = theme === "dark";
    const [openPatient, setOpenPatient] = useState<number | null>(0);
    const [openDoctor, setOpenDoctor] = useState<number | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll to top on mount with smooth animation
    useEffect(() => {
        // Small delay to ensure DOM is ready, then smooth scroll to top
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }, 100);
    }, []);

    const translations = {
        en: {
            title: "Frequently Asked Questions",
            subtitle: "Find answers to common questions about Tabibi",
            patientSection: "For Patients",
            doctorSection: "For Doctors",
            patientFaqs: [
                {
                    question: "How do I book an appointment with a doctor?",
                    answer: "Simply create an account, browse our list of available doctors, select your preferred specialist, choose a time slot that works for you, and confirm your booking. You'll receive a confirmation email with all the details."
                },
                {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit and debit cards (Visa, MasterCard), as well as Vodafone Cash for convenient mobile payments. All transactions are securely processed."
                },
                {
                    question: "Can I get a prescription through video consultation?",
                    answer: "Yes! Our licensed doctors can issue digital prescriptions after a video consultation if they determine it's medically appropriate. The prescription will be sent to your registered email and can be used at any pharmacy."
                },
                {
                    question: "Is my medical information kept private?",
                    answer: "Absolutely. We take privacy very seriously. All your medical information is encrypted and stored securely. We comply with all health data protection regulations and never share your information without your consent."
                },
                {
                    question: "What if I need to cancel or reschedule my appointment?",
                    answer: "You can cancel or reschedule your appointment up to 2 hours before the scheduled time through your dashboard. Cancellations made with less than 2 hours notice may be subject to a small fee."
                },
                {
                    question: "Are the doctors on Tabibi licensed?",
                    answer: "Yes, all doctors on our platform are fully licensed medical professionals registered with the Egyptian Medical Syndicate. We verify each doctor's credentials before they can offer consultations."
                }
            ],
            doctorFaqs: [
                {
                    question: "How do I register as a doctor on Tabibi?",
                    answer: "Click on 'Register as Doctor' and complete our onboarding process. You'll need to provide your medical license, specialization certificates, and identification documents. Our team will verify your credentials within 2-3 business days."
                },
                {
                    question: "What commission does Tabibi charge?",
                    answer: "We charge a competitive commission on each consultation. The exact rate depends on your specialization and consultation volume. Contact our support team for detailed pricing information."
                },
                {
                    question: "Can I set my own consultation fees?",
                    answer: "Yes, you have full control over your consultation fees. We provide suggested ranges based on your specialty and experience, but the final decision is yours."
                },
                {
                    question: "How do I receive payments for consultations?",
                    answer: "Payments are processed weekly and transferred directly to your registered bank account. You can view your earnings and payment history in your doctor dashboard."
                },
                {
                    question: "What technical requirements do I need for video consultations?",
                    answer: "You need a stable internet connection (at least 5 Mbps), a device with a camera and microphone (computer, tablet, or smartphone), and a quiet, well-lit private space for consultations."
                },
                {
                    question: "Can I issue prescriptions through the platform?",
                    answer: "Yes, our platform includes a built-in digital prescription system. You can prescribe medications during or after the consultation, and the prescription is automatically sent to the patient's email."
                }
            ],
            stillHaveQuestions: "Still have questions?",
            contactUs: "Contact our support team",
        },
        ar: {
            title: "الأسئلة الشائعة",
            subtitle: "اعثر على إجابات للأسئلة الشائعة حول طبيبي",
            patientSection: "للمرضى",
            doctorSection: "للأطباء",
            patientFaqs: [
                {
                    question: "كيف أحجز موعداً مع طبيب؟",
                    answer: "ببساطة قم بإنشاء حساب، تصفح قائمة الأطباء المتاحين، اختر الأخصائي المفضل لديك، حدد الوقت المناسب لك، وأكد الحجز. ستتلقى بريداً إلكترونياً بجميع التفاصيل."
                },
                {
                    question: "ما طرق الدفع المتاحة؟",
                    answer: "نقبل جميع بطاقات الائتمان والخصم الرئيسية (فيزا، ماستركارد)، بالإضافة إلى فودافون كاش للدفع عبر الهاتف. جميع المعاملات مؤمنة."
                },
                {
                    question: "هل يمكنني الحصول على وصفة طبية من خلال الاستشارة بالفيديو؟",
                    answer: "نعم! يمكن لأطبائنا المرخصين إصدار وصفات طبية رقمية بعد الاستشارة إذا رأوا ذلك مناسباً طبياً. سيتم إرسال الوصفة إلى بريدك الإلكتروني ويمكن استخدامها في أي صيدلية."
                },
                {
                    question: "هل معلوماتي الطبية محمية؟",
                    answer: "بالتأكيد. نحن نأخذ الخصوصية على محمل الجد. جميع معلوماتك الطبية مشفرة ومخزنة بشكل آمن. نحن نلتزم بجميع لوائح حماية البيانات الصحية ولا نشارك معلوماتك دون موافقتك."
                },
                {
                    question: "ماذا لو أردت إلغاء أو إعادة جدولة موعدي؟",
                    answer: "يمكنك إلغاء أو إعادة جدولة موعدك حتى ساعتين قبل الموعد المحدد من خلال لوحة التحكم. الإلغاءات التي تتم بأقل من ساعتين قد تخضع لرسوم بسيطة."
                },
                {
                    question: "هل الأطباء في طبيبي مرخصون؟",
                    answer: "نعم، جميع الأطباء على منصتنا هم أطباء مرخصون ومسجلون في نقابة الأطباء المصرية. نتحقق من أوراق اعتماد كل طبيب قبل السماح له بتقديم الاستشارات."
                }
            ],
            doctorFaqs: [
                {
                    question: "كيف أسجل كطبيب في طبيبي؟",
                    answer: "انقر على 'التسجيل كطبيب' وأكمل عملية التسجيل. ستحتاج إلى تقديم رخصتك الطبية وشهادات التخصص ووثائق الهوية. سيتحقق فريقنا من بياناتك خلال 2-3 أيام عمل."
                },
                {
                    question: "ما هي العمولة التي تأخذها طبيبي؟",
                    answer: "نحن نفرض عمولة تنافسية على كل استشارة. يعتمد المعدل الدقيق على تخصصك وحجم الاستشارات. تواصل مع فريق الدعم للحصول على معلومات تفصيلية."
                },
                {
                    question: "هل يمكنني تحديد رسوم الاستشارة الخاصة بي؟",
                    answer: "نعم، لديك السيطرة الكاملة على رسوم الاستشارة. نقدم نطاقات مقترحة بناءً على تخصصك وخبرتك، لكن القرار النهائي لك."
                },
                {
                    question: "كيف أستلم مدفوعات الاستشارات؟",
                    answer: "تتم معالجة المدفوعات أسبوعياً وتحويلها مباشرة إلى حسابك البنكي المسجل. يمكنك عرض أرباحك وسجل الدفعات في لوحة تحكم الطبيب."
                },
                {
                    question: "ما المتطلبات التقنية للاستشارات بالفيديو؟",
                    answer: "تحتاج إلى اتصال إنترنت مستقر (5 ميجابت على الأقل)، جهاز بكاميرا وميكروفون (كمبيوتر أو تابلت أو هاتف)، ومكان خاص هادئ وجيد الإضاءة للاستشارات."
                },
                {
                    question: "هل يمكنني إصدار وصفات طبية من خلال المنصة؟",
                    answer: "نعم، تتضمن منصتنا نظام وصفات طبية رقمي مدمج. يمكنك وصف الأدوية أثناء أو بعد الاستشارة، ويتم إرسال الوصفة تلقائياً إلى بريد المريض."
                }
            ],
            stillHaveQuestions: "لا زلت لديك أسئلة؟",
            contactUs: "تواصل مع فريق الدعم",
        }
    };

    const text = translations[language as keyof typeof translations] || translations.en;

    return (
        <div className={`min-h-screen overflow-x-hidden ${isRTL ? 'font-cairo' : ''} ${isDark ? 'bg-[#031326] text-white' : 'bg-gray-50 text-slate-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#042642] via-[#031326] to-[#060B18]' : 'bg-gradient-to-br from-amber-50/50 via-white to-white'}`} />
                <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-[#FD614B]/10' : 'bg-[#FD614B]/10'}`} />
                <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-[#FD614B]/10' : 'bg-[#FD614B]/10'}`} />
            </div>

            {/* Navigation */}
            <nav className={`relative z-50 backdrop-blur-xl border-b ${isDark ? 'bg-[#031326]/85 border-[#044C87]/40' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <Link href={`/${language}`} className="group hover:opacity-90 transition-opacity">
                            <Logo isDark={isDark} />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-3">
                            <LanguageToggle isDark={isDark} />
                            <Link
                                href={`/${language}/login`}
                                className={`font-medium text-sm px-4 py-2 transition-colors ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                {t.nav.login}
                            </Link>
                            <Link
                                href={`/${language}/get-started`}
                                className="bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-bold px-5 py-2 rounded-full text-sm transition-all shadow-lg shadow-[#FD614B]/30"
                            >
                                {t.nav.getStarted}
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className={`lg:hidden p-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? Icons.close : Icons.menu}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden py-4 border-t border-white/5">
                            <div className="flex flex-col gap-3 items-start">
                                <Link
                                    href={`/${language}/login`}
                                    className={`py-2 font-medium ${isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t.nav.login}
                                </Link>
                                <LanguageToggle isDark={isDark} />
                                <Link
                                    href={`/${language}/get-started`}
                                    className="bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-full text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t.nav.getStarted}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
                        <span className={`text-transparent bg-clip-text ${
                            isDark
                                ? "bg-gradient-to-r from-white via-blue-100 to-blue-400"
                                : "bg-gradient-to-r from-slate-900 via-blue-800 to-blue-600"
                        }`}>
                            {text.title}
                        </span>
                    </h1>
                    <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {text.subtitle}
                    </p>
                </div>

                {/* Patient FAQs */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] border border-sky-300/40">
                            {Icons.patient}
                        </div>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.patientSection}</h2>
                    </div>
                    <div className="space-y-3">
                        {text.patientFaqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openPatient === index}
                                onClick={() => setOpenPatient(openPatient === index ? null : index)}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                </div>

                {/* Doctor FAQs */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#0284C7] flex items-center justify-center text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] border border-sky-300/40">
                            {Icons.doctor}
                        </div>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.doctorSection}</h2>
                    </div>
                    <div className="space-y-3">
                        {text.doctorFaqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openDoctor === index}
                                onClick={() => setOpenDoctor(openDoctor === index ? null : index)}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <GlowingCard isDark={isDark} glowColor="blue" className="text-center p-8">
                    <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{text.stillHaveQuestions}</p>
                    <Link
                        href={`/${language}/contact`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FD614B] to-[#E84D37] hover:brightness-110 text-white font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-[#FD614B]/30"
                    >
                        {text.contactUs}
                    </Link>
                </GlowingCard>
            </main>

            {/* Footer */}
            <Footer isDark={isDark} />
        </div>
    );
}
