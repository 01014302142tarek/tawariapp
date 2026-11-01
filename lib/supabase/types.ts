// Tabibi Database Types
// Generated from database schema (00001_initial_schema.sql)

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Enum types matching database
export type UserRole = "patient" | "doctor" | "admin" | "doctor_assistant" | "admin_assistant";
export type VerificationStatus = "pending" | "under_review" | "verified" | "suspended" | "rejected";
export type AppointmentStatus = "scheduled" | "in_waiting_room" | "in_progress" | "completed" | "cancelled" | "no_show";
export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";
export type TicketStatus = "open" | "in_progress" | "waiting_response" | "resolved" | "closed";
export type AssignmentStatus = "pending" | "active" | "suspended" | "revoked";

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    role: UserRole;
                    full_name: string;
                    avatar_url: string | null;
                    preferred_language: string;
                    timezone: string;
                    is_active: boolean;
                    is_deleted: boolean;
                    notify_email: boolean;
                    notify_sms: boolean;
                    notify_appointments: boolean;
                    notify_prescriptions: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    role?: UserRole;
                    full_name: string;
                    avatar_url?: string | null;
                    preferred_language?: string;
                    timezone?: string;
                    is_active?: boolean;
                    is_deleted?: boolean;
                    notify_email?: boolean;
                    notify_sms?: boolean;
                    notify_appointments?: boolean;
                    notify_prescriptions?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    role?: UserRole;
                    full_name?: string;
                    avatar_url?: string | null;
                    preferred_language?: string;
                    timezone?: string;
                    is_active?: boolean;
                    is_deleted?: boolean;
                    notify_email?: boolean;
                    notify_sms?: boolean;
                    notify_appointments?: boolean;
                    notify_prescriptions?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            patient_profiles: {
                Row: {
                    id: string;
                    profile_id: string;
                    date_of_birth: string | null;
                    gender: string | null;
                    blood_type: string | null;
                    emergency_contact_name: string | null;
                    emergency_contact_phone: string | null;
                    national_id: string | null;
                    national_id_verified: boolean;
                    verification_level: string;
                    late_cancellation_used_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    profile_id: string;
                    date_of_birth?: string | null;
                    gender?: string | null;
                    blood_type?: string | null;
                    emergency_contact_name?: string | null;
                    emergency_contact_phone?: string | null;
                    national_id?: string | null;
                    national_id_verified?: boolean;
                    verification_level?: string;
                    late_cancellation_used_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    date_of_birth?: string | null;
                    gender?: string | null;
                    blood_type?: string | null;
                    emergency_contact_name?: string | null;
                    emergency_contact_phone?: string | null;
                    national_id?: string | null;
                    national_id_verified?: boolean;
                    verification_level?: string;
                    late_cancellation_used_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            doctor_profiles: {
                Row: {
                    id: string;
                    profile_id: string;
                    license_number: string | null;
                    years_of_experience: number;
                    bio: string | null;
                    consultation_fee: number | null;
                    verification_status: VerificationStatus;
                    verification_notes: string | null;
                    verified_at: string | null;
                    verified_by: string | null;
                    is_available_now: boolean;
                    rating_average: number;
                    rating_count: number;
                    total_consultations: number;
                    max_assistants: number;
                    two_factor_enabled: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    profile_id: string;
                    license_number?: string | null;
                    years_of_experience?: number;
                    bio?: string | null;
                    consultation_fee?: number | null;
                    verification_status?: VerificationStatus;
                    verification_notes?: string | null;
                    verified_at?: string | null;
                    verified_by?: string | null;
                    is_available_now?: boolean;
                    rating_average?: number;
                    rating_count?: number;
                    total_consultations?: number;
                    max_assistants?: number;
                    two_factor_enabled?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    license_number?: string | null;
                    years_of_experience?: number;
                    bio?: string | null;
                    consultation_fee?: number | null;
                    verification_status?: VerificationStatus;
                    verification_notes?: string | null;
                    verified_at?: string | null;
                    verified_by?: string | null;
                    is_available_now?: boolean;
                    rating_average?: number;
                    rating_count?: number;
                    total_consultations?: number;
                    max_assistants?: number;
                    two_factor_enabled?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            admin_profiles: {
                Row: {
                    id: string;
                    profile_id: string;
                    trust_level: string;
                    department: string | null;
                    two_factor_enabled: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    profile_id: string;
                    trust_level?: string;
                    department?: string | null;
                    two_factor_enabled?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    trust_level?: string;
                    department?: string | null;
                    two_factor_enabled?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            assistant_profiles: {
                Row: {
                    id: string;
                    profile_id: string;
                    assistant_type: string;
                    department: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    profile_id: string;
                    assistant_type: string;
                    department?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    assistant_type?: string;
                    department?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            specializations: {
                Row: {
                    id: string;
                    name_en: string;
                    name_ar: string;
                    category: string;
                    description_en: string | null;
                    description_ar: string | null;
                    icon_url: string | null;
                    min_fee: number | null;
                    max_fee: number | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name_en: string;
                    name_ar: string;
                    category?: string;
                    description_en?: string | null;
                    description_ar?: string | null;
                    icon_url?: string | null;
                    min_fee?: number | null;
                    max_fee?: number | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name_en?: string;
                    name_ar?: string;
                    category?: string;
                    description_en?: string | null;
                    description_ar?: string | null;
                    icon_url?: string | null;
                    min_fee?: number | null;
                    max_fee?: number | null;
                    is_active?: boolean;
                    created_at?: string;
                };
            };
            doctor_specializations: {
                Row: {
                    id: string;
                    doctor_profile_id: string;
                    specialization_id: string;
                    is_primary: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    doctor_profile_id: string;
                    specialization_id: string;
                    is_primary?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    doctor_profile_id?: string;
                    specialization_id?: string;
                    is_primary?: boolean;
                    created_at?: string;
                };
            };
            doctor_credentials: {
                Row: {
                    id: string;
                    doctor_profile_id: string;
                    credential_type: string;
                    document_url: string;
                    document_name: string | null;
                    issuing_authority: string | null;
                    issue_date: string | null;
                    expiry_date: string | null;
                    verification_status: VerificationStatus;
                    verification_notes: string | null;
                    verified_at: string | null;
                    verified_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    doctor_profile_id: string;
                    credential_type: string;
                    document_url: string;
                    document_name?: string | null;
                    issuing_authority?: string | null;
                    issue_date?: string | null;
                    expiry_date?: string | null;
                    verification_status?: VerificationStatus;
                    verification_notes?: string | null;
                    verified_at?: string | null;
                    verified_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    doctor_profile_id?: string;
                    credential_type?: string;
                    document_url?: string;
                    document_name?: string | null;
                    issuing_authority?: string | null;
                    issue_date?: string | null;
                    expiry_date?: string | null;
                    verification_status?: VerificationStatus;
                    verification_notes?: string | null;
                    verified_at?: string | null;
                    verified_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            appointments: {
                Row: {
                    id: string;
                    patient_profile_id: string;
                    doctor_profile_id: string;
                    scheduled_at: string;
                    duration_minutes: number;
                    status: AppointmentStatus;
                    appointment_type: string;
                    is_urgent: boolean;
                    reason: string | null;
                    chief_complaint: string | null;
                    doctor_notes: string | null;
                    consultation_fee: number;
                    platform_fee: number;
                    cancelled_at: string | null;
                    cancelled_by: string | null;
                    cancellation_reason: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    patient_profile_id: string;
                    doctor_profile_id: string;
                    scheduled_at: string;
                    duration_minutes?: number;
                    status?: AppointmentStatus;
                    appointment_type?: string;
                    is_urgent?: boolean;
                    reason?: string | null;
                    chief_complaint?: string | null;
                    doctor_notes?: string | null;
                    consultation_fee: number;
                    platform_fee?: number;
                    cancelled_at?: string | null;
                    cancelled_by?: string | null;
                    cancellation_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    patient_profile_id?: string;
                    doctor_profile_id?: string;
                    scheduled_at?: string;
                    duration_minutes?: number;
                    status?: AppointmentStatus;
                    appointment_type?: string;
                    is_urgent?: boolean;
                    reason?: string | null;
                    chief_complaint?: string | null;
                    doctor_notes?: string | null;
                    consultation_fee?: number;
                    platform_fee?: number;
                    cancelled_at?: string | null;
                    cancelled_by?: string | null;
                    cancellation_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            medical_records: {
                Row: {
                    id: string;
                    patient_profile_id: string;
                    record_type: string;
                    title: string;
                    description: string | null;
                    date_recorded: string | null;
                    recorded_by: string | null;
                    is_self_reported: boolean;
                    attachments: Json;
                    is_deleted: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    patient_profile_id: string;
                    record_type: string;
                    title: string;
                    description?: string | null;
                    date_recorded?: string | null;
                    recorded_by?: string | null;
                    is_self_reported?: boolean;
                    attachments?: Json;
                    is_deleted?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    patient_profile_id?: string;
                    record_type?: string;
                    title?: string;
                    description?: string | null;
                    date_recorded?: string | null;
                    recorded_by?: string | null;
                    is_self_reported?: boolean;
                    attachments?: Json;
                    is_deleted?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            support_tickets: {
                Row: {
                    id: string;
                    ticket_number: string;
                    profile_id: string;
                    category: string;
                    subject: string;
                    description: string;
                    status: TicketStatus;
                    priority: string;
                    assigned_to: string | null;
                    related_appointment_id: string | null;
                    resolution_notes: string | null;
                    resolved_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    ticket_number?: string;
                    profile_id: string;
                    category: string;
                    subject: string;
                    description: string;
                    status?: TicketStatus;
                    priority?: string;
                    assigned_to?: string | null;
                    related_appointment_id?: string | null;
                    resolution_notes?: string | null;
                    resolved_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    ticket_number?: string;
                    profile_id?: string;
                    category?: string;
                    subject?: string;
                    description?: string;
                    status?: TicketStatus;
                    priority?: string;
                    assigned_to?: string | null;
                    related_appointment_id?: string | null;
                    resolution_notes?: string | null;
                    resolved_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            system_settings: {
                Row: {
                    id: string;
                    key: string;
                    value: string;
                    description: string | null;
                    updated_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    key: string;
                    value: string;
                    description?: string | null;
                    updated_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    key?: string;
                    value?: string;
                    description?: string | null;
                    updated_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            user_role: UserRole;
            verification_status: VerificationStatus;
            appointment_status: AppointmentStatus;
            transaction_status: TransactionStatus;
            ticket_status: TicketStatus;
            assignment_status: AssignmentStatus;
        };
    };
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Update"];

// Convenience type aliases
export type Profile = Tables<"profiles">;
export type PatientProfile = Tables<"patient_profiles">;
export type DoctorProfile = Tables<"doctor_profiles">;
export type AdminProfile = Tables<"admin_profiles">;
export type AssistantProfile = Tables<"assistant_profiles">;
export type Specialization = Tables<"specializations">;
export type DoctorCredential = Tables<"doctor_credentials">;
export type Appointment = Tables<"appointments">;
export type MedicalRecord = Tables<"medical_records">;
export type SupportTicket = Tables<"support_tickets">;
export type SystemSetting = Tables<"system_settings">;
