import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assessSymptoms } from "@/app/actions/triage";

describe("Triage Comprehensive Cross-Specialty Assessment", () => {
    // 1. Dermatology & Body-Location Disambiguation
    describe("Dermatology Disambiguation", () => {
        it("matches 'عندي حبوب ف دماغي' to Dermatology, NOT Neurology", async () => {
            const res = await assessSymptoms({ message: "عندي حبوب ف دماغي" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي حبوب في وشي' to Dermatology", async () => {
            const res = await assessSymptoms({ message: "عندي حبوب في وشي" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي حبوب في ضهري' to Dermatology, NOT Orthopedic", async () => {
            const res = await assessSymptoms({ message: "عندي حبوب في ضهري" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي حبوب في صدري' to Dermatology, NOT Pulmonology/Cardiology", async () => {
            const res = await assessSymptoms({ message: "عندي حبوب في صدري" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي حبوب في بطني' to Dermatology, NOT Gastroenterology", async () => {
            const res = await assessSymptoms({ message: "عندي حبوب في بطني" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي حبوب في رجلي' to Dermatology, NOT Orthopedic", async () => {
            const res = await assessSymptoms({ message: "عندي حبوب في رجلي" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي هرش شديد في جسمي كله ورجليا' to Dermatology", async () => {
            const res = await assessSymptoms({ message: "عندي هرش شديد في جسمي كله ورجليا" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي صدفية في ركبتي وكوعي' to Dermatology, NOT Orthopedic", async () => {
            const res = await assessSymptoms({ message: "عندي صدفية في ركبتي وكوعي" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'شعري بيقع جامد وعندي فراغات في راسي' to Dermatology, NOT Neurology", async () => {
            const res = await assessSymptoms({ message: "شعري بيقع جامد وعندي فراغات في راسي" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي عين سمكة في كعب رجلي' to Dermatology, NOT Ophthalmology or Orthopedic", async () => {
            const res = await assessSymptoms({ message: "عندي عين سمكة في كعب رجلي" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي اكزيما في ايدي وجفاف شديد' to Dermatology", async () => {
            const res = await assessSymptoms({ message: "عندي اكزيما في ايدي وجفاف شديد" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });

        it("matches 'عندي تينيا بين صوابع رجلي' to Dermatology", async () => {
            const res = await assessSymptoms({ message: "عندي تينيا بين صوابع رجلي" });
            assert.equal(res.primarySpecialtyEn, "Dermatology");
        });
    });

    // 2. Gastroenterology & GERD Chest Disambiguation
    describe("Gastroenterology Disambiguation", () => {
        it("matches 'عندي حموضة وحرقان شديد في صدري بعد الاكل' to Gastroenterology, NOT Cardiology", async () => {
            const res = await assessSymptoms({ message: "عندي حموضة وحرقان شديد في صدري بعد الاكل" });
            assert.equal(res.primarySpecialtyEn, "Gastroenterology");
        });

        it("matches 'عندي ارتجاع مريء وصدري بيحرقني' to Gastroenterology, NOT Pulmonology", async () => {
            const res = await assessSymptoms({ message: "عندي ارتجاع مريء وصدري بيحرقني" });
            assert.equal(res.primarySpecialtyEn, "Gastroenterology");
        });

        it("matches 'عندي مغص في بطني واسهال وترجيع' to Gastroenterology", async () => {
            const res = await assessSymptoms({ message: "عندي مغص في بطني واسهال وترجيع" });
            assert.equal(res.primarySpecialtyEn, "Gastroenterology");
        });

        it("matches 'عندي جرثومة المعدة ومعدتي وجعاني' to Gastroenterology", async () => {
            const res = await assessSymptoms({ message: "عندي جرثومة المعدة ومعدتي وجعاني" });
            assert.equal(res.primarySpecialtyEn, "Gastroenterology");
        });
    });

    // 3. Cardiology
    describe("Cardiology Assessment", () => {
        it("matches 'عندي نغزة في قلبي ورفرفة في ضربات القلب' to Cardiology", async () => {
            const res = await assessSymptoms({ message: "عندي نغزة في قلبي ورفرفة في ضربات القلب" });
            assert.equal(res.primarySpecialtyEn, "Cardiology");
        });

        it("matches 'ضربات قلبي سريعة جدا وخفقان' to Cardiology", async () => {
            const res = await assessSymptoms({ message: "ضربات قلبي سريعة جدا وخفقان" });
            assert.equal(res.primarySpecialtyEn, "Cardiology");
        });

        it("matches 'عندي قصور في الشرايين التاجية ومحتاج اراجع رسم قلب' to Cardiology", async () => {
            const res = await assessSymptoms({ message: "عندي قصور في الشرايين التاجية ومحتاج اراجع رسم قلب" });
            assert.equal(res.primarySpecialtyEn, "Cardiology");
        });
    });

    // 4. Pulmonology
    describe("Pulmonology Assessment", () => {
        it("matches 'عندي كحة ببلغم وتزييق في صدري' to Pulmonology, NOT Cardiology", async () => {
            const res = await assessSymptoms({ message: "عندي كحة ببلغم وتزييق في صدري" });
            assert.equal(res.primarySpecialtyEn, "Pulmonology");
        });

        it("matches 'عندي حساسية صدر وربو ومش قادر اخد نفسي كويس' to Pulmonology", async () => {
            const res = await assessSymptoms({ message: "عندي حساسية صدر وربو ومش قادر اخد نفسي كويس" });
            assert.equal(res.primarySpecialtyEn, "Pulmonology");
        });
    });

    // 5. Orthopedic Surgery
    describe("Orthopedic Surgery Assessment", () => {
        it("matches 'عندي الم شديد في ضهري واسفل الظهر ومش قادر اقف' to Orthopedic Surgery", async () => {
            const res = await assessSymptoms({ message: "عندي الم شديد في ضهري واسفل الظهر ومش قادر اقف" });
            assert.equal(res.primarySpecialtyEn, "Orthopedic Surgery");
        });

        it("matches 'ركبتي وجعاني وفيها خشونة وطقطقة' to Orthopedic Surgery", async () => {
            const res = await assessSymptoms({ message: "ركبتي وجعاني وفيها خشونة وطقطقة" });
            assert.equal(res.primarySpecialtyEn, "Orthopedic Surgery");
        });

        it("matches 'رجلي اتلوت وفيها ورم وتمزق في الاربطة' to Orthopedic Surgery", async () => {
            const res = await assessSymptoms({ message: "رجلي اتلوت وفيها ورم وتمزق في الاربطة" });
            assert.equal(res.primarySpecialtyEn, "Orthopedic Surgery");
        });

        it("matches 'عندي كسر في صباع رجلي ومحتاج جبس' to Orthopedic Surgery", async () => {
            const res = await assessSymptoms({ message: "عندي كسر في صباع رجلي ومحتاج جبس" });
            assert.equal(res.primarySpecialtyEn, "Orthopedic Surgery");
        });
    });

    // 6. Neurology
    describe("Neurology Assessment", () => {
        it("matches 'عندي صداع نصفي شديد في دماغي ونوبات شقيقة' to Neurology", async () => {
            const res = await assessSymptoms({ message: "عندي صداع نصفي شديد في دماغي ونوبات شقيقة" });
            assert.equal(res.primarySpecialtyEn, "Neurology");
        });

        it("matches 'عندي دوخة وعدم اتزان ودوار مستمر' to Neurology", async () => {
            const res = await assessSymptoms({ message: "عندي دوخة وعدم اتزان ودوار مستمر" });
            assert.equal(res.primarySpecialtyEn, "Neurology");
        });

        it("matches 'عندي تنميل وشكشكة في الاطراف والتهاب اعصاب' to Neurology", async () => {
            const res = await assessSymptoms({ message: "عندي تنميل وشكشكة في الاطراف والتهاب اعصاب" });
            assert.equal(res.primarySpecialtyEn, "Neurology");
        });

        it("matches 'عندي التهاب في العصب السابع وتنميل في نص وشي' to Neurology", async () => {
            const res = await assessSymptoms({ message: "عندي التهاب في العصب السابع وتنميل في نص وشي" });
            assert.equal(res.primarySpecialtyEn, "Neurology");
        });

        it("triggers Emergency ER on acute stroke warning 'بقي اتعوج وكلامي تقيل'", async () => {
            const res = await assessSymptoms({ message: "بقي اتعوج وكلامي تقيل" });
            assert.equal(res.urgencyLevel, "emergency");
            assert.equal(res.primarySpecialtyEn, "Emergency Medicine / ER");
        });
    });

    // 7. Dentistry
    describe("Dentistry Assessment", () => {
        it("matches 'ضرسي مسوس وبيوجعني جدا ومسمع في ودني' to Dentistry, NOT ENT", async () => {
            const res = await assessSymptoms({ message: "ضرسي مسوس وبيوجعني جدا ومسمع في ودني" });
            assert.equal(res.primarySpecialtyEn, "Dentistry");
        });

        it("matches 'عندي خراج في اللثة والم في الاسنان' to Dentistry", async () => {
            const res = await assessSymptoms({ message: "عندي خراج في اللثة والم في الاسنان" });
            assert.equal(res.primarySpecialtyEn, "Dentistry");
        });

        it("matches 'عندي طقطقة في مفصل الفك والم عند المضغ' to Dentistry", async () => {
            const res = await assessSymptoms({ message: "عندي طقطقة في مفصل الفك والم عند المضغ" });
            assert.equal(res.primarySpecialtyEn, "Dentistry");
        });

        it("matches 'عندي قرح في بقي ولثتي بتنزف' to Dentistry", async () => {
            const res = await assessSymptoms({ message: "عندي قرح في بقي ولثتي بتنزف" });
            assert.equal(res.primarySpecialtyEn, "Dentistry");
        });
    });

    // 8. ENT
    describe("ENT Assessment", () => {
        it("matches 'عندي احتقان شديد في الزور واللوز ومش قادر ابلع' to ENT", async () => {
            const res = await assessSymptoms({ message: "عندي احتقان شديد في الزور واللوز ومش قادر ابلع" });
            assert.equal(res.primarySpecialtyEn, "ENT");
        });

        it("matches 'عندي طنين شديد في ودني ومش سامع كويس' to ENT", async () => {
            const res = await assessSymptoms({ message: "عندي طنين شديد في ودني ومش سامع كويس" });
            assert.equal(res.primarySpecialtyEn, "ENT");
        });

        it("matches 'عندي صداع جيوب انفية وانسداد في مناخيري ورشح' to ENT", async () => {
            const res = await assessSymptoms({ message: "عندي صداع جيوب انفية وانسداد في مناخيري ورشح" });
            assert.equal(res.primarySpecialtyEn, "ENT");
        });
    });

    // 9. Ophthalmology
    describe("Ophthalmology Assessment", () => {
        it("matches 'عندي زغللة في عيني ومش شايف كويس ومحتاج نظارة' to Ophthalmology", async () => {
            const res = await assessSymptoms({ message: "عندي زغللة في عيني ومش شايف كويس ومحتاج نظارة" });
            assert.equal(res.primarySpecialtyEn, "Ophthalmology");
        });

        it("matches 'عيني محمرة وفيها حرقان ودموع وافرازات' to Ophthalmology", async () => {
            const res = await assessSymptoms({ message: "عيني محمرة وفيها حرقان ودموع وافرازات" });
            assert.equal(res.primarySpecialtyEn, "Ophthalmology");
        });

        it("matches 'عندي كيس دهني وشحات في جفن عيني' to Ophthalmology", async () => {
            const res = await assessSymptoms({ message: "عندي كيس دهني وشحات في جفن عيني" });
            assert.equal(res.primarySpecialtyEn, "Ophthalmology");
        });
    });

    // 10. Obstetrics & Gynecology
    describe("Obstetrics & Gynecology Assessment", () => {
        it("matches 'عندي لخبطة في الدورة الشهرية ومغص حاد' to Obstetrics & Gynecology", async () => {
            const res = await assessSymptoms({ message: "عندي لخبطة في الدورة الشهرية ومغص حاد" });
            assert.equal(res.primarySpecialtyEn, "Obstetrics & Gynecology");
        });

        it("matches 'عايزة اتابع الحمل وسونار للجنين' to Obstetrics & Gynecology", async () => {
            const res = await assessSymptoms({ message: "عايزة اتابع الحمل وسونار للجنين" });
            assert.equal(res.primarySpecialtyEn, "Obstetrics & Gynecology");
        });

        it("matches 'عندي وجع في الحوض وافرازات نسائية' to Obstetrics & Gynecology, NOT Orthopedic", async () => {
            const res = await assessSymptoms({ message: "عندي وجع في الحوض وافرازات نسائية" });
            assert.equal(res.primarySpecialtyEn, "Obstetrics & Gynecology");
        });
    });

    // 11. Urology
    describe("Urology Assessment", () => {
        it("matches 'عندي حرقان شديد في البول وصعوبة في التبول' to Urology", async () => {
            const res = await assessSymptoms({ message: "عندي حرقان شديد في البول وصعوبة في التبول" });
            assert.equal(res.primarySpecialtyEn, "Urology");
        });

        it("matches 'عندي مغص كلوي وحصوة في الحالب' to Urology", async () => {
            const res = await assessSymptoms({ message: "عندي مغص كلوي وحصوة في الحالب" });
            assert.equal(res.primarySpecialtyEn, "Urology");
        });

        it("matches 'عندي دوالي في الخصية والم شديد' to Urology", async () => {
            const res = await assessSymptoms({ message: "عندي دوالي في الخصية والم شديد" });
            assert.equal(res.primarySpecialtyEn, "Urology");
        });
    });

    // 12. Psychiatry
    describe("Psychiatry Assessment", () => {
        it("matches 'عندي نوبة هلع وبانيك اتاك وخوف شديد بدون سبب' to Psychiatry, NOT Cardiology", async () => {
            const res = await assessSymptoms({ message: "عندي نوبة هلع وبانيك اتاك وخوف شديد بدون سبب" });
            assert.equal(res.primarySpecialtyEn, "Psychiatry");
        });

        it("matches 'عندي اكتئاب وفقدان شغف وحزن مستمر وبكاء' to Psychiatry", async () => {
            const res = await assessSymptoms({ message: "عندي اكتئاب وفقدان شغف وحزن مستمر وبكاء" });
            assert.equal(res.primarySpecialtyEn, "Psychiatry");
        });

        it("matches 'مش عارف انام وعندي ارق شديد وتفكير زايد ووسواس قهري' to Psychiatry", async () => {
            const res = await assessSymptoms({ message: "مش عارف انام وعندي ارق شديد وتفكير زايد ووسواس قهري" });
            assert.equal(res.primarySpecialtyEn, "Psychiatry");
        });
    });

    // 13. Rheumatology
    describe("Rheumatology Assessment", () => {
        it("matches 'عندي تيبس صباحي في مفاصل ايدي وروماتويد' to Rheumatology, NOT Orthopedic", async () => {
            const res = await assessSymptoms({ message: "عندي تيبس صباحي في مفاصل ايدي وروماتويد" });
            assert.equal(res.primarySpecialtyEn, "Rheumatology");
        });

        it("matches 'عندي مرض الذئبة الحمراء والام مفاصل متفرقة' to Rheumatology", async () => {
            const res = await assessSymptoms({ message: "عندي مرض الذئبة الحمراء والام مفاصل متفرقة" });
            assert.equal(res.primarySpecialtyEn, "Rheumatology");
        });
    });

    // 14. Endocrinology
    describe("Endocrinology Assessment", () => {
        it("matches 'عندي خمول في الغدة الدرقية وتحليل TSH عالي' to Endocrinology", async () => {
            const res = await assessSymptoms({ message: "عندي خمول في الغدة الدرقية وتحليل TSH عالي" });
            assert.equal(res.primarySpecialtyEn, "Endocrinology");
        });

        it("matches 'السكر التراكمي بتاعي عالي ومقاومة انسولين' to Endocrinology", async () => {
            const res = await assessSymptoms({ message: "السكر التراكمي بتاعي عالي ومقاومة انسولين" });
            assert.equal(res.primarySpecialtyEn, "Endocrinology");
        });
    });

    // 15. Pediatrics
    describe("Pediatrics Assessment", () => {
        it("matches 'ابني عنده سخونية عالية وكحة' to Pediatrics", async () => {
            const res = await assessSymptoms({ message: "ابني عنده سخونية عالية وكحة" });
            assert.equal(res.primarySpecialtyEn, "Pediatrics");
        });

        it("matches 'بنتي بيطلعلها حبوب في وشها وعندها سنة' to Pediatrics", async () => {
            const res = await assessSymptoms({ message: "بنتي بيطلعلها حبوب في وشها وعندها سنة" });
            assert.equal(res.primarySpecialtyEn, "Pediatrics");
        });

        it("matches 'البيبي بيعيط وعنده مغص رضع' to Pediatrics", async () => {
            const res = await assessSymptoms({ message: "البيبي بيعيط وعنده مغص رضع" });
            assert.equal(res.primarySpecialtyEn, "Pediatrics");
        });
    });

    // 16. General Surgery
    describe("General Surgery Assessment", () => {
        it("matches 'عندي بواسير وشرخ شرجي والم شديد' to General Surgery", async () => {
            const res = await assessSymptoms({ message: "عندي بواسير وشرخ شرجي والم شديد" });
            assert.equal(res.primarySpecialtyEn, "General Surgery");
        });

        it("matches 'عندي ناسور عصعصي وكيس شعر في اسفل الضهر' to General Surgery, NOT Orthopedic", async () => {
            const res = await assessSymptoms({ message: "عندي ناسور عصعصي وكيس شعر في اسفل الضهر" });
            assert.equal(res.primarySpecialtyEn, "General Surgery");
        });
    });

    // 17. Nephrology
    describe("Nephrology Assessment", () => {
        it("matches 'عندي ارتفاع في الكرياتينين ووظائف الكلى وزلال في البول' to Nephrology, NOT Urology", async () => {
            const res = await assessSymptoms({ message: "عندي ارتفاع في الكرياتينين ووظائف الكلى وزلال في البول" });
            assert.equal(res.primarySpecialtyEn, "Nephrology");
        });
    });

    // 18. Nutrition & Dietetics
    describe("Nutrition & Dietetics Assessment", () => {
        it("matches 'عايز نظام غذائي ودايت للتخسيس وانقاص الوزن' to Nutrition & Dietetics", async () => {
            const res = await assessSymptoms({ message: "عايز نظام غذائي ودايت للتخسيس وانقاص الوزن" });
            assert.equal(res.primarySpecialtyEn, "Nutrition & Dietetics");
        });
    });

    // 19. Allergy & Immunology
    describe("Allergy & Immunology Assessment", () => {
        it("matches 'عندي حساسية طعام شديدة وحساسية البان' to Allergy & Immunology", async () => {
            const res = await assessSymptoms({ message: "عندي حساسية طعام شديدة وحساسية البان" });
            assert.equal(res.primarySpecialtyEn, "Allergy & Immunology");
        });
    });

    // 20. Internal Medicine
    describe("Internal Medicine Assessment", () => {
        it("matches 'عندي سخونية وتكسير في عضمي ونزلة برد' to Internal Medicine", async () => {
            const res = await assessSymptoms({ message: "عندي سخونية وتكسير في عضمي ونزلة برد" });
            assert.equal(res.primarySpecialtyEn, "Internal Medicine");
        });
    });
});
