import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Generate a URL-friendly slug from a doctor's name and ID
 * Example: "Ahmed Hassan" + "abc123" => "dr-ahmed-hassan-abc123"
 * Example: "Dr. Ahmed Hassan" + "abc123" => "dr-ahmed-hassan-abc123"
 */
export function generateDoctorSlug(name: string, id: string): string {
    // Remove "Dr." or "Dr " prefix if it exists to avoid duplication
    const nameWithoutDrPrefix = name
        .replace(/^dr\.?\s*/i, "") // Remove "Dr." or "Dr " at the start
        .trim();

    const slugifiedName = nameWithoutDrPrefix
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen

    return `dr-${slugifiedName}-${id}`;
}

/**
 * Extract the doctor ID from a URL slug
 * Example: "dr-ahmed-hassan-abc123" => "abc123"
 * The ID is assumed to be the last segment after the final hyphen
 */
export function extractDoctorIdFromSlug(slug: string): string {
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars with hyphens)
    // The ID is the last 36 characters if it's a UUID
    const uuidMatch = slug.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
    if (uuidMatch) {
        return uuidMatch[1];
    }

    // Fallback: assume the ID is everything after "dr-{name}-"
    // Split by hyphen and take everything after the first occurrence of a UUID-like pattern
    const parts = slug.split("-");
    // UUIDs have 5 parts when split by hyphen, so look for that pattern at the end
    if (parts.length >= 6) {
        // Try to find where the UUID starts (it has 5 parts: 8-4-4-4-12 chars)
        for (let i = parts.length - 5; i >= 0; i--) {
            const potentialUuid = parts.slice(i, i + 5).join("-");
            if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(potentialUuid)) {
                return potentialUuid;
            }
        }
    }

    // Last resort: return the original slug (might be just an ID)
    return slug;
}
