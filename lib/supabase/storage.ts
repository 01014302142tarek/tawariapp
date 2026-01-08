"use server";

import { createClient } from "./server";

/**
 * Upload an avatar image for a user
 * @param userId - The user's auth ID
 * @param file - The file to upload (base64 encoded)
 * @param fileName - Original file name
 * @returns The public URL of the uploaded avatar
 */
export async function uploadAvatar(
    userId: string,
    fileBase64: string,
    fileName: string
): Promise<{ url: string | null; error?: string }> {
    const supabase = await createClient();

    // Validate file extension
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
        return { url: null, error: "Invalid file type. Only JPG, PNG, and WebP are allowed." };
    }

    // Convert base64 to buffer
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique file path
    const filePath = `${userId}/avatar.${ext}`;

    // Upload to avatars bucket
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, buffer, {
            contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
            upsert: true, // Replace existing avatar
        });

    if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

    return { url: publicUrl };
}

/**
 * Upload a credential document for doctor verification
 * @param doctorProfileId - The doctor's profile ID
 * @param credentialType - Type of credential (license, diploma, etc.)
 * @param fileBase64 - Base64 encoded file
 * @param fileName - Original file name
 * @returns The storage path and document name
 */
export async function uploadCredential(
    doctorProfileId: string,
    credentialType: string,
    fileBase64: string,
    fileName: string
): Promise<{ path: string | null; documentName: string | null; error?: string }> {
    const supabase = await createClient();

    // Validate file extension
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "pdf", "webp"].includes(ext)) {
        return { path: null, documentName: null, error: "Invalid file type. Only JPG, PNG, WebP, and PDF are allowed." };
    }

    // Convert base64 to buffer
    const base64Data = fileBase64.replace(/^data:(image|application)\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique file path with timestamp
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${doctorProfileId}/${credentialType}/${timestamp}_${sanitizedName}`;

    // Determine content type
    let contentType = "application/octet-stream";
    if (ext === "pdf") {
        contentType = "application/pdf";
    } else if (["jpg", "jpeg"].includes(ext)) {
        contentType = "image/jpeg";
    } else if (ext === "png") {
        contentType = "image/png";
    } else if (ext === "webp") {
        contentType = "image/webp";
    }

    // Upload to credentials bucket (private)
    const { error: uploadError } = await supabase.storage
        .from("credentials")
        .upload(filePath, buffer, {
            contentType,
            upsert: false, // Don't overwrite - each credential is unique
        });

    if (uploadError) {
        console.error("Error uploading credential:", uploadError);
        return { path: null, documentName: null, error: uploadError.message };
    }

    return { path: filePath, documentName: sanitizedName };
}

/**
 * Get a signed URL for viewing a private credential document
 * Only admins should call this function
 * @param path - The storage path of the credential
 * @param expiresIn - URL expiration in seconds (default 1 hour)
 */
export async function getCredentialSignedUrl(
    path: string,
    expiresIn: number = 3600
): Promise<{ url: string | null; error?: string }> {
    const supabase = await createClient();

    // Verify caller is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { url: null, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { role: string } | null;
    if (!profile || profile.role !== "admin") {
        return { url: null, error: "Unauthorized - Admin access required" };
    }

    // Generate signed URL
    const { data, error } = await supabase.storage
        .from("credentials")
        .createSignedUrl(path, expiresIn);

    if (error) {
        console.error("Error creating signed URL:", error);
        return { url: null, error: error.message };
    }

    return { url: data.signedUrl };
}

/**
 * Delete an avatar image
 * @param userId - The user's auth ID
 */
export async function deleteAvatar(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // List all files in user's avatar folder
    const { data: files, error: listError } = await supabase.storage
        .from("avatars")
        .list(userId);

    if (listError) {
        console.error("Error listing avatars:", listError);
        return { success: false, error: listError.message };
    }

    if (!files || files.length === 0) {
        return { success: true }; // Nothing to delete
    }

    // Delete all avatar files for this user
    const filePaths = files.map(f => `${userId}/${f.name}`);
    const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove(filePaths);

    if (deleteError) {
        console.error("Error deleting avatars:", deleteError);
        return { success: false, error: deleteError.message };
    }

    return { success: true };
}

/**
 * Save uploaded credential to doctor_credentials table
 */
export async function saveCredentialRecord(
    doctorProfileId: string,
    credentialType: string,
    documentUrl: string,
    documentName: string
): Promise<{ success: boolean; credentialId?: string; error?: string }> {
    const supabase = await createClient();

    // Verify caller owns this doctor profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    const profile = profileData as { id: string; role: string } | null;
    if (!profile || profile.role !== "doctor") {
        return { success: false, error: "Not a doctor profile" };
    }

    // Verify doctor profile belongs to this user
    const { data: doctorProfileData } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    const doctorProfile = doctorProfileData as { id: string } | null;
    if (!doctorProfile || doctorProfile.id !== doctorProfileId) {
        return { success: false, error: "Unauthorized" };
    }

    // Insert credential record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("doctor_credentials")
        .insert({
            doctor_profile_id: doctorProfileId,
            credential_type: credentialType,
            document_url: documentUrl,
            document_name: documentName,
            verification_status: "pending",
        })
        .select("id")
        .single();

    if (error) {
        console.error("Error saving credential record:", error);
        return { success: false, error: error.message };
    }

    return { success: true, credentialId: data?.id };
}
