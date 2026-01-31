-- Dashboard performance indexes

-- Appointments (doctor & patient dashboards)
create index if not exists appointments_doctor_status_scheduled_idx
    on public.appointments (doctor_profile_id, status, scheduled_start);

create index if not exists appointments_patient_status_scheduled_idx
    on public.appointments (patient_profile_id, status, scheduled_start);

-- Messages (conversations & unread counts)
create index if not exists messages_conversation_created_idx
    on public.messages (conversation_id, created_at desc)
    where is_deleted = false;

create index if not exists messages_recipient_created_idx
    on public.messages (recipient_profile_id, created_at desc)
    where is_deleted = false;

create index if not exists messages_sender_created_idx
    on public.messages (sender_profile_id, created_at desc)
    where is_deleted = false;

create index if not exists messages_recipient_unread_idx
    on public.messages (recipient_profile_id, is_read)
    where is_deleted = false;

-- Prescriptions (doctor & patient dashboards)
create index if not exists prescriptions_patient_status_prescribed_idx
    on public.prescriptions (patient_profile_id, status, prescribed_at desc);

create index if not exists prescriptions_doctor_status_prescribed_idx
    on public.prescriptions (doctor_profile_id, status, prescribed_at desc);
