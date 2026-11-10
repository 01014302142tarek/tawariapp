/**
 * Validation utilities for manual payment transfers (InstaPay & WE Pay)
 */

/**
 * Validate Egyptian mobile phone number
 * Accepts 11 digits starting with 010, 011, 012, or 015
 * Supports optional +20 or 0020 prefix
 * Examples: 01014302142, 01555952142, +201012345678
 */
export function isValidEgyptianPhone(phone: string | null | undefined): boolean {
    if (!phone) return false;
    const clean = phone.trim().replace(/[\s\-_()]/g, "");
    return /^(?:(?:\+20|0020)|0)?1[0125][0-9]{8}$/.test(clean);
}

/**
 * Format Egyptian phone to standard 11-digit local format: 01XXXXXXXXX
 */
export function normalizeEgyptianPhone(phone: string): string {
    const clean = phone.trim().replace(/[\s\-_()]/g, "");
    if (clean.startsWith("+20")) {
        return "0" + clean.slice(3);
    }
    if (clean.startsWith("0020")) {
        return "0" + clean.slice(4);
    }
    if (!clean.startsWith("0") && clean.length === 10) {
        return "0" + clean;
    }
    return clean;
}

/**
 * Validate person full name
 * Requires at least 2 words (e.g. "محمد علي" or "Ahmed Hassan")
 * Letters (Arabic or English) and spaces only
 * Length between 3 and 60 characters
 * Rejects repeated characters like "aaaa" and arbitrary gibberish
 */
export function isValidFullName(name: string | null | undefined): boolean {
    if (!name) return false;
    const trimmed = name.trim();

    // Arabic and English letters plus spaces only
    if (!/^[\u0600-\u06FFa-zA-Z\s]{3,60}$/.test(trimmed)) {
        return false;
    }

    // Must have at least two parts (first name + last name)
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
        return false;
    }

    // Each word must be at least 2 letters
    if (!words.every(w => w.length >= 2)) {
        return false;
    }

    // Reject repeated character sequences (4 or more consecutive identical chars e.g. "aaaa")
    if (/(.)\1{3,}/.test(trimmed)) {
        return false;
    }

    return true;
}

