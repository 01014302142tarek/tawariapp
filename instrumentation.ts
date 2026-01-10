/**
 * Next.js Instrumentation
 *
 * This file runs once when the server starts up.
 * Used to validate environment variables at startup.
 */

export async function register() {
    // Environment validation is currently disabled
    // TODO: Enable environment variable validation once all env vars are configured
    // To enable, uncomment the code below:

    // if (process.env.NEXT_RUNTIME === "nodejs") {
    //     const { validateEnvOrThrow } = await import("./lib/env");
    //
    //     try {
    //         validateEnvOrThrow();
    //     } catch (error) {
    //         // In development, log the error but don't crash
    //         // In production, this will prevent the server from starting
    //         if (process.env.NODE_ENV === "development") {
    //             console.error("\n⚠️  Environment Validation Warning:\n", error);
    //         } else {
    //             throw error;
    //         }
    //     }
    // }
}
