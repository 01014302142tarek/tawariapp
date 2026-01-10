/**
 * Environment variable validation
 *
 * This module validates required environment variables at startup
 * to fail fast if configuration is missing.
 */

type EnvVar = {
    key: string;
    required: boolean;
    description: string;
};

// Required environment variables
const requiredEnvVars: EnvVar[] = [
    {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        required: true,
        description: "Supabase project URL",
    },
    {
        key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        required: true,
        description: "Supabase anonymous key for client-side access",
    },
];

// Server-only environment variables (not needed for client)
const serverEnvVars: EnvVar[] = [
    {
        key: "SUPABASE_SERVICE_ROLE_KEY",
        required: false, // Only required for admin operations
        description: "Supabase service role key for admin operations",
    },
    {
        key: "PAYMOB_API_KEY",
        required: false, // Only required for payment processing
        description: "Paymob API key for payment processing",
    },
    {
        key: "PAYMOB_INTEGRATION_ID",
        required: false,
        description: "Paymob integration ID",
    },
    {
        key: "PAYMOB_HMAC_SECRET",
        required: false,
        description: "Paymob HMAC secret for webhook verification",
    },
    {
        key: "NEXT_PUBLIC_APP_URL",
        required: false,
        description: "Application base URL",
    },
];

/**
 * Validates environment variables and returns missing ones
 */
export function validateEnv(): {
    valid: boolean;
    missing: string[];
    warnings: string[];
} {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Check required env vars
    for (const envVar of requiredEnvVars) {
        const value = process.env[envVar.key];
        if (!value || value.trim() === "") {
            if (envVar.required) {
                missing.push(`${envVar.key}: ${envVar.description}`);
            }
        }
    }

    // Check server env vars (warnings only)
    if (typeof window === "undefined") {
        for (const envVar of serverEnvVars) {
            const value = process.env[envVar.key];
            if (!value || value.trim() === "") {
                warnings.push(`${envVar.key}: ${envVar.description} (optional)`);
            }
        }
    }

    return {
        valid: missing.length === 0,
        missing,
        warnings,
    };
}

/**
 * Validates environment at startup and throws if critical vars are missing
 */
export function validateEnvOrThrow(): void {
    const result = validateEnv();

    if (!result.valid) {
        const errorMessage = [
            "Missing required environment variables:",
            ...result.missing.map((m) => `  - ${m}`),
            "",
            "Please check your .env.local file and ensure all required variables are set.",
        ].join("\n");

        throw new Error(errorMessage);
    }

    // Log warnings in development
    if (process.env.NODE_ENV === "development" && result.warnings.length > 0) {
        console.warn(
            "Optional environment variables not set:",
            result.warnings.map((w) => `\n  - ${w}`).join("")
        );
    }
}

/**
 * Get a typed environment configuration object
 * Call this after validateEnvOrThrow to get typed access to env vars
 */
export function getEnvConfig() {
    return {
        // Public vars (available on client)
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

        // Server-only vars
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        paymobApiKey: process.env.PAYMOB_API_KEY,
        paymobIntegrationId: process.env.PAYMOB_INTEGRATION_ID,
        paymobHmacSecret: process.env.PAYMOB_HMAC_SECRET,

        // Computed
        isDevelopment: process.env.NODE_ENV === "development",
        isProduction: process.env.NODE_ENV === "production",
    };
}
