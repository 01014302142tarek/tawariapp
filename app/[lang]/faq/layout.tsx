import { Metadata } from "next";
import { siteConfig } from "@/lib/seo/config";
import { FaqJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = siteConfig.url;

type Props = {
    params: Promise<{ lang: string }>;
    children: React.ReactNode;
};

// FAQ data for structured data
const faqDataEn = [
    {
        question: "How do I book an appointment with a doctor?",
        answer: "Simply create an account, browse our list of available doctors, select your preferred specialist, choose a time slot that works for you, and confirm your booking. You'll receive a confirmation email with all the details.",
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit and debit cards (Visa, MasterCard), as well as Vodafone Cash for convenient mobile payments. All transactions are securely processed.",
    },
    {
        question: "Can I get a prescription through video consultation?",
        answer: "Yes! Our licensed doctors can issue digital prescriptions after a video consultation if they determine it's medically appropriate. The prescription will be sent to your registered email and can be used at any pharmacy.",
    },
    {
        question: "Is my medical information kept private?",
        answer: "Absolutely. We take privacy very seriously. All your medical information is encrypted and stored securely. We comply with all health data protection regulations and never share your information without your consent.",
    },
    {
        question: "Are the doctors on TawariApp licensed?",
        answer: "Yes, all doctors on our platform are fully licensed medical professionals registered with the Egyptian Medical Syndicate. We verify each doctor's credentials before they can offer consultations.",
    },
    {
        question: "How do I register as a doctor on TawariApp?",
        answer: "Click on 'Register as Doctor' and complete our onboarding process. You'll need to provide your medical license, specialization certificates, and identification documents. Our team will verify your credentials within 2-3 business days.",
    },
];

const faqDataAr = [
    {
        question: "كيف أحجز موعداً مع طبيب؟",
        answer: "ببساطة قم بإنشاء حساب، تصفح قائمة الأطباء المتاحين، اختر الأخصائي المفضل لديك، حدد الوقت المناسب لك، وأكد الحجز. ستتلقى بريداً إلكترونياً بجميع التفاصيل.",
    },
    {
        question: "ما طرق الدفع المتاحة؟",
        answer: "نقبل جميع بطاقات الائتمان والخصم الرئيسية (فيزا، ماستركارد)، بالإضافة إلى فودافون كاش للدفع عبر الهاتف. جميع المعاملات مؤمنة.",
    },
    {
        question: "هل يمكنني الحصول على وصفة طبية من خلال الاستشارة بالفيديو؟",
        answer: "نعم! يمكن لأطبائنا المرخصين إصدار وصفات طبية رقمية بعد الاستشارة إذا رأوا ذلك مناسباً طبياً. سيتم إرسال الوصفة إلى بريدك الإلكتروني ويمكن استخدامها في أي صيدلية.",
    },
    {
        question: "هل معلوماتي الطبية محمية؟",
        answer: "بالتأكيد. نحن نأخذ الخصوصية على محمل الجد. جميع معلوماتك الطبية مشفرة ومخزنة بشكل آمن. نحن نلتزم بجميع لوائح حماية البيانات الصحية ولا نشارك معلوماتك دون موافقتك.",
    },
    {
        question: "هل الأطباء في تواري مرخصون؟",
        answer: "نعم، جميع الأطباء على منصتنا هم أطباء مرخصون ومسجلون في نقابة الأطباء المصرية. نتحقق من أوراق اعتماد كل طبيب قبل السماح له بتقديم الاستشارات.",
    },
    {
        question: "كيف أسجل كطبيب في تواري؟",
        answer: "انقر على 'التسجيل كطبيب' وأكمل عملية التسجيل. ستحتاج إلى تقديم رخصتك الطبية وشهادات التخصص ووثائق الهوية. سيتحقق فريقنا من بياناتك خلال 2-3 أيام عمل.",
    },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const isArabic = lang === "ar";

    const title = isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions";
    const description = isArabic
        ? "اعثر على إجابات للأسئلة الشائعة حول تواري - كيفية حجز المواعيد، طرق الدفع، الوصفات الطبية، والمزيد."
        : "Find answers to common questions about TawariApp - how to book appointments, payment methods, prescriptions, and more.";

    return {
        title,
        description,
        alternates: {
            canonical: `${BASE_URL}/${lang}/faq`,
            languages: {
                en: `${BASE_URL}/en/faq`,
                ar: `${BASE_URL}/ar/faq`,
            },
        },
        openGraph: {
            title: `${title} | ${siteConfig.name}`,
            description,
            url: `${BASE_URL}/${lang}/faq`,
            locale: isArabic ? "ar_EG" : "en_US",
        },
    };
}

export default async function FaqLayout({ params, children }: Props) {
    const { lang } = await params;
    const faqData = lang === "ar" ? faqDataAr : faqDataEn;

    return (
        <>
            <FaqJsonLd questions={faqData} />
            {children}
        </>
    );
}
