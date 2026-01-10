"use server";

import { createClient } from "./server";

// Maximum file sizes
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CREDENTIAL_SIZE = 10 * 1024 * 1024; // 10MB

// File signature (magic bytes) validation
const FILE_SIGNATURES: Record<string, number[][]> = {
    jpg: [[0xFF, 0xD8, 0xFF]],
    jpeg: [[0xFF, 0xD8, 0xFF]],
    png: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF header (followed by WEBP)
    pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
};

/**
 * Validates file content by checking magic bytes (file signatures)
 * This prevents attacks where malicious files are renamed with safe extensions
 */
function validateFileContent(buffer: Buffer, expectedType: string): boolean {
    const signatures = FILE_SIGNATURES[expectedType];
    if (!signatures) return false;

    return signatures.some(signature => {
        if (buffer.length < signature.length) return false;
        return signature.every((byte, index) => buffer[index] === byte);
    });
}

/**
 * Validates file size
 */
function validateFileSize(buffer: Buffer, maxSize: number): boolean {
    return buffer.length <= maxSize;
}

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

    // Validate file size
    if (!validateFileSize(buffer, MAX_AVATAR_SIZE)) {
        return { url: null, error: "File too large. Maximum size is 5MB." };
    }

    // Validate file content (magic bytes) to prevent malicious file uploads
    if (!validateFileContent(buffer, ext)) {
        return { url: null, error: "File content does not match the expected type. Please upload a valid image." };
    }

    // Generate unique file path using UUID to prevent path traversal
    const fileId = crypto.randomUUID();
    const filePath = `${userId}/${fileId}.${ext}`;

    // Upload to avatars bucket
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, buffer, {
            contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
            upsert: true, // Replace existing avatar
        });

    if (uploadError) {
        // Error details are returned to the caller, no need to log
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

    // Validate credential type to prevent path traversal
    const allowedCredentialTypes = ["license", "diploma", "certification", "id", "other"];
    const safeCredentialType = allowedCredentialTypes.includes(credentialType)
        ? credentialType
        : "other";

    // Validate file extension
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "pdf", "webp"].includes(ext)) {
        return { path: null, documentName: null, error: "Invalid file type. Only JPG, PNG, WebP, and PDF are allowed." };
    }

    // Convert base64 to buffer
    const base64Data = fileBase64.replace(/^data:(image|application)\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Validate file size
    if (!validateFileSize(buffer, MAX_CREDENTIAL_SIZE)) {
        return { path: null, documentName: null, error: "File too large. Maximum size is 10MB." };
    }

    // Validate file content (magic bytes) to prevent malicious file uploads
    if (!validateFileContent(buffer, ext)) {
        return { path: null, documentName: null, error: "File content does not match the expected type. Please upload a valid file." };
    }

    // Generate unique file path using UUID to prevent path traversal
    const fileId = crypto.randomUUID();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100); // Limit name length
    const filePath = `${doctorProfileId}/${safeCredentialType}/${fileId}_${sanitizedName}`;

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
        // Error details are returned to the caller, no need to log
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
        // Error details are returned to the caller, no need to log
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
        // Error details are returned to the caller, no need to log
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
        // Error details are returned to the caller, no need to log
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
        // Error details are returned to the caller, no need to log
        return { success: false, error: error.message };
    }

    return { success: true, credentialId: data?.id };
}
