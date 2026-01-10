"use server";

import { createClient } from "@/lib/supabase/server";
import { messageLimiter } from "@/lib/rate-limit";
import { messageSchema, validateInput } from "@/lib/validations";

// ============================================
// Types
// ============================================

export type MessageType = "text" | "file" | "system";

export interface Message {
    id: string;
    conversation_id: string;
    sender_profile_id: string;
    recipient_profile_id: string;
    content: string;
    message_type: MessageType;
    attachment_url?: string;
    attachment_type?: string;
    is_read: boolean;
    read_at?: string;
    is_deleted: boolean;
    created_at: string;
}

export interface MessageWithSender extends Message {
    sender?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        role: string;
    };
}

export interface Conversation {
    id: string;
    participant_id: string;
    participant_name: string;
    participant_avatar?: string;
    participant_role: string;
    last_message?: string;
    last_message_at?: string;
    unread_count: number;
}

// ============================================
// Conversation Functions
// ============================================

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<{
    conversations: Conversation[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { conversations: [], error: "Not authenticated" };
    }

    // Get current user's profile
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { conversations: [], error: "Profile not found" };
    }

    // Get all messages where user is sender or recipient, grouped by conversation
    const { data: messages, error } = await supabase
        .from("messages")
        .select(`
            id,
            conversation_id,
            sender_profile_id,
            recipient_profile_id,
            content,
            is_read,
            created_at,
            sender:profiles!messages_sender_profile_id_fkey (
                id,
                full_name,
                avatar_url,
                role
            ),
            recipient:profiles!messages_recipient_profile_id_fkey (
                id,
                full_name,
                avatar_url,
                role
            )
        `)
        .or(`sender_profile_id.eq.${profile.id},recipient_profile_id.eq.${profile.id}`)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching messages:", error);
        return { conversations: [], error: error.message };
    }

    // Group messages by conversation and extract conversation details
    const conversationMap = new Map<string, Conversation>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (messages || []).forEach((msg: any) => {
        const convId = msg.conversation_id;
        if (!conversationMap.has(convId)) {
            // Determine the other participant
            const isUserSender = msg.sender_profile_id === profile.id;
            const otherParticipant = isUserSender ? msg.recipient : msg.sender;

            conversationMap.set(convId, {
                id: convId,
                participant_id: otherParticipant?.id || "",
                participant_name: otherParticipant?.full_name || "Unknown",
                participant_avatar: otherParticipant?.avatar_url,
                participant_role: otherParticipant?.role || "patient",
                last_message: msg.content,
                last_message_at: msg.created_at,
                unread_count: 0,
            });
        }

        // Count unread messages
        if (msg.recipient_profile_id === profile.id && !msg.is_read) {
            const conv = conversationMap.get(convId)!;
            conv.unread_count++;
        }
    });

    return { conversations: Array.from(conversationMap.values()) };
}

/**
 * Get or create a conversation with another user
 */
export async function getOrCreateConversation(
    otherProfileId: string
): Promise<{ conversationId: string | null; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { conversationId: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { conversationId: null, error: "Profile not found" };
    }

    // Check if conversation already exists
    const { data: existingMessages } = await supabase
        .from("messages")
        .select("conversation_id")
        .or(`and(sender_profile_id.eq.${profile.id},recipient_profile_id.eq.${otherProfileId}),and(sender_profile_id.eq.${otherProfileId},recipient_profile_id.eq.${profile.id})`)
        .limit(1);

    const messages = existingMessages as { conversation_id: string }[] | null;
    if (messages && messages.length > 0) {
        return { conversationId: messages[0].conversation_id };
    }

    // Create new conversation ID (UUID)
    const conversationId = crypto.randomUUID();
    return { conversationId };
}

// ============================================
// Message Functions
// ============================================

/**
 * Get messages for a conversation
 */
export async function getMessages(
    conversationId: string,
    limit = 50,
    offset = 0
): Promise<{ messages: MessageWithSender[]; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { messages: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { messages: [], error: "Profile not found" };
    }

    const { data, error } = await supabase
        .from("messages")
        .select(`
            *,
            sender:profiles!messages_sender_profile_id_fkey (
                id,
                full_name,
                avatar_url,
                role
            )
        `)
        .eq("conversation_id", conversationId)
        .eq("is_deleted", false)
        .or(`sender_profile_id.eq.${profile.id},recipient_profile_id.eq.${profile.id}`)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error("Error fetching messages:", error);
        return { messages: [], error: error.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: MessageWithSender[] = (data || []).map((msg: any) => ({
        ...msg,
        sender: msg.sender ? {
            id: msg.sender.id,
            full_name: msg.sender.full_name,
            avatar_url: msg.sender.avatar_url,
            role: msg.sender.role,
        } : undefined,
    }));

    return { messages };
}

/**
 * Send a message
 * Rate limited: 30 messages per minute per user
 */
export async function sendMessage(data: {
    conversationId: string;
    recipientProfileId: string;
    content: string;
    messageType?: MessageType;
    attachmentUrl?: string;
    attachmentType?: string;
}): Promise<{ message: Message | null; error?: string; retryAfter?: number }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { message: null, error: "Profile not found" };
    }

    // Validate input
    const validation = validateInput(messageSchema, {
        conversationId: data.conversationId,
        recipientProfileId: data.recipientProfileId,
        content: data.content,
    });
    if (!validation.success) {
        return { message: null, error: validation.error };
    }

    // Check rate limit
    const rateLimitKey = `messages:${profile.id}`;
    const rateLimit = messageLimiter.check(rateLimitKey);
    if (!rateLimit.allowed) {
        return {
            message: null,
            error: "Too many messages sent. Please wait before sending more.",
            retryAfter: rateLimit.retryAfter ?? undefined,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insertedData, error } = await (supabase as any)
        .from("messages")
        .insert({
            conversation_id: data.conversationId,
            sender_profile_id: profile.id,
            recipient_profile_id: data.recipientProfileId,
            content: data.content,
            message_type: data.messageType || "text",
            attachment_url: data.attachmentUrl || null,
            attachment_type: data.attachmentType || null,
            is_read: false,
            is_deleted: false,
        })
        .select()
        .single();

    if (error) {
        return { message: null, error: error.message };
    }

    return { message: insertedData as Message };
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
    conversationId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("messages")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("conversation_id", conversationId)
        .eq("recipient_profile_id", profile.id)
        .eq("is_read", false);

    if (error) {
        console.error("Error marking messages as read:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get unread message count for current user
 */
export async function getUnreadCount(): Promise<{ count: number; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { count: 0, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { count: 0, error: "Profile not found" };
    }

    const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_profile_id", profile.id)
        .eq("is_read", false)
        .eq("is_deleted", false);

    if (error) {
        console.error("Error getting unread count:", error);
        return { count: 0, error: error.message };
    }

    return { count: count || 0 };
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(
    messageId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    // Only allow deleting own messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("messages")
        .update({ is_deleted: true })
        .eq("id", messageId)
        .eq("sender_profile_id", profile.id);

    if (error) {
        console.error("Error deleting message:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// Get contacts for starting new conversations
// ============================================

export interface ContactForMessaging {
    profile_id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
    specialty?: string;
}

/**
 * Get contacts (for patients: doctors they've had appointments with)
 */
export async function getPatientContacts(): Promise<{
    contacts: ContactForMessaging[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { contacts: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { contacts: [], error: "Profile not found" };
    }

    const { data: patientProfileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const patientProfile = patientProfileData as { id: string } | null;
    if (!patientProfile) {
        return { contacts: [], error: "Patient profile not found" };
    }

    // Get doctors from appointments (scheduled, in_progress, or completed)
    const { data, error } = await supabase
        .from("appointments")
        .select(`
            doctor_profiles!inner (
                id,
                profile_id,
                profiles!inner (
                    id,
                    full_name,
                    avatar_url,
                    role
                )
            )
        `)
        .eq("patient_profile_id", patientProfile.id)
        .in("status", ["scheduled", "in_waiting_room", "in_progress", "completed"]);

    if (error) {
        console.error("Error fetching contacts:", error);
        return { contacts: [], error: error.message };
    }

    // De-duplicate doctors
    const contactMap = new Map<string, ContactForMessaging>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).forEach((apt: any) => {
        const dp = apt.doctor_profiles;
        const profileId = dp.profiles.id;
        if (!contactMap.has(profileId)) {
            contactMap.set(profileId, {
                profile_id: profileId,
                full_name: dp.profiles.full_name,
                avatar_url: dp.profiles.avatar_url,
                role: dp.profiles.role,
            });
        }
    });

    return { contacts: Array.from(contactMap.values()) };
}

/**
 * Get contacts (for doctors: patients they've had appointments with)
 */
export async function getDoctorContacts(): Promise<{
    contacts: ContactForMessaging[];
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { contacts: [], error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string } | null;
    if (!profile) {
        return { contacts: [], error: "Profile not found" };
    }

    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile) {
        return { contacts: [], error: "Doctor profile not found" };
    }

    // Get patients from appointments (scheduled, in_progress, or completed)
    const { data, error } = await supabase
        .from("appointments")
        .select(`
            patient_profiles!inner (
                id,
                profile_id,
                profiles!inner (
                    id,
                    full_name,
                    avatar_url,
                    role
                )
            )
        `)
        .eq("doctor_profile_id", doctorProfile.id)
        .in("status", ["scheduled", "in_waiting_room", "in_progress", "completed"]);

    if (error) {
        console.error("Error fetching contacts:", error);
        return { contacts: [], error: error.message };
    }

    // De-duplicate patients
    const contactMap = new Map<string, ContactForMessaging>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).forEach((apt: any) => {
        const pp = apt.patient_profiles;
        const profileId = pp.profiles.id;
        if (!contactMap.has(profileId)) {
            contactMap.set(profileId, {
                profile_id: profileId,
                full_name: pp.profiles.full_name,
                avatar_url: pp.profiles.avatar_url,
                role: pp.profiles.role,
            });
        }
    });

    return { contacts: Array.from(contactMap.values()) };
}
