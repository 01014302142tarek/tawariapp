import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedNotifications() {
  console.log('Seeding rich demo notifications for Patient, Doctor, and Admin...');

  const { data: users } = await supabase.auth.admin.listUsers();
  const p1 = users.users.find(u => u.email === 'patient1@tawari.test');
  const d1 = users.users.find(u => u.email === 'doctor1@tawari.test');
  const a1 = users.users.find(u => u.email === 'admin1@tawari.test');

  const { data: p1Prof } = await supabase.from('profiles').select('id').eq('user_id', p1?.id).single();
  const { data: d1Prof } = await supabase.from('profiles').select('id').eq('user_id', d1?.id).single();
  const { data: a1Prof } = await supabase.from('profiles').select('id').eq('user_id', a1?.id).single();

  // Clear previous test notifications for clean state
  if (p1Prof?.id) {
    await supabase.from('notifications').delete().eq('profile_id', p1Prof.id);
  }
  if (d1Prof?.id) {
    await supabase.from('notifications').delete().eq('profile_id', d1Prof.id);
  }
  if (a1Prof?.id) {
    await supabase.from('notifications').delete().eq('profile_id', a1Prof.id);
  }

  // 1. Patient1 Notifications
  if (p1Prof?.id) {
    await supabase.from('notifications').insert([
      {
        profile_id: p1Prof.id,
        title: 'تم تأكيد موعدك بنجاح',
        body: 'تم تأكيد موعدك القادم مع د. محمد إبراهيم (استشاري قلب) يوم الخميس الساعة 6:00 مساءً.',
        notification_type: 'appointment_confirmation',
        data: { doctorName: 'د. محمد إبراهيم' },
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      },
      {
        profile_id: p1Prof.id,
        title: 'روشتة طبية جديدة',
        body: 'أصدر د. محمد إبراهيم روشتة طبية جديدة لك. يمكنك الآن استعراض الأدوية وتعليمات الجرعات.',
        notification_type: 'prescription',
        data: { doctorName: 'د. محمد إبراهيم' },
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        profile_id: p1Prof.id,
        title: 'تمت عملية الدفع بنجاح',
        body: 'تم استلام مبلغ 350 ج.م بنجاح لتأكيد حجز الاستشارة الطبية.',
        notification_type: 'payment_success',
        data: { amount: 350 },
        is_read: true,
        read_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
      {
        profile_id: p1Prof.id,
        title: 'مرحباً بك في طبيبي',
        body: 'أهلاً بك يا أحمد في منصة طبيبي للرعاية الصحية عن بُعد. حسابك نشط وجاهز للاستخدام.',
        notification_type: 'system',
        data: { welcome: true },
        is_read: true,
        read_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      }
    ]);
    console.log('Seeded patient1 notifications.');
  }

  // 2. Doctor1 Notifications
  if (d1Prof?.id) {
    await supabase.from('notifications').insert([
      {
        profile_id: d1Prof.id,
        title: 'حجز كشف جديد',
        body: 'قام المريض أحمد حسن بحجز موعد استشارة جديدة يوم الخميس الساعة 6:00 مساءً.',
        notification_type: 'new_appointment',
        data: { patientName: 'أحمد حسن' },
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 mins ago
      },
      {
        profile_id: d1Prof.id,
        title: 'مريض جديد في قائمة انتظار الطوارئ',
        body: 'انضم مريض جديد إلى قائمة استشارات الطوارئ العاجلة في انتظار موافقتك لبدء الاتصال.',
        notification_type: 'appointment_reminder',
        data: { queue: true },
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(), // 50 mins ago
      },
      {
        profile_id: d1Prof.id,
        title: 'تم توثيق حسابك الطبي بنجاح',
        body: 'تهانينا د. محمد! تم التحقق من ترخيص مزاولة المهنة واعتماد ملفك الطبي رسمياً على المنصة.',
        notification_type: 'doctor_verification',
        data: { status: 'verified' },
        is_read: true,
        read_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      }
    ]);
    console.log('Seeded doctor1 notifications.');
  }

  // 3. Admin1 Notifications
  if (a1Prof?.id) {
    await supabase.from('notifications').insert([
      {
        profile_id: a1Prof.id,
        title: 'طلب انضمام طبيب جديد قيد المراجعة',
        body: 'تم استلام مستندات ترخيص د. طارق القاضي (جراحة عظام) وهي بانتظار المراجعة والاعتماد.',
        notification_type: 'doctor_verification',
        data: { doctorName: 'د. طارق القاضي' },
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        profile_id: a1Prof.id,
        title: 'تقرير الاستشارات اليومي',
        body: 'تم إتمام 24 استشارة طبية بنجاح اليوم عبر مكالمات الفيديو وغرف الطوارئ.',
        notification_type: 'system',
        data: { completedCount: 24 },
        is_read: true,
        read_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      }
    ]);
    console.log('Seeded admin1 notifications.');
  }

  console.log('Notification seeding completed successfully!');
}

seedNotifications().catch(console.error);

