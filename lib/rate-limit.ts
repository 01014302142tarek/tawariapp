/**
 * In-memory rate limiter for protecting sensitive endpoints
 *
 * For MVP/development use. For production at scale, consider
 * migrating to Upstash Redis (@upstash/ratelimit)
 */

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

type RateLimitConfig = {
    /** Time window in seconds */
    interval: number;
    /** Maximum requests allowed per window */
    maxRequests: number;
};

class RateLimiter {
    private cache: Map<string, RateLimitEntry> = new Map();
    private cleanupTimer: ReturnType<typeof setInterval> | null = null;

    constructor(private config: RateLimitConfig) {
        // Clean up expired entries every 5 minutes to prevent memory bloat
        if (typeof setInterval !== "undefined") {
            this.cleanupTimer = setInterval(() => {
                this.cleanup();
            }, 5 * 60 * 1000);
        }
    }

    /**
     * Check if a request is allowed for the given identifier
     * @param identifier - Unique key (e.g., email, user ID, IP)
     * @returns Object with allowed status and retry info
     */
    check(identifier: string): {
        allowed: boolean;
        remaining: number;
        retryAfter: number | null;
        limit: number;
    } {
        const now = Date.now();
        const entry = this.cache.get(identifier);

        // No entry or window expired - allow and start new window
        if (!entry || entry.resetAt <= now) {
            this.cache.set(identifier, {
                count: 1,
                resetAt: now + this.config.interval * 1000,
            });
            return {
                allowed: true,
                remaining: this.config.maxRequests - 1,
                retryAfter: null,
                limit: this.config.maxRequests,
            };
        }

        // Window still active - check count
        if (entry.count < this.config.maxRequests) {
            entry.count++;
            return {
                allowed: true,
                remaining: this.config.maxRequests - entry.count,
                retryAfter: null,
                limit: this.config.maxRequests,
            };
        }

        // Rate limit exceeded
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            retryAfter,
            limit: this.config.maxRequests,
        };
    }

    /**
     * Reset the rate limit for an identifier (e.g., after successful login)
     */
    reset(identifier: string): void {
        this.cache.delete(identifier);
    }

    /**
     * Clean up expired entries to prevent memory bloat
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.resetAt <= now) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Destroy the limiter and clean up resources
     */
    destroy(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.cache.clear();
    }
}

// Pre-configured limiters for different use cases
// These are singletons - they persist across requests in development
// In production on Vercel, each serverless function instance has its own

/**
 * Login rate limiter
 * 5 attempts per 15 minutes per email
 * Prevents brute-force password guessing
 */
export const loginLimiter = new RateLimiter({
    interval: 15 * 60, // 15 minutes
    maxRequests: 5,
});

/**
 * Password reset rate limiter
 * 3 attempts per hour per email
 * Prevents email bombing and enumeration
 */
export const passwordResetLimiter = new RateLimiter({
    interval: 60 * 60, // 1 hour
    maxRequests: 3,
});

/**
 * OTP verification rate limiter
 * 5 attempts per 5 minutes per phone/email
 * Prevents OTP brute-forcing
 */
export const otpLimiter = new RateLimiter({
    interval: 5 * 60, // 5 minutes
    maxRequests: 5,
});

/**
 * Message sending rate limiter
 * 30 messages per minute per user
 * Prevents spam
 */
export const messageLimiter = new RateLimiter({
    interval: 60, // 1 minute
    maxRequests: 30,
});

/**
 * Appointment booking rate limiter
 * 10 bookings per hour per user
 * Prevents abuse
 */
export const appointmentLimiter = new RateLimiter({
    interval: 60 * 60, // 1 hour
    maxRequests: 10,
});

/**
 * General API rate limiter
 * 100 requests per minute per IP
 * Prevents abuse of public endpoints
 */
export const generalApiLimiter = new RateLimiter({
    interval: 60, // 1 minute
    maxRequests: 100,
});

/**
 * Helper to create rate limit error response
 */
export function rateLimitResponse(retryAfter: number): Response {
    return new Response(
        JSON.stringify({
            error: "Too many requests. Please try again later.",
            retryAfter,
        }),
        {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": String(retryAfter),
            },
        }
    );
}

/**
 * Helper to add rate limit headers to a response
 */
export function addRateLimitHeaders(
    headers: Headers,
    result: ReturnType<RateLimiter["check"]>
): void {
    headers.set("X-RateLimit-Limit", String(result.limit));
    headers.set("X-RateLimit-Remaining", String(result.remaining));
    if (result.retryAfter !== null) {
        headers.set("Retry-After", String(result.retryAfter));
    }
}

// Export the class for custom configurations
export { RateLimiter };
export type { RateLimitConfig };
