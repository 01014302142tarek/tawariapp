import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// All 24 specializations matching Supabase specializations table
const doctorsData = [
  {
    slug: 'hany-youssef',
    email: 'doctor.endocrinology@tawari.test',
    fullName: 'Dr. Hany Youssef',
    fullNameAr: 'د. هاني يوسف',
    specialtyEn: 'Endocrinology',
    licenseNumber: 'EG-MED-2008-8812',
    yearsOfExperience: 16,
    fee: 320.00,
    ratingAverage: 4.9,
    ratingCount: 184,
    totalConsultations: 430,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري أول علاج أمراض الغدد الصماء والسكري واضطرابات الغدة الدرقية والسمنة ومقاومة الأنسولين. دكتوراه جامعة عين شمس، عضو الجمعية الأمريكية للغدد الصماء.'
  },
  {
    slug: 'ahmed-refaat',
    email: 'doctor.surgery@tawari.test',
    fullName: 'Dr. Ahmed Refaat',
    fullNameAr: 'د. أحمد رفعت',
    specialtyEn: 'General Surgery',
    licenseNumber: 'EG-MED-2006-5412',
    yearsOfExperience: 18,
    fee: 350.00,
    ratingAverage: 4.9,
    ratingCount: 245,
    totalConsultations: 560,
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري الجراحة العامة وجراحة المناظير المتقدمة والفتق والجهاز الهضمي. زميل كلية الجراحين الملكية بإنجلترا.'
  },
  {
    slug: 'hossam-hosny',
    email: 'doctor.infectious@tawari.test',
    fullName: 'Dr. Hossam Hosny',
    fullNameAr: 'د. حسام حسني',
    specialtyEn: 'Infectious Diseases',
    licenseNumber: 'EG-MED-2007-9923',
    yearsOfExperience: 17,
    fee: 300.00,
    ratingAverage: 5.0,
    ratingCount: 192,
    totalConsultations: 410,
    avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري الحميات والأمراض المعدية والفيروسية والمناعة السريرية وعلاج حمى مجهولة السبب ومضاعفات العدوى البكتيرية.'
  },
  {
    slug: 'karim-abdelrahman',
    email: 'doctor.internal@tawari.test',
    fullName: 'Dr. Karim Abdelrahman',
    fullNameAr: 'د. كريم عبد الرحمن',
    specialtyEn: 'Internal Medicine',
    licenseNumber: 'EG-MED-2011-3312',
    yearsOfExperience: 13,
    fee: 280.00,
    ratingAverage: 4.8,
    ratingCount: 160,
    totalConsultations: 380,
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    bio: 'أخصائي أول الطب الباطني ومتابعة الأمراض المزمنة وضغط الدم والدهون واعتلال الكبد والقولون العصبي.'
  },
  {
    slug: 'mostafa-elshazly',
    email: 'doctor.nephrology@tawari.test',
    fullName: 'Dr. Mostafa El-Shazly',
    fullNameAr: 'د. مصطفى الشاذلي',
    specialtyEn: 'Nephrology',
    licenseNumber: 'EG-MED-2009-4412',
    yearsOfExperience: 15,
    fee: 340.00,
    ratingAverage: 4.9,
    ratingCount: 175,
    totalConsultations: 390,
    avatarUrl: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري أمراض وزراعة الكلى والقصور الكلوي المزمن وارتفاع ضغط الدم المقاوم وأمراض المناعة الذاتية للكلى.'
  },
  {
    slug: 'sarah-mansour',
    email: 'doctor.neurology@tawari.test',
    fullName: 'Dr. Sarah Mansour',
    fullNameAr: 'د. سارة منصور',
    specialtyEn: 'Neurology',
    licenseNumber: 'EG-MED-2012-7712',
    yearsOfExperience: 12,
    fee: 380.00,
    ratingAverage: 5.0,
    ratingCount: 220,
    totalConsultations: 480,
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face',
    bio: 'استشارية أمراض المخ والأعصاب والجلطات الدماغية وعلاج الصداع المزمن والشقيقة والصرع والتصلب المتعدد واعتلال الأعصاب الطرفية.'
  },
  {
    slug: 'reem-hassan',
    email: 'doctor.nutrition@tawari.test',
    fullName: 'Dr. Reem Hassan',
    fullNameAr: 'د. ريم حسن',
    specialtyEn: 'Nutrition & Dietetics',
    licenseNumber: 'EG-MED-2015-8819',
    yearsOfExperience: 9,
    fee: 240.00,
    ratingAverage: 4.9,
    ratingCount: 310,
    totalConsultations: 620,
    avatarUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
    bio: 'أخصائية التغذية العلاجية وإدارة السمنة والنحافة، برامج تغذية مرضى السكري وتكيس المبايض وتغذية الحوامل والرياضيين.'
  },
  {
    slug: 'nourhan-elsherif',
    email: 'doctor.obgyn@tawari.test',
    fullName: 'Dr. Nourhan El-Sherif',
    fullNameAr: 'د. نورهان الشريف',
    specialtyEn: 'Obstetrics & Gynecology',
    licenseNumber: 'EG-MED-2010-4411',
    yearsOfExperience: 14,
    fee: 330.00,
    ratingAverage: 5.0,
    ratingCount: 290,
    totalConsultations: 580,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    bio: 'استشارية أمراض النساء والتوليد وجراحة المناظير ومتابعة الحمل الحرج وعلاج اضطرابات الهرمونات وتكيس المبايض.'
  },
  {
    slug: 'sameh-fawzy',
    email: 'doctor.oncology@tawari.test',
    fullName: 'Dr. Sameh Fawzy',
    fullNameAr: 'د. سامح فوزي',
    specialtyEn: 'Oncology',
    licenseNumber: 'EG-MED-2004-1188',
    yearsOfExperience: 20,
    fee: 420.00,
    ratingAverage: 5.0,
    ratingCount: 140,
    totalConsultations: 310,
    avatarUrl: 'https://images.unsplash.com/photo-1536064479547-7ee40b74b807?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري علاج الأورام والعلاج الكيميائي والمناعي الموجه. عضو الجمعية الأوروبية لطب الأورام (ESMO) وعضو المعهد القومي للأورام.'
  },
  {
    slug: 'khaled-mostafa',
    email: 'doctor.ophthalmology@tawari.test',
    fullName: 'Dr. Khaled Mostafa',
    fullNameAr: 'د. خالد مصطفى',
    specialtyEn: 'Ophthalmology',
    licenseNumber: 'EG-MED-2005-3319',
    yearsOfExperience: 19,
    fee: 310.00,
    ratingAverage: 4.9,
    ratingCount: 380,
    totalConsultations: 710,
    avatarUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري طب وجراحة العيون وتصحيح الإبصار بالفيمتو ليزك والمياه البيضاء وعلاج أمراض الشبكية وجفاف العين.'
  },
  {
    slug: 'tarek-elkady',
    email: 'doctor.orthopedics@tawari.test',
    fullName: 'Dr. Tarek El-Kady',
    fullNameAr: 'د. طارق القاضي',
    specialtyEn: 'Orthopedic Surgery',
    licenseNumber: 'EG-MED-2008-5521',
    yearsOfExperience: 16,
    fee: 350.00,
    ratingAverage: 5.0,
    ratingCount: 335,
    totalConsultations: 640,
    avatarUrl: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري جراحة العظام والمفاصل والعمود الفقري وإصابات الملاعب والرباط الصليبي وتغيير المفاصل الصناعية.'
  },
  {
    slug: 'layla-ahmed',
    email: 'doctor.pediatrics@tawari.test',
    fullName: 'Dr. Layla Ahmed',
    fullNameAr: 'د. ليلى أحمد',
    specialtyEn: 'Pediatrics',
    licenseNumber: 'EG-MED-2014-9912',
    yearsOfExperience: 10,
    fee: 260.00,
    ratingAverage: 5.0,
    ratingCount: 215,
    totalConsultations: 510,
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    bio: 'استشارية طب الأطفال ورعاية حديثي الولادة والمبتسرين وعلاج حساسية الصدر والأكزيما ومتابعة النمو والتطعيمات الأساسية.'
  },
  {
    slug: 'omar-elfarouk',
    email: 'doctor.psychiatry@tawari.test',
    fullName: 'Dr. Omar El-Farouk',
    fullNameAr: 'د. عمر الفاروق',
    specialtyEn: 'Psychiatry',
    licenseNumber: 'EG-MED-2009-6612',
    yearsOfExperience: 15,
    fee: 390.00,
    ratingAverage: 4.9,
    ratingCount: 195,
    totalConsultations: 440,
    avatarUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري الطب النفسي وعلاج الإدمان واضطرابات المزاج والقلق ونوبات الهلع والوسواس القهري واضطراب ما بعد الصدمة.'
  },
  {
    slug: 'yasmine-fekry',
    email: 'doctor.psychology@tawari.test',
    fullName: 'Dr. Yasmine Fekry',
    fullNameAr: 'د. ياسمين فكري',
    specialtyEn: 'Psychology',
    licenseNumber: 'EG-MED-2014-2231',
    yearsOfExperience: 10,
    fee: 250.00,
    ratingAverage: 4.9,
    ratingCount: 240,
    totalConsultations: 530,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    bio: 'أخصائية العلاج النفسي والإرشاد الأسري وتعديل السلوك والعلاج المعرفي السلوكي (CBT) وجلسات تخفيف الضغوط والاحتراق النفسي.'
  },
  {
    slug: 'maged-fahmy',
    email: 'doctor.pulmonology@tawari.test',
    fullName: 'Dr. Maged Fahmy',
    fullNameAr: 'د. ماجد فهمي',
    specialtyEn: 'Pulmonology',
    licenseNumber: 'EG-MED-2007-1144',
    yearsOfExperience: 17,
    fee: 300.00,
    ratingAverage: 4.9,
    ratingCount: 180,
    totalConsultations: 410,
    avatarUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري الأمراض الصدرية والحساسية والانسداد الرئوي المزمن وعلاج السعال المزمن وتليف الرئتين وانقطاع التنفس أثناء النوم.'
  },
  {
    slug: 'nadia-azmy',
    email: 'doctor.rheumatology@tawari.test',
    fullName: 'Dr. Nadia Azmy',
    fullNameAr: 'د. نادية عزمي',
    specialtyEn: 'Rheumatology',
    licenseNumber: 'EG-MED-2010-8833',
    yearsOfExperience: 14,
    fee: 320.00,
    ratingAverage: 4.8,
    ratingCount: 155,
    totalConsultations: 370,
    avatarUrl: 'https://images.unsplash.com/photo-1580281657527-47f249e8f4df?w=400&h=400&fit=crop&crop=face',
    bio: 'استشارية الروماتيزم والمناعة وأمراض المفاصل والتهاب الفقرات التيبسي والذئبة الحمراء والتهاب الأوعية الدموية وخشونة المفاصل.'
  },
  {
    slug: 'omar-alfayed',
    email: 'doctor.general@tawari.test',
    fullName: 'Dr. Omar Al-Fayed',
    fullNameAr: 'د. عمر الفايد',
    specialtyEn: 'General Practice',
    licenseNumber: 'EG-MED-2012-5599',
    yearsOfExperience: 12,
    fee: 200.00,
    ratingAverage: 4.9,
    ratingCount: 310,
    totalConsultations: 690,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
    bio: 'طبيب عام واستشارات طوارئ أولية، تشخيص وتقييم الأعراض الحادة وتوجيه المريض بدقة نحو الفحوصات والعلاج الأمثل.'
  },
  {
    slug: 'mona-abdelaziz',
    email: 'doctor.family@tawari.test',
    fullName: 'Dr. Mona Abdelaziz',
    fullNameAr: 'د. منى عبد العزيز',
    specialtyEn: 'Family Medicine',
    licenseNumber: 'EG-MED-2011-4477',
    yearsOfExperience: 13,
    fee: 220.00,
    ratingAverage: 4.9,
    ratingCount: 190,
    totalConsultations: 420,
    avatarUrl: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=400&h=400&fit=crop&crop=face',
    bio: 'استشارية طب الأسرة وتقديم الرعاية الطبية الشاملة والمستمرة للأفراد في كافة المراحل العمرية ومتابعة الفحوصات الدورية.'
  },
  {
    slug: 'waleed-salem',
    email: 'doctor.gastro@tawari.test',
    fullName: 'Dr. Waleed Salem',
    fullNameAr: 'د. وليد سالم',
    specialtyEn: 'Gastroenterology',
    licenseNumber: 'EG-MED-2009-3388',
    yearsOfExperience: 15,
    fee: 330.00,
    ratingAverage: 4.9,
    ratingCount: 210,
    totalConsultations: 480,
    avatarUrl: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري أمراض الجهاز الهضمي والكبد ومناظير المعدة والقولون، علاج التهابات المرارة وقرحة المعدة وجرثومة المعدة.'
  },
  {
    slug: 'sherif-elnaggar',
    email: 'doctor.urology@tawari.test',
    fullName: 'Dr. Sherif El-Naggar',
    fullNameAr: 'د. شريف النجار',
    specialtyEn: 'Urology',
    licenseNumber: 'EG-MED-2008-1199',
    yearsOfExperience: 16,
    fee: 340.00,
    ratingAverage: 4.9,
    ratingCount: 185,
    totalConsultations: 430,
    avatarUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري جراحة المسالك البولية والتناسلية وتفتيت الحصوات بالليزر، علاج تضخم البروستاتا والتهابات المسالك البولية.'
  },
  {
    slug: 'hazem-zaki',
    email: 'doctor.ent@tawari.test',
    fullName: 'Dr. Hazem Zaki',
    fullNameAr: 'د. حازم زكي',
    specialtyEn: 'ENT (Otolaryngology)',
    licenseNumber: 'EG-MED-2010-7722',
    yearsOfExperience: 14,
    fee: 290.00,
    ratingAverage: 4.8,
    ratingCount: 260,
    totalConsultations: 540,
    avatarUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop&crop=face',
    bio: 'استشاري جراحة الأنف والأذن والحنجرة ومناظير الجيوب الأنفية وعلاج طنين الأذن وفقدان السمع والتهابات الحلق والشخير.'
  },
  {
    slug: 'dina-mansour',
    email: 'doctor.allergy@tawari.test',
    fullName: 'Dr. Dina Mansour',
    fullNameAr: 'د. دينا منصور',
    specialtyEn: 'Allergy & Immunology',
    licenseNumber: 'EG-MED-2011-8855',
    yearsOfExperience: 13,
    fee: 310.00,
    ratingAverage: 4.9,
    ratingCount: 170,
    totalConsultations: 390,
    avatarUrl: 'https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=400&h=400&fit=crop&crop=face',
    bio: 'استشارية الحساسية والمناعة السريرية وعلاج حساسية الأطعمة والأدوية والربو الشعبي والارتكاريا المزمنة ونقص المناعة.'
  }
];

async function seedAllSpecialties() {
  console.log('--- Starting Doctor Seeding for All Specializations ---');

  // 1. Fetch all specializations
  const { data: specs, error: specErr } = await supabase.from('specializations').select('id, name_en, name_ar');
  if (specErr || !specs) {
    console.error('Failed to fetch specializations:', specErr);
    process.exit(1);
  }

  const specMap = new Map(specs.map(s => [s.name_en, s.id]));
  console.log(`Found ${specs.length} specializations in DB.`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const doc of doctorsData) {
    try {
      const specId = specMap.get(doc.specialtyEn);
      if (!specId) {
        console.warn(`Specialization '${doc.specialtyEn}' not found in DB! Skipping...`);
        continue;
      }

      // Check if auth user exists
      let userId = null;
      const { data: userLookup } = await supabase.auth.admin.listUsers();
      const existingUser = userLookup?.users?.find(u => u.email === doc.email);

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email: doc.email,
          password: 'TawariDoctor!2024',
          email_confirm: true,
          user_metadata: {
            role: 'doctor',
            full_name: doc.fullNameAr
          }
        });

        if (createErr) {
          console.error(`Error creating auth user for ${doc.email}:`, createErr.message);
          continue;
        }
        userId = newUser.user.id;
      }

      // Upsert profile
      let profileId = null;
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        profileId = existingProfile.id;
        await supabase
          .from('profiles')
          .update({
            full_name: doc.fullNameAr,
            avatar_url: doc.avatarUrl,
            role: 'doctor',
            preferred_language: 'ar'
          })
          .eq('id', profileId);
      } else {
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: doc.fullNameAr,
            avatar_url: doc.avatarUrl,
            role: 'doctor',
            preferred_language: 'ar'
          })
          .select('id')
          .single();

        if (profileErr) {
          console.error(`Error creating profile for ${doc.email}:`, profileErr.message);
          continue;
        }
        profileId = newProfile.id;
      }

      // Upsert doctor_profile
      let doctorProfileId = null;
      const { data: existingDocProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('profile_id', profileId)
        .single();

      const docPayload = {
        profile_id: profileId,
        slug: doc.slug,
        license_number: doc.licenseNumber,
        years_of_experience: doc.yearsOfExperience,
        bio: doc.bio,
        consultation_fee: doc.fee,
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        is_available_now: true,
        rating_average: doc.ratingAverage,
        rating_count: doc.ratingCount,
        total_consultations: doc.totalConsultations
      };

      if (existingDocProfile) {
        doctorProfileId = existingDocProfile.id;
        await supabase
          .from('doctor_profiles')
          .update(docPayload)
          .eq('id', doctorProfileId);
        updatedCount++;
      } else {
        const { data: newDocProfile, error: docErr } = await supabase
          .from('doctor_profiles')
          .insert(docPayload)
          .select('id')
          .single();

        if (docErr) {
          console.error(`Error creating doctor profile for ${doc.slug}:`, docErr.message);
          continue;
        }
        doctorProfileId = newDocProfile.id;
        createdCount++;
      }

      // Link doctor_specializations
      const { data: existingLink } = await supabase
        .from('doctor_specializations')
        .select('id')
        .eq('doctor_profile_id', doctorProfileId)
        .eq('specialization_id', specId)
        .single();

      if (!existingLink) {
        await supabase.from('doctor_specializations').insert({
          doctor_profile_id: doctorProfileId,
          specialization_id: specId,
          is_primary: true
        });
      }

      // Add doctor availability (Sunday to Thursday, 9am - 5pm)
      for (let day = 0; day <= 4; day++) {
        const { data: existingSlot } = await supabase
          .from('doctor_availability')
          .select('id')
          .eq('doctor_profile_id', doctorProfileId)
          .eq('day_of_week', day)
          .single();

        if (!existingSlot) {
          await supabase.from('doctor_availability').insert({
            doctor_profile_id: doctorProfileId,
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            is_active: true
          });
        }
      }

      console.log(`✓ [${doc.specialtyEn}] ${doc.fullNameAr} (${doc.slug}) ready!`);

    } catch (err) {
      console.error(`Error processing ${doc.fullName}:`, err);
    }
  }

  console.log(`\n=== Seeding Finished: Created: ${createdCount}, Updated: ${updatedCount} ===`);
}

seedAllSpecialties();
