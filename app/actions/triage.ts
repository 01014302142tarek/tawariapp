"use server";

import { createClient } from "@/lib/supabase/server";

export type TriageUrgencyLevel = "emergency" | "urgent" | "routine";

export interface TriageDoctorSuggestion {
    id: string;
    profileId: string;
    fullName: string;
    avatarUrl: string | null;
    specialty: string;
    specialtyAr: string;
    ratingAverage: number;
    ratingCount: number;
    yearsOfExperience: number;
    consultationFee: number;
    isAvailableNow: boolean;
    slug: string | null;
}

export interface TriageResponse {
    urgencyLevel: TriageUrgencyLevel;
    titleAr: string;
    titleEn: string;
    summaryAr: string;
    summaryEn: string;
    primarySpecialtyEn: string;
    primarySpecialtyAr: string;
    secondarySpecialtyEn?: string;
    secondarySpecialtyAr?: string;
    adviceAr: string;
    adviceEn: string;
    emergencyAction?: {
        ambulanceNumber: string;
        callTextAr: string;
        callTextEn: string;
        emergencyRoomAdviceAr: string;
        emergencyRoomAdviceEn: string;
    };
    suggestedDoctors: TriageDoctorSuggestion[];
    urgentQueueAvailable: boolean;
    followUpQuestions?: Array<{
        questionAr: string;
        questionEn: string;
        options: Array<{ textAr: string; textEn: string; actionValue: string }>;
    }>;
    conversationalReply?: {
        textAr: string;
        textEn: string;
    };
}

/**
 * Advanced Medical Arabic & English Text Normalizer
 * Cleans diacritics, Alef forms, Teh Marbuta, Alef Maksura, and collapsed repeated letters.
 */
function normalizeMedicalText(text: string): string {
    if (!text) return "";
    let str = text.toLowerCase().trim();
    // Strip diacritics & tatweel
    str = str.replace(/[\u064B-\u065F\u0670\u0640]/g, "");
    // Normalize Alef forms: أ, إ, آ, ٱ -> ا
    str = str.replace(/[أإآٱ]/g, "ا");
    // Normalize Teh Marbuta: ة -> ه
    str = str.replace(/ة/g, "ه");
    // Normalize Alef Maksura: ى -> ي
    str = str.replace(/ى/g, "ي");
    // Collapse 3 or more consecutive identical characters into 1
    str = str.replace(/(.)\1{2,}/g, "$1");
    return str;
}

/**
 * Knowledge base for Egyptian dialect and medical emergency red flags
 */
const RED_FLAG_KEYWORDS = [
    // Acute severe chest & heart pain (potential ACS, myocardial infarction, aortic dissection)
    "قلبي وجعني جدا", "قلبي بيوجعني جدا", "قلبي واجعني جدا", "قلبي بيوجعني جامد", "قلبي وجعني اوي",
    "الم شديد في قلبي", "ألم شديد في قلبي", "وجع فظيع في قلبي", "الم فظيع في قلبي", "وجع شديد في صدري",
    "الم شديد في صدري", "ألم شديد في صدري", "وجع فظيع في صدري", "الم فظيع في صدري", "عصره في قلبي",
    "عصرة في قلبي", "عصره في صدري", "عصرة في صدري", "عصرة فظيعة", "عصره فظيعه", "عصرة في الصدر", "عصرة بصدري",
    "عصرة بقلبي", "حاسس ان قلبي هيقف", "قلبي هيقف", "قلبي بيتقطع",
    "صدري بيتقطع", "نغزة في صدري مسمعة", "صدري مسمع في كتفي", "صدري بيسمع في كتفي", "الم في صدري وكتفي",
    "الم في صدري ودراعي", "وجع في صدري وكتفي", "وجع في صدري ودراعي", "صدري مع كتفي الشمال", "صدري مع دراعي الشمال",
    "الم الصدر مع الفك", "وجع في الصدر مع الفك", "وجع في الصدر", "الم في الصدر", "ألم في الصدر", "ضغط على صدري",
    "chest pain", "heart attack", "myocardial infarction", "angina",
    // Stroke (FAST signs)
    "شلل", "اعوجاج في الفم", "بقي اتعوج", "كلامي تقيل", "مش عارف اتكلم", "تنميل نصفي", "نص جسمي وقف",
    "ضعف مفاجئ في ايدي", "مش قادر احرك نص جسمي", "stroke", "face drooping", "speech slurred",
    // Severe breathing / suffocation
    "كرشة نفس حادة", "مش قادر اخد نفسي خالص", "مش قادر اتنفس خالص", "شفايفي زرقت", "شفايفي زرقة",
    "اختناق شديد", "cannot breathe", "suffocating",
    // Severe bleeding & trauma
    "قيء دم", "استفراغ دم", "برجع دم", "كحة دم", "نزيف حاد", "نزيف شديد", "حادثة", "خبطة في راسي واغمى",
    "فقدان وعي", "اغمى عليه", "غيبوبة", "تشنجات عنيفة", "seizure", "unconscious", "coughing blood"
].map(normalizeMedicalText);

const URGENT_CARE_KEYWORDS = [
    "سخونية عالية", "حرارة 39", "حرارة 40", "رعشة شديدة", "نزلة معوية", "ترجيع مستمر", "اسهال حاد",
    "مغص كلوي", "الم فظيع في جنبي", "حصوة", "حرقان بول شديد", "حرق ماء مغلي", "حرق سطحي", "صداع نصفي حاد",
    "الام حادة", "high fever", "severe vomiting", "kidney stone", "acute pain"
].map(normalizeMedicalText);

interface SpecialtyRule {
    nameEn: string;
    nameAr: string;
    dbMatcher: string; // used to query database specializations
    keywords: string[];
    explanationAr: string;
    explanationEn: string;
}

const SPECIALTY_RULES: SpecialtyRule[] = [
    {
        nameEn: "Cardiology",
        nameAr: "أمراض القلب والأوعية الدموية",
        dbMatcher: "Cardiology",
        keywords: [
            "قلب", "قلبي", "قلبى", "بيوجعني قلبي", "وجع في قلبي", "الم في قلبي", "ألم في قلبي",
            "قلبي بيوجعني", "قلبي وجعني", "قلبي واجعني", "وجع قلب", "الم قلب", "ألم قلب",
            "نغزة في قلبي", "نغزات في قلبي", "نغزة في القلب", "نغزات في الصدر", "نغزة", "نغزات",
            "ضربات قلب", "ضربات قلبي", "دقات قلبي", "نبضات قلبي", "دقات قلب", "دقات سريعة",
            "ضربات قلبي سريعة", "تسارع ضربات القلب", "تسارع نبضات", "خفقان", "رفرفة في القلب",
            "رفرفة بالقلب", "رفرفة", "اضطراب نبض", "اضطراب ضربات", "ضغط", "ضغط دم", "ضغط دمي",
            "ضغط عالي", "ضغط الدم", "ضغط مرتفع", "ضغط واطي", "هبوط في الضغط", "شرايين", "شريان",
            "شرايين تاجية", "قصور شرايين", "صمام القلب", "صمامات القلب", "عضلة القلب",
            "رسم قلب", "تخطيط قلب", "ايكو", "إيكو", "قسطرة", "تورم رجلين مع نهجان", "نهجان مع المشي",
            "cardiology", "cardiologist", "heart", "cardiac", "palpitations", "hypertension", "ecg"
        ],
        explanationAr: "الأعراض المتعلقة بالقلب والأوعية الدموية (مثل آلام أو نغزات القلب المستقرة، الخفقان واضطراب النبضات، أو عدم انتظام ضغط الدم) تقع ضمن اختصاص استشاري أمراض القلب والأوعية الدموية لإجراء الفحوصات الطبية الدقيقة (مثل رسم القلب ECG وموجات إيكو الصوتية) وتحديد العلاج المناسب.",
        explanationEn: "Cardiac-related symptoms (such as mild chest or heart discomfort, palpitations, irregular pulse, or blood pressure issues) indicate a cardiologist evaluation for ECG, Echocardiogram, and optimal medical management."
    },
    {
        nameEn: "Neurology",
        nameAr: "أمراض المخ والأعصاب",
        dbMatcher: "Neurology",
        keywords: [
            "راس", "راسي", "رأسي", "راسي وجعاني", "راسي واجعاني", "راسي بتوجعني", "وجع في راسي", "الم في راسي",
            "دماغي", "دماغي وجعاني", "دماغي بتوجعني", "نافوخي", "حاسس دماغي هتنفجر", "مخ", "دماغ",
            "اعصاب", "أعصاب", "عصب", "صداع", "صداع نصفي", "صداع كلي", "صداع مزمن", "صداع شديد", "شقيقة",
            "دوار", "دوخة", "دوخه", "دايخ", "دايخة", "توهان", "عدم اتزان", "زغللة مع دوخة", "تنميل",
            "تنميل ايد", "تنميل في الاطراف", "شكشكة", "شكشكة في الاطراف", "حرقان اعصاب", "عصب سابع",
            "عصب خامس", "رعشة", "رعشة ايدين", "باركنسون", "صرع", "كهربا زيادة", "شحنات زيادة",
            "فقدان تركيز", "نسيان مفاجئ", "التهاب اعصاب", "عرق النسا", "التهاب العصب الوركي",
            "فقرات عنقية ضاغطة على العصب", "دكتور مخ واعصاب", "neurology", "neurologist", "migraine", "headache", "dizziness", "vertigo", "numbness", "nerve"
        ],
        explanationAr: "الصداع المستمر، نوبات الشقيقة، الدوار أو التنميل وضعف الأعصاب تتطلب فحصاً لدى طبيب مخ وأعصاب للتأكد من سلامة الجهاز العصبي والتروية الدموية الدماغية.",
        explanationEn: "Persistent headache, migraine, dizziness, or peripheral numbness requires a neurologist consultation to evaluate the nervous system."
    },
    {
        nameEn: "Orthopedic Surgery",
        nameAr: "جراحة العظام والمفاصل",
        dbMatcher: "Orthopedic",
        keywords: [
            "رجل", "رجلي", "رجليا", "رجلي وجعاني", "رجلي واجعاني", "رجلي بتوجعني", "رجلي وجعتني",
            "وجع في رجلي", "الم في رجلي", "وجع رجلي", "الم رجلي", "ساق", "ساقي", "سيقان", "فخذ", "فخذي",
            "ركبة", "ركبتي", "الركبة", "ركبي", "ركبتي وجعاني", "ركبتي واجعاني", "ركبتي بتوجعني",
            "كوع", "كوعي", "كتف", "كتفي", "كتفي واجعني", "كتفي بيوجعني", "كتفي وجعني", "كتافي", "كتافي وجعاني",
            "حوض", "حوضي", "كاحل", "كاحلي", "انكل", "قدم", "قدمي", "اقدام", "كعب", "كعبي", "كعب رجلي",
            "كعبي واجعني", "كعبي بيوجعني", "بطن رجلي", "صباع رجلي", "صوابع رجلي", "صوابعي", "صوابع ايدي", "اصابع",
            "ضهر", "ضهري", "ضهري واجعني", "ضهري بيوجعني", "ضهري وجعني", "ظهر", "ظهري", "وجع ضهري",
            "الم ظهر", "الم الظهر", "اسفل الظهر", "اسفل الضهر", "رقبة", "رقبتي", "رقبتي وجعاني", "رقبتي واجعاني",
            "رقبتي بتوجعني", "فقرات", "فقرة", "عمود فقري", "عظام", "عظم", "عضم", "عضمي", "عضامي",
            "عضمي بيوجعني", "مفاصل", "مفصل", "الم مفاصل", "التهاب مفاصل", "طقطقة مفاصل", "خشونة",
            "خشونة ركبة", "انزلاق غضروفي", "غضروف", "غضاريف", "ديسك", "دسك", "كسر", "شرخ", "جبس",
            "التواء", "ملخ", "تمزق اربطة", "رباط صليبي", "غضروف هلالي", "شوكة عظمية", "نقرس",
            "مش قادر امشي", "مش قادر اقف", "بعرج", "عرج", "دكتور عظام", "orthopedic", "bones", "joints", "knee", "spine", "back pain", "fracture"
        ],
        explanationAr: "آلام المفاصل، الظهر، الركبة، الساقين أو العظام ترجح استشارة طبيب جراحة عظام ومفاصل لتقييم صحة الغضاريف والمفاصل وتحديد الفحوصات أو العلاج الطبيعي المناسب.",
        explanationEn: "Joint, spine, knee, leg, or bone pain indicates consulting an orthopedic specialist to evaluate joints, ligaments, and cartilage."
    },
    {
        nameEn: "Pulmonology",
        nameAr: "أمراض الصدر والجهاز التنفسي",
        dbMatcher: "Pulmonology",
        keywords: [
            "رئة", "رئتين", "صدر", "صدري", "جهاز تنفسي", "قصبة هوائية", "شعب هوائية",
            "كحة", "كحه", "سعال", "بلغم", "كحة ناشفة", "كحة ببلغم", "تزييق", "تزييقة صدر",
            "صفير في الصدر", "نهجان", "ضيق نفس", "كرشة نفس", "مش قادر اخد نفسي كويس",
            "ربو", "ازمة ربوية", "حساسية صدر", "التهاب رئوي", "التهاب شعبي", "نزلة شعبية",
            "تدخين", "شيشة", "pulmonology", "lungs", "cough", "phlegm", "asthma", "bronchitis", "wheezing"
        ],
        explanationAr: "أعراض السعال المستمر، البلغم، الحساسية الصدرية، أو الربو تستدعي كشفاً لدى استشاري أمراض صدرية لتنظيم وظائف الرئة وكتابة موسعات الشعب الهوائية المناسبة.",
        explanationEn: "Persistent cough, wheezing, bronchitis, or asthma warrants consultation with a pulmonologist to optimize lung function."
    },
    {
        nameEn: "Ophthalmology",
        nameAr: "طب وجراحة العيون والرمد",
        dbMatcher: "Ophthalmology",
        keywords: [
            "عين", "عيني", "عينيا", "عيون", "العيون", "عيوني", "عيني وجعاني", "عيني واجعاني", "عيني بتوجعني", "عيني وجعتني",
            "وجع عين", "الم عين", "وجع في عيني", "الم في عيني", "احمرار عين", "عيني محمرة", "حرقان في العين",
            "افرازات عين", "عماص", "دموع مستمرة", "دموع في عيني", "جفاف عين", "عيني ناشفة", "زغللة", "زغلله",
            "تشوش رؤية", "مش شايف كويس", "مش شايفه كويس", "نقص نظر", "نظري ضعف", "نظارة", "نظاره", "كشف نظر",
            "فحص قاع عين", "قصر نظر", "طول نظر", "استجماتيزم", "مياه بيضاء", "مية بيضا", "مياه زرقاء", "مية زرقا",
            "ضغط العين", "قرنية", "شبكية", "انفصال شبكية", "جفن", "جفني", "حبة في الجفن", "شحات العين",
            "كيس دهني في الجفن", "حساسية عين", "رمد", "طبيب عيون", "دكتور عيون", "eye", "eyes", "vision", "cataract", "glaucoma", "retina", "ophthalmology"
        ],
        explanationAr: "مشاكل الإبصار، احمرار أو التهابات العينين، الزغللة أو الجفاف تستلزم فحصاً دقيقاً لدى استشاري طب وجراحة العيون (رمد).",
        explanationEn: "Eye irritation, redness, vision changes, or blurry vision requires an ophthalmologist examination."
    },
    {
        nameEn: "ENT",
        nameAr: "الأنف والأذن والحنجرة",
        dbMatcher: "ENT",
        keywords: [
            "ودن", "ودني", "ودني وجعاني", "ودني واجعاني", "ودني بتوجعني", "وداني", "اذن", "أذن", "اذني",
            "وجع ودن", "الم اذن", "وجع في ودني", "طنين", "طنين اذن", "وش في الودن", "ودني بتصفر", "افرازات اذن",
            "صديد من ودني", "ثقب طبلة", "ضعف سمع", "مش سامع كويس", "انف", "أنف", "مناخير", "مناخيري", "جيوب انفية",
            "انسداد انف", "رشح", "زكام", "خنفان", "عطس", "فقدان الشم", "مش شامم", "نزيف انف", "رعاف", "لحمية",
            "لحمية الانف", "حلق", "حلقي", "حلقي واجعني", "زور", "زوري", "زوري واجعني", "زوري بيوجعني", "وجع حلق",
            "احتقان زور", "احتقان في الزور", "صعوبة بلع", "مش قادر ابلع", "لوز", "اللوز", "اللوز وجعاني", "التهاب لوز",
            "صديد على اللوز", "حنجرة", "احبال صوتية", "صوتي رايح", "بحة صوت", "دكتور انف واذن", "ent", "ear", "nose", "throat", "sinus", "tonsils", "tonsillitis"
        ],
        explanationAr: "التهاب الحلق، احتقان الأنف، الجيوب الأنفية، اللوز أو آلام وطنين الأذن تقع ضمن اختصاص طبيب أنف وأذن وحنجرة.",
        explanationEn: "Sore throat, ear pain, tonsillitis, or sinus congestion points toward an ENT specialist."
    },
    {
        nameEn: "Dentistry",
        nameAr: "طب وجراحة الفم والأسنان",
        dbMatcher: "General Practice",
        keywords: [
            "سنان", "سناني", "سناني وجعاني", "سناني واجعاني", "أسناني", "اسنان", "وجع اسنان", "الم اسنان",
            "وجع في سناني", "ضرس", "ضرسي", "ضرسي واجعني", "ضرسي وجعني", "ضرسي بيوجعني", "ضروسي", "وجع ضرس",
            "الم ضرس", "تسوس", "سوسة", "حشو", "حشو عصب", "عصب الضرس", "خلع ضرس", "ضرس العقل", "لثة", "لثتي",
            "نزيف لثة", "التهاب لثة", "خراج ضرس", "خراج في الاسنان", "تبييض اسنان", "تقويم اسنان", "زراعة اسنان",
            "طربوش", "تلبيسة", "فكي بيطقطق", "دكتور اسنان", "طبيب اسنان", "dental", "dentist", "tooth", "teeth", "molar"
        ],
        explanationAr: "آلام الأسنان، تسوس الضروس، التهابات اللثة أو خراج الفم تستدعي فحصاً سريرياً لدى طبيب الأسنان لعلاج العصب أو الحشو المناسب.",
        explanationEn: "Toothache, cavities, gum bleeding, or molar pain warrants an in-person dental consultation."
    },
    {
        nameEn: "Dermatology",
        nameAr: "الجلدية والتناسلية والشعر",
        dbMatcher: "Dermatology",
        keywords: [
            "جلد", "جلدي", "جلدي بيحرقني", "جلدي بيهرشني", "بشرة", "بشرتي", "فروة راس", "شعر", "شعري",
            "شعري بيقع", "تساقط شعر", "صلع", "ثعلبة", "قشرة", "قشرة في شعري", "اظافر", "ضوافر", "حبوب",
            "حب شباب", "حبوب في الوش", "حبوب في ضهري", "بثور", "هرش", "حكة", "حكه", "بهارش", "طفح",
            "طفح جلدي", "احمرار في جلدي", "حساسية جلدية", "ارتيكاريا", "اكزيما", "إكزيما", "صدفية", "بهاق",
            "فطريات", "تينيا", "تينيا بين الصوابع", "بقع بيضاء", "بقع بنية", "تصبغات", "كلف", "نمش",
            "زوائد جلدية", "عين سمكة", "سنط", "حزام ناري", "حروق شمس", "دكتور جلدية", "dermatology", "skin", "rash", "acne", "hair loss", "alopecia", "eczema", "psoriasis", "itching"
        ],
        explanationAr: "الأعراض الجلدية (مثل الحبوب، الطفح، الحكة، الأكزيما، أو تساقط الشعر) تتطلب استشارة طبيب جلدية لتشخيص الحالة ووصف العلاج المناسب.",
        explanationEn: "Skin issues, rashes, acne, or hair loss problems are best handled by a licensed dermatologist for proper diagnosis and therapy."
    },
    {
        nameEn: "Pediatrics",
        nameAr: "طب الأطفال وحديثي الولادة",
        dbMatcher: "Pediatrics",
        keywords: [
            "طفل", "طفلي", "طفلتي", "اطفال", "أطفال", "ابني", "بنتي", "البيبي", "بيبي",
            "رضيع", "رضيعة", "حديث ولادة", "تسنين", "تطعيمات اطفال", "صفرا اطفال",
            "مغص رضع", "ترجيع طفل", "سخونية طفل", "كحة طفل", "وزن الطفل", "رضاعة", "فطام",
            "pediatric", "pediatrics", "pediatrician", "child", "baby", "infant"
        ],
        explanationAr: "بما أن الشكوى تخص طفلاً، يُنصح باستشارة طبيب متخصص في طب الأطفال وحديثي الولادة لتحديد الجرعات المناسبة حسب الوزن والعمر بدقة.",
        explanationEn: "Since the complaint concerns a child, a pediatric specialist is recommended to evaluate pediatric-specific care and dosing."
    },
    {
        nameEn: "Obstetrics & Gynecology",
        nameAr: "النساء والتوليد والصحة الإنجابية",
        dbMatcher: "Obstetrics",
        keywords: [
            "رحم", "مبايض", "مهبل", "ثدي", "حوض", "حمل", "حامل", "متابعة حمل", "اختبار حمل",
            "تاخر حمل", "انجاب", "ولادة", "ولاده قيصرية", "سونار حمل", "دورة شهرية",
            "الدورة", "البيريود", "تاخر دورة", "لخبطة دورة", "نزيف مهبلي", "افرازات نسائية",
            "حكة مهبلية", "مغص الدورة", "تكيس مبايض", "تكيسات", "بطانة الرحم المهاجرة",
            "اورام ليفية", "وسيلة منع حمل", "لولب", "حبوب منع الحمل", "الم الثدي",
            "gynecology", "obstetrics", "pregnancy", "period", "ovary", "pcos"
        ],
        explanationAr: "متابعة الحمل، اضطرابات الدورة الشهرية أو الأعراض النسائية وصحة المرأة تتبع اختصاص طبيبة/طبيب النساء والتوليد.",
        explanationEn: "Menstrual irregularities, pregnancy care, fertility, or pelvic pain points to OB/GYN specialty."
    },
    {
        nameEn: "Urology",
        nameAr: "جراحة المسالك البولية والتناسلية",
        dbMatcher: "Urology",
        keywords: [
            "بول", "البول", "مسالك", "مسالك بولية", "حرقان بول", "حرقان في البول", "صعوبة تبول", "تقطيع بول",
            "حصر بول", "مش عارف اتبول", "دم في البول", "تغير لون البول", "صديد في البول", "املاح في البول",
            "كلى", "كلية", "كليتي", "كليتي وجعاني", "كليتي واجعاني", "وجع في كليتي", "الم في كليتي",
            "مغص كلوي", "جنبي بيوجعني من ورا", "وجع في جنبي", "الم في جنبي", "حصوة", "حصوات", "حصوة كلى",
            "مثانة", "حالب", "بروستاتا", "تضخم بروستاتا", "احتقان بروستاتا", "خصية", "الخصية", "خصيتي",
            "وجع خصية", "الم في الخصية", "دوالي خصية", "ضعف انتصاب", "دكتور مسالك", "urology", "urine", "kidney stone", "prostate"
        ],
        explanationAr: "حرقان البول، آلام الكلى أو المغص الكلوي والحصوات والبروستاتا تستدعي استشارة طبيب جراحة مسالك بولية لتحديد الفحوصات والعلاج.",
        explanationEn: "Urinary burning, kidney pain, stones, or prostate symptoms call for a urologist evaluation."
    },
    {
        nameEn: "Gastroenterology",
        nameAr: "أمراض الجهاز الهضمي والكبد",
        dbMatcher: "Gastroenterology",
        keywords: [
            "جهاز هضمي", "معدة", "معدتي", "معدتي وجعاني", "معدتي واجعاني", "معدتي بتوجعني", "وجع في معدتي",
            "الم في معدتي", "بطن", "بطني", "بطني وجعاني", "بطني واجعاني", "بطني بتوجعني", "وجع في بطني",
            "الم في بطني", "مغص", "مغص في بطني", "مريء", "حموضة", "حرقان في المعدة", "فم المعدة",
            "ارتجاع", "ارتجاع مريء", "قولون", "قولوني", "قولون عصبي", "انتفاخ", "غازات",
            "سوء هضم", "عسر هضم", "جرثومة المعدة", "جرثومة معدة", "قرحة معدة", "اسهال",
            "امساك", "ترجيع", "استفراغ", "غممان نفس", "كبد", "مرارة", "التهاب مرارة", "دهون على الكبد",
            "انزيمات كبد", "فيروس سي", "فيروس بي", "دكتور جهاز هضمي", "gastroenterology", "stomach", "gerd", "colon", "liver"
        ],
        explanationAr: "اضطرابات المعدة، القولون العصبي، ارتجاع المريء، جرثومة المعدة، أو وظائف الكبد والمرارة تقع ضمن اختصاص استشاري الجهاز الهضمي والكبد.",
        explanationEn: "Gastric issues, acid reflux, IBS, stomach ulcers, or liver conditions warrant a gastroenterology evaluation."
    },
    {
        nameEn: "Endocrinology",
        nameAr: "الغدد الصماء والسكري",
        dbMatcher: "Endocrinology",
        keywords: [
            "غدة", "الغدة", "غدد", "الغدد", "غدد صماء", "دكتور غدد", "غدة درقية", "خمول غدة", "نشاط غدة", "تضخم غدة", "هرمونات",
            "سكر", "مرض السكر", "سكر تراكمي", "سكر عالي", "سكر واطي", "غيبوبة سكر",
            "مقاومة انسولين", "انسولين", "عطش شديد وتبول كتير", "نحافة مفاجئة", "سمنة هرمونية",
            "كورتيزون", "endocrinology", "diabetes", "thyroid", "insulin"
        ],
        explanationAr: "اضطرابات السكر، الغدة الدرقية، مقاومة الأنسولين أو المشاكل الهرمونية تستوجب متابعة استشاري الغدد الصماء والسكري.",
        explanationEn: "Diabetes management, thyroid disorders, and hormonal imbalances are best addressed by an endocrinologist."
    },
    {
        nameEn: "Psychiatry",
        nameAr: "الطب النفسي وعلاج الإدمان",
        dbMatcher: "Psychiatry",
        keywords: [
            "نفسي", "اكتئاب", "حزن شديد", "قلق", "توتر", "نوبة هلع", "نوبات هلع", "بانيك اتاك",
            "فوبيا", "خوف بدون سبب", "ارق", "أرق", "مش عارف انام", "كوابيس", "وسواس",
            "وسواس قهري", "تفكير زايد", "خنقة نفسية", "فقدان شغف", "عزلة", "بكاء مستمر",
            "تقلب مزاج", "ثنائي القطب", "فرط حركة", "تشتت انتباه", "ادمان", "علاج ادمان",
            "psychiatry", "depression", "anxiety", "panic attack", "insomnia", "ocd"
        ],
        explanationAr: "نوبات القلق، الأرق المستمر، الاكتئاب أو اضطرابات المزاج تستفيد كثيراً من استشارة طبيب نفسي مرخص في سرية وأمان تامين.",
        explanationEn: "Anxiety, persistent insomnia, depressive mood, or panic episodes call for a licensed psychiatrist consultation."
    },
    {
        nameEn: "General Surgery",
        nameAr: "الجراحة العامة والمناظير",
        dbMatcher: "General Surgery",
        keywords: [
            "جراحة", "عملية", "زائدة", "زايدة", "زائدة دودية", "فتق", "فتق اربي", "فتق سري",
            "بواسير", "شرخ", "شرخ شرجي", "ناسور", "ناسور عصعصي", "خراج", "دمل", "خراج صديدي",
            "كيس دهني", "ورم دهني", "استئصال", "مرارة بالمنظار", "surgery", "appendix", "hernia", "hemorrhoids"
        ],
        explanationAr: "الأعراض الجراحية (مثل الاشتباه في التهاب الزائدة، الفتق، البواسير، الخراجات أو التدخلات الجراحية) تتطلب تقييماً لدى استشاري الجراحة العامة.",
        explanationEn: "Symptoms related to appendicitis, hernia, hemorrhoids, or abscesses warrant a General Surgery consultation."
    },
    {
        nameEn: "Rheumatology",
        nameAr: "أمراض الروماتيزم والمناعة الذاتية",
        dbMatcher: "Rheumatology",
        keywords: [
            "روماتيزم", "روماتويد", "الذئبة الحمراء", "الذئبه الحمراء", "تيبس الصباح", "تيبس مفاصل",
            "الم مفاصل متفرق", "التهاب اوتار", "فيبروميالجيا", "الم العضلات المزمن", "حمى روماتيزمية",
            "دكتور روماتيزم", "مناعة ذاتية", "rheumatology", "rheumatoid", "lupus", "fibromyalgia"
        ],
        explanationAr: "آلام المفاصل المتنقلة، التيبس الصباحي، أو أعراض أمراض المناعة الذاتية والروماتويد تتطلب مراجعة استشاري أمراض الروماتيزم والمفاصل.",
        explanationEn: "Morning stiffness, multiple joint pain, or suspected autoimmune disorders warrant a rheumatologist consultation."
    },
    {
        nameEn: "Nephrology",
        nameAr: "أمراض الكلى والغسيل الكلوي",
        dbMatcher: "Nephrology",
        keywords: [
            "فشل كلوي", "قصور كلوي", "غسيل كلى", "وظائف كلى", "كرياتينين", "زلال في البول",
            "بروتين في البول", "املاح يوريك اسيد", "التهاب كلى مناعي", "تورم الجسم مع قلة بول",
            "دكتور كلى", "nephrology", "kidney failure", "creatinine", "dialysis"
        ],
        explanationAr: "اضطراب وظائف الكلى، ارتفاع الكرياتينين، أو زلال البول يستوجب متابعة دقيقة مع استشاري أمراض الكلى.",
        explanationEn: "Renal impairment, elevated creatinine, or proteinuria requires ongoing care from a nephrologist."
    },
    {
        nameEn: "Allergy & Immunology",
        nameAr: "الحساسية والمناعة",
        dbMatcher: "Allergy",
        keywords: [
            "حساسية", "مناعة", "ضعف مناعة", "حساسية طعام", "حساسية ادوية", "حساسية موسمية",
            "ارتيكاريا مزمنة", "اختبار حساسية", "نقص مناعة", "allergy", "immunology", "immune"
        ],
        explanationAr: "نوبات الحساسية المتكررة، الحساسية الموسمية أو اضطرابات الجهاز المناعي تستدعي استشارة استشاري الحساسية والمناعة.",
        explanationEn: "Recurrent allergic reactions or immune system evaluation indicates an allergy and immunology specialist."
    },
    {
        nameEn: "Nutrition & Dietetics",
        nameAr: "التغذية العلاجية وعلاج السمنة",
        dbMatcher: "Nutrition",
        keywords: [
            "تغذية", "تغذية علاجية", "دايت", "رجيم", "سمنة", "تخسيس", "نحافة", "زيادة وزن",
            "تثبيت وزن", "نظام غذائي", "كالوري", "سعرات", "سمنة مفرطة", "دكتور تغذية", "nutrition", "diet"
        ],
        explanationAr: "تنظيم الوزن، علاج السمنة أو النحافة، وتصميم الأنظمة الغذائية العلاجية لمرضى السكر والضغط يتم بإشراف استشاري التغذية العلاجية.",
        explanationEn: "Weight management, obesity therapy, and specialized medical diets are best guided by a clinical nutritionist."
    },
    {
        nameEn: "Internal Medicine",
        nameAr: "الطب الباطني وطب الأسرة",
        dbMatcher: "Internal Medicine",
        keywords: [
            "باطنة", "باطني", "سخونية", "سخونة", "حرارة", "حمى", "سخن", "درجة حرارتي عالية",
            "رعشة", "برد", "نزلة برد", "انفلونزا", "تكسير في عضمي", "تكسير في الجسم",
            "همدان", "تعبان", "ارهاق", "خمول", "تعب عام", "فقدان شهية", "طب عام", "طب اسرة",
            "كشف عام", "fever", "flu", "cold", "internal medicine", "general physician"
        ],
        explanationAr: "الأعراض الباطنية والعامة (مثل السخونية، التعب العام، نزلات البرد والإنفلونزا) تقع ضمن اختصاص الطب الباطني وطب الأسرة لتشخيص سبب العدوى وتحديد بروتوكول العلاج.",
        explanationEn: "General medical symptoms (such as fever, body aches, flu, or fatigue) point toward Internal Medicine and Family Practice."
    }
];

function mapDocSpecsToSuggestions(docSpecs: any[]): TriageDoctorSuggestion[] {
    const seen = new Set<string>();
    const suggestions: TriageDoctorSuggestion[] = [];

    for (const item of docSpecs) {
        const doc = item.doctor_profiles;
        if (!doc || seen.has(doc.id)) continue;
        seen.add(doc.id);

        suggestions.push({
            id: doc.id,
            profileId: doc.profile_id,
            fullName: doc.profiles?.full_name || "دكتور طبيبي",
            avatarUrl: doc.profiles?.avatar_url || null,
            specialty: item.specializations?.name_en || "General Practice",
            specialtyAr: item.specializations?.name_ar || "طب عام",
            ratingAverage: Number(doc.rating_average) || 4.9,
            ratingCount: doc.rating_count || 12,
            yearsOfExperience: doc.years_of_experience || 5,
            consultationFee: Number(doc.consultation_fee) || 200,
            isAvailableNow: Boolean(doc.is_available_now),
            slug: doc.slug || null,
        });

        if (suggestions.length >= 3) break;
    }
    return suggestions;
}

/**
 * Fetch top verified doctors for a given specialization using relational query
 */
async function fetchDoctorsForSpecialty(specialtyMatcher: string): Promise<TriageDoctorSuggestion[]> {
    try {
        const supabase = await createClient();

        // 1. Find matching specialization IDs
        const { data: specs } = await supabase
            .from("specializations")
            .select("id, name_en, name_ar")
            .or(`name_en.ilike.%${specialtyMatcher}%,name_ar.ilike.%${specialtyMatcher}%`);

        let specIds = (specs || []).map((s: any) => s.id);

        // If no spec matched directly, fallback to General Practice & Internal Medicine IDs
        if (specIds.length === 0) {
            const { data: fallbackSpecs } = await supabase
                .from("specializations")
                .select("id")
                .or("name_en.ilike.%Internal Medicine%,name_en.ilike.%General Practice%,name_en.ilike.%Family Medicine%");
            specIds = (fallbackSpecs || []).map((s: any) => s.id);
        }

        // 2. Query verified doctors having this specialization
        const { data: docSpecs, error } = await supabase
            .from("doctor_specializations")
            .select(`
                doctor_profile_id,
                is_primary,
                specializations (
                    id,
                    name_en,
                    name_ar
                ),
                doctor_profiles!inner (
                    id,
                    profile_id,
                    slug,
                    years_of_experience,
                    consultation_fee,
                    is_available_now,
                    rating_average,
                    rating_count,
                    verification_status,
                    profiles!doctor_profiles_profile_id_fkey (
                        id,
                        full_name,
                        avatar_url
                    )
                )
            `)
            .in("specialization_id", specIds)
            .eq("doctor_profiles.verification_status", "verified")
            .order("is_primary", { ascending: false })
            .limit(10);

        if (!error && docSpecs && docSpecs.length > 0) {
            return mapDocSpecsToSuggestions(docSpecs);
        }

        // 3. Fallback: if no doctor found for this specific sub-specialty, return General Practice/Family doctors
        const { data: generalSpecs } = await supabase
            .from("specializations")
            .select("id")
            .or("name_en.ilike.%General Practice%,name_en.ilike.%Family Medicine%,name_en.ilike.%Internal Medicine%");

        const generalIds = (generalSpecs || []).map((s: any) => s.id);
        if (generalIds.length > 0) {
            const { data: generalDocSpecs } = await supabase
                .from("doctor_specializations")
                .select(`
                    doctor_profile_id,
                    is_primary,
                    specializations (id, name_en, name_ar),
                    doctor_profiles!inner (
                        id, profile_id, slug, years_of_experience, consultation_fee,
                        is_available_now, rating_average, rating_count, verification_status,
                        profiles!doctor_profiles_profile_id_fkey (id, full_name, avatar_url)
                    )
                `)
                .in("specialization_id", generalIds)
                .eq("doctor_profiles.verification_status", "verified")
                .limit(5);

            if (generalDocSpecs && generalDocSpecs.length > 0) {
                return mapDocSpecsToSuggestions(generalDocSpecs);
            }
        }

        return [];
    } catch (err) {
        console.error("Error fetching triage doctors:", err);
        return [];
    }
}

/**
 * Main Triage Assessment Action
 */
export async function assessSymptoms(input: {
    message: string;
    language?: "ar" | "en";
}): Promise<TriageResponse> {
    const rawNormalized = normalizeMedicalText(input.message || "");
    const isEn = input.language === "en";

    // 1. Check for Conversational Acknowledgments & Greetings & Inquiries
    const GREETING_WORDS = ["سلام عليكم", "السلام عليكم", "صباح الخير", "مساء الخير", "مرحبا", "اهلا", "اهلين", "هاي", "الو", "hello", "hi"].map(normalizeMedicalText);
    const isGreeting = GREETING_WORDS.some(w => rawNormalized === w || rawNormalized.startsWith(w + " ") || rawNormalized.endsWith(" " + w));
    if (isGreeting) {
        return {
            urgencyLevel: "routine",
            titleAr: "أهلاً بك في طبيبي",
            titleEn: "Welcome to Tabibi",
            summaryAr: "أهلاً وسهلاً بك! تفضل بكتابة الأعراض أو المشكلة الصحية التي تشعر بها، وسأساعدك فوراً في تحديد التخصص المناسب وترشيح أفضل الأطباء المتاحين.",
            summaryEn: "Welcome! Please describe the symptoms you are experiencing, and I will match you with the right specialty and top doctors immediately.",
            primarySpecialtyEn: "General Practice",
            primarySpecialtyAr: "طب عام",
            adviceAr: "اكتب الأعراض بالعامية مثل: (عندي مغص، وجع في ضهري، صداع، نغزة في القلب...).",
            adviceEn: "Describe your symptoms (e.g. back pain, migraine, abdominal cramps, chest discomfort...).",
            suggestedDoctors: [],
            urgentQueueAvailable: false,
            conversationalReply: {
                textAr: "أهلاً وسهلاً بك في طبيبي! 🩺 تفضل بكتابة العرض أو الشكوى الصحية اللي حاسس بيها (مثلاً: وجع في الضهر، صداع، مغص، نغزة في القلب، سخونية...) وهساعدك تختار التخصص والدكتور الأنسب لحالتك فوراً.",
                textEn: "Welcome to Tabibi! 🩺 Please write down your symptoms (e.g. back pain, migraine, stomach cramps, chest pressure...) and I'll immediately guide you to the right specialist."
            }
        };
    }

    const BOOKING_INQUIRIES = ["ازاي احجز", "طريقة الحجز", "كيف احجز", "عايز احجز", "طريقة الكشف", "احجز ازاي", "how to book"].map(normalizeMedicalText);
    const isBookingInquiry = BOOKING_INQUIRIES.some(w => rawNormalized.includes(w));
    if (isBookingInquiry) {
        return {
            urgencyLevel: "routine",
            titleAr: "طريقة حجز استشارة طبية",
            titleEn: "How to Book a Consultation",
            summaryAr: "يمكنك كتابة الأعراض التي تعاني منها هنا وسيرشح لك النظام الطبيب الأنسب، ثم تضغط على زر 'احجز' لتحديد الموعد المناسب لك ومتابعة الكشف عبر الفيديو.",
            summaryEn: "You can describe your symptoms here, and we will match you with the best specialist. Click 'Book' to choose your time slot and start your video consultation.",
            primarySpecialtyEn: "General Practice",
            primarySpecialtyAr: "طب عام",
            adviceAr: "يمكنك أيضاً تصفح شبكة الأطباء كاملة من قائمة الأطباء بالأعلى.",
            adviceEn: "You can also browse all specialists directly from the Doctors page.",
            suggestedDoctors: [],
            urgentQueueAvailable: false,
            conversationalReply: {
                textAr: "لحجز موعد كشف طبي بكل سهولة: 👨‍⚕️\n1. اكتبلي الأعراض اللي حاسس بيها هنا، وهطلعلك أفضل الدكاترة المعتمدين في التخصص ده فوراً.\n2. اضغط على زر 'احجز' عند الطبيب اللي تختاره لتحديد اليوم والميعاد المناسب لك.\nأو تقدر تتصفح قائمة الأطباء كاملة من القائمة الرئيسية بالأعلى.",
                textEn: "To book easily: 👨‍⚕️\n1. Describe your symptoms here and I will match top specialists.\n2. Click 'Book' on your chosen doctor to pick your preferred slot.\nYou can also browse all doctors from the top navigation."
            }
        };
    }

    const THANKS_WORDS = ["شكرا", "شكرا لك", "تسلم", "تمام", "اوك", "ok", "thanks", "thank you", "حبيبي", "عظيم", "ممتاز", "مفهوم", "خلاص", "الف شكر"].map(normalizeMedicalText);
    const isThanks = THANKS_WORDS.some(w => rawNormalized === w || rawNormalized.startsWith(w + " ") || rawNormalized.endsWith(" " + w));
    if (isThanks) {
        return {
            urgencyLevel: "routine",
            titleAr: "طبيبي في خدمتك دائماً",
            titleEn: "At Your Service",
            summaryAr: "على الرحب والسعة! أتمنى لك دوام الصحة والعافية والشفاء العاجل. يمكنك الضغط على 'احجز' عند أي طبيب لبدء استشارتك.",
            summaryEn: "You are most welcome! Wishing you great health and a speedy recovery. Click 'Book' whenever you are ready.",
            primarySpecialtyEn: "General Practice",
            primarySpecialtyAr: "طب عام",
            adviceAr: "في خدمتك دائماً لأي استفسار طبي.",
            adviceEn: "Always here to help with your healthcare needs.",
            suggestedDoctors: [],
            urgentQueueAvailable: false,
            conversationalReply: {
                textAr: "على الرحب والسعة يا فندم! 🩺 أتمنى لك دوام الصحة والعافية والشفاء العاجل. تقدر تضغط على زر 'احجز' عند أي دكتور بالأعلى لتحديد الميعاد، وأنا هنا في أي وقت لو عندك أي سؤال تاني.",
                textEn: "You are most welcome! Wishing you good health and a quick recovery. Feel free to click 'Book' on any doctor above, and let me know if you need any other assistance."
            }
        };
    }

    const isAdultConfirmation = ["شخص بالغ", "18 سنه", "انا بالغ", "شخص كبير", "انا كبير", "adult"].map(normalizeMedicalText).some(w => rawNormalized.includes(w));
    if (isAdultConfirmation) {
        const doctors = await fetchDoctorsForSpecialty("Internal Medicine");
        return {
            urgencyLevel: "routine",
            titleAr: "تأكيد فئة المريض: شخص بالغ",
            titleEn: "Patient Category: Adult",
            summaryAr: "تم تأكيد أن الكشف لشخص بالغ. استشارة الأطباء المعتمدين في الطب الباطني وطب الأسرة هي الأنسب لتقييم حالتك بدقة.",
            summaryEn: "Patient category confirmed: Adult. Internal Medicine and Family Practice specialists are ideal for comprehensive assessment.",
            primarySpecialtyEn: "Internal Medicine",
            primarySpecialtyAr: "الطب الباطني وطب الأسرة",
            adviceAr: "يمكنك اختيار الطبيب والضغط على 'احجز' لتحديد الموعد.",
            adviceEn: "Choose a doctor above and click 'Book' to proceed.",
            suggestedDoctors: doctors,
            urgentQueueAvailable: false,
            conversationalReply: {
                textAr: "تمام، تم تأكيد فئة المريض (شخص بالغ) 👨‍⚕️. رشحت لك أفضل الأطباء المعتمدين بالأعلى، تقدر تختار الطبيب الأنسب وتضغط على 'احجز' لاختيار الميعاد المناسب لك.",
                textEn: "Understood! Patient category confirmed as Adult 👨‍⚕️. Top verified specialists are shown above; click 'Book' on your chosen doctor to proceed."
            }
        };
    }

    const isChildClarification = ["طفل او رضيع", "طفل", "رضيع", "البيبي", "ابني", "بنتي", "child", "baby"].map(normalizeMedicalText).some(w => rawNormalized.includes(w)) && !rawNormalized.includes("بالغ");
    if (isChildClarification) {
        const pediaDoctors = await fetchDoctorsForSpecialty("Pediatrics");
        return {
            urgencyLevel: "routine",
            titleAr: "🩺 التخصص الموصى به: طب الأطفال وحديثي الولادة",
            titleEn: "🩺 Recommended Specialty: Pediatrics",
            summaryAr: "بما أن الشكوى تخص طفلاً أو رضيعاً، يُنصح باستشارة طبيب متخصص في طب الأطفال لتحديد الجرعات المناسبة حسب الوزن وفحص الطفل بدقة.",
            summaryEn: "Since the complaint is for a child, a pediatric specialist is recommended to evaluate pediatric-specific care.",
            primarySpecialtyEn: "Pediatrics",
            primarySpecialtyAr: "طب الأطفال وحديثي الولادة",
            adviceAr: "رشحنا لك أفضل أطباء الأطفال المعتمدين والمتاحين لحجز موعد فحص فوري.",
            adviceEn: "We matched you with top verified pediatricians for a video visit.",
            suggestedDoctors: pediaDoctors,
            urgentQueueAvailable: true,
            conversationalReply: {
                textAr: "ألف سلامة على الطفل! بما أن الشكوى تخص طفلاً، تم تحويل التوجيه فوراً لتخصص **طب الأطفال وحديثي الولادة** 👶، ورشحت لك أفضل دكاترة الأطفال المتاحين بالأعلى لضبط الجرعات بدقة حسب السن والوزن.",
                textEn: "Wishing the little one a speedy recovery! Since this concerns a child, I've routed this to **Pediatrics** 👶 with top pediatricians above."
            }
        };
    }

    // 2. Check for Emergency Red Flags
    const isRedFlag = RED_FLAG_KEYWORDS.some(rf => rawNormalized.includes(rf));
    if (isRedFlag) {
        return {
            urgencyLevel: "emergency",
            titleAr: "🚨 تنبيه طوارئ قصوى: توجه لأقرب مستشفى فوراً",
            titleEn: "🚨 Emergency Alert: Go to Nearest Hospital Immediately",
            summaryAr: "الأعراض المذكورة قد تشير إلى حالة طارئة وحرجة تتطلب تدخلاً طبياً عاجلاً وفحوصات فورية لا يمكن إجراؤها عن بُعد.",
            summaryEn: "The symptoms described may indicate a medical emergency requiring immediate in-person hospital care.",
            primarySpecialtyEn: "Emergency Medicine / ER",
            primarySpecialtyAr: "طب الطوارئ والعناية المركزة",
            adviceAr: "يرجى عدم الانتظار لكشف أونلاين. اتصل بالإسعاف المصري فوراً على رقم 123 أو توجه إلى أقرب قسم طوارئ مستشفى.",
            adviceEn: "Please do not wait for a telemedicine call. Dial Egyptian Ambulance at 123 or proceed to the nearest hospital emergency department immediately.",
            emergencyAction: {
                ambulanceNumber: "123",
                callTextAr: "اتصل بالإسعاف (123) الآن",
                callTextEn: "Call Egyptian Ambulance (123) Now",
                emergencyRoomAdviceAr: "إذا كان بإمكان شخص توصيلك بأمان، توجه فوراً إلى أقرب مستشفى مجهز بطوارئ قلب أو حوادث.",
                emergencyRoomAdviceEn: "If someone can drive you safely, go to the nearest emergency hospital immediately."
            },
            suggestedDoctors: [],
            urgentQueueAvailable: false,
        };
    }

    // 3. Check for Urgent Care (Immediate Video Consultation)
    const isUrgent = URGENT_CARE_KEYWORDS.some(uk => rawNormalized.includes(uk));

    // 4. Match against Comprehensive Specialties Knowledge Base
    let bestSpecialty: SpecialtyRule | null = null;
    let highestScore = 0;

    const words = rawNormalized.split(/\s+/);

    for (const rule of SPECIALTY_RULES) {
        let score = 0;
        for (const kw of rule.keywords) {
            const normKw = normalizeMedicalText(kw);
            if (rawNormalized.includes(normKw)) {
                // Longer phrases give significantly higher weight
                score += normKw.length * 2;
                // Extra bonus for standalone word match
                if (words.includes(normKw)) {
                    score += 8;
                }
            }
        }
        if (score > highestScore) {
            highestScore = score;
            bestSpecialty = rule;
        }
    }

    // Fallback if no specific specialty matched with confidence
    const isGenericFallback = !bestSpecialty || highestScore === 0;
    if (!bestSpecialty || highestScore === 0) {
        bestSpecialty = SPECIALTY_RULES[SPECIALTY_RULES.length - 1]; // Internal Medicine / General
    }

    // Query doctors for this specialty
    const suggestedDoctors = await fetchDoctorsForSpecialty(bestSpecialty.dbMatcher);

    // If urgent keywords matched or acute presentation:
    if (isUrgent) {
        return {
            urgencyLevel: "urgent",
            titleAr: "⚡ كشف طوارئ عاجل مُوصى به (Urgent Care)",
            titleEn: "⚡ Urgent Care Recommended (Available Now)",
            summaryAr: `بناءً على الأعراض الحادة التي وصفتها، يوصى بالدخول في كشف عاجل فوري عبر الفيديو لتقييم الحالة سريعاً ووصف مسكنات أو أدوية لتخفيف الألم، والتخصص الأقرب لحالتك هو: ${bestSpecialty.nameAr}.`,
            summaryEn: `Based on the acute symptoms described, an on-demand urgent tele-consultation is advised. The closest specialty is ${bestSpecialty.nameEn}.`,
            primarySpecialtyEn: bestSpecialty.nameEn,
            primarySpecialtyAr: bestSpecialty.nameAr,
            adviceAr: "يمكنك الآن الدخول مباشرة في طابور الطوارئ الافتراضي، وأقرب طبيب متاح سيبدأ معك مكالمة الفيديو في خلال دقائق.",
            adviceEn: "You can enter our virtual urgent care queue right away to connect with an available doctor in minutes.",
            suggestedDoctors,
            urgentQueueAvailable: true,
            followUpQuestions: [
                {
                    questionAr: "منذ متى بدأت هذه الأعراض الحادة؟",
                    questionEn: "When did these acute symptoms start?",
                    options: [
                        { textAr: "اليوم (أقل من 24 ساعة)", textEn: "Today (<24 hours)", actionValue: "duration_today" },
                        { textAr: "منذ 2-3 أيام", textEn: "2-3 days ago", actionValue: "duration_few_days" },
                        { textAr: "أكثر من أسبوع", textEn: "More than a week", actionValue: "duration_week" },
                    ]
                }
            ]
        };
    }

    // If generic fallback (no specialty explicitly matched)
    if (isGenericFallback) {
        return {
            urgencyLevel: "routine",
            titleAr: "🩺 التخصص الموصى به: الطب الباطني وطب الأسرة",
            titleEn: "🩺 Recommended Specialty: Internal Medicine & Family Practice",
            summaryAr: "بناءً على الأعراض التي وصفتها، يُنصح بالبدء باستشارة طبيب ممارس عام أو استشاري الطب الباطني؛ حيث يقوم الطبيب بفحص الحالة بشكل شامل وإجراء الفحوصات المبدئية أو توجيهك للتخصص الدقيق عند الحاجة.",
            summaryEn: "Based on the symptoms described, we recommend starting with an Internal Medicine or Family Practice physician for a comprehensive evaluation, initial tests, and referrals if required.",
            primarySpecialtyEn: "Internal Medicine",
            primarySpecialtyAr: "الطب الباطني وطب الأسرة",
            adviceAr: "حالتك مناسبة لاستشارة أونلاين مجدولة بالفيديو. رشحنا لك أفضل أطباء الباطنة المعتمدين للاختيار بينهم وحجز الموعد المناسب لك.",
            adviceEn: "Your condition is suitable for a scheduled video consultation. We have matched you with top-rated verified physicians to choose from.",
            suggestedDoctors,
            urgentQueueAvailable: true,
        };
    }

    // Otherwise, Routine / Scheduled Specialist
    return {
        urgencyLevel: "routine",
        titleAr: `🩺 التخصص الموصى به: ${bestSpecialty.nameAr}`,
        titleEn: `🩺 Recommended Specialty: ${bestSpecialty.nameEn}`,
        summaryAr: bestSpecialty.explanationAr,
        summaryEn: bestSpecialty.explanationEn,
        primarySpecialtyEn: bestSpecialty.nameEn,
        primarySpecialtyAr: bestSpecialty.nameAr,
        adviceAr: "حالتك مستقرة ومناسبة جداً لاستشارة أونلاين مجدولة بالفيديو. رشحنا لك أفضل الأطباء المعتمدين في هذا التخصص للاختيار بينهم وحجز الموعد المناسب لك.",
        adviceEn: "Your condition is suitable for a scheduled video consultation. We have matched you with top-rated verified specialists in this field.",
        suggestedDoctors,
        urgentQueueAvailable: true,
    };
}
