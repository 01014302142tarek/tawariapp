import { z } from "zod";

/**
 * Validation schemas for server actions
 * These schemas validate user input before processing
 */

// Egyptian phone number format: +20XXXXXXXXXX
export const egyptianPhoneSchema = z
    .string()
    .regex(/^\+20[0-9]{10}$/, "Invalid Egyptian phone number format (+20XXXXXXXXXX)");

// Email validation
export const emailSchema = z.string().email("Invalid email address");

// Doctor onboarding validations
export const professionalDetailsSchema = z.object({
    licenseNumber: z
        .string()
        .min(5, "License number must be at least 5 characters")
        .max(50, "License number must be less than 50 characters")
        .regex(/^[A-Za-z0-9-]+$/, "License number can only contain letters, numbers, and hyphens"),
    yearsOfExperience: z
        .number()
        .int("Years of experience must be a whole number")
        .min(0, "Years of experience cannot be negative")
        .max(70, "Years of experience must be less than 70"),
    specialty: z
        .string()
        .min(2, "Specialty must be at least 2 characters")
        .max(100, "Specialty must be less than 100 characters"),
    certifications: z
        .string()
        .max(1000, "Certifications must be less than 1000 characters")
        .optional(),
});

export const practiceInfoSchema = z.object({
    clinicName: z
        .string()
        .max(200, "Clinic name must be less than 200 characters")
        .optional(),
    clinicAddress: z
        .string()
        .max(500, "Clinic address must be less than 500 characters")
        .optional(),
    consultationFee: z
        .string()
        .optional()
        .transform((val) => {
            if (!val) return null;
            const num = parseFloat(val);
            if (isNaN(num)) return null;
            return num;
        })
        .pipe(
            z.number()
                .min(0, "Consultation fee cannot be negative")
                .max(10000, "Consultation fee must be less than 10,000 EGP")
                .nullable()
        ),
});

export const doctorBioSchema = z.object({
    bio: z
        .string()
        .max(2000, "Bio must be less than 2000 characters")
        .optional(),
});

// Appointment validations
export const appointmentSchema = z.object({
    doctorProfileId: z.string().uuid("Invalid doctor ID"),
    scheduledStart: z.string().datetime("Invalid start time"),
    scheduledEnd: z.string().datetime("Invalid end time"),
    patientNotes: z
        .string()
        .max(1000, "Notes must be less than 1000 characters")
        .optional(),
});

// Message validations
export const messageSchema = z.object({
    conversationId: z.string().uuid("Invalid conversation ID"),
    recipientProfileId: z.string().uuid("Invalid recipient ID"),
    content: z
        .string()
        .min(1, "Message cannot be empty")
        .max(5000, "Message must be less than 5000 characters"),
});

// Prescription validations
export const medicationSchema = z.object({
    medication_name: z
        .string()
        .min(1, "Medication name is required")
        .max(200, "Medication name must be less than 200 characters"),
    dosage: z
        .string()
        .max(100, "Dosage must be less than 100 characters"),
    frequency: z
        .string()
        .max(100, "Frequency must be less than 100 characters"),
    duration: z
        .string()
        .max(100, "Duration must be less than 100 characters"),
    instructions: z
        .string()
        .max(500, "Instructions must be less than 500 characters")
        .optional(),
});

export const prescriptionSchema = z.object({
    patientProfileId: z.string().uuid("Invalid patient ID"),
    medications: z
        .array(medicationSchema)
        .min(1, "At least one medication is required")
        .max(20, "Maximum 20 medications per prescription"),
    validUntil: z.string().optional(),
});

// Medical record validations
export const medicalRecordSchema = z.object({
    recordType: z.enum([
        "visit_note",
        "lab_result",
        "prescription",
        "imaging",
        "referral",
        "other"
    ]),
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
    description: z
        .string()
        .max(5000, "Description must be less than 5000 characters")
        .optional(),
    recordDate: z.string().optional(),
});

// Helper function to safely validate input
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    // Return the first error message
    const issues = result.error.issues;
    const firstIssue = issues[0];
    return {
        success: false,
        error: firstIssue?.message || "Validation failed",
    };
}
