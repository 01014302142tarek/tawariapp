/**
 * Rate limiter with support for both in-memory (development) and Redis (production)
 *
 * In production on Vercel, uses Upstash Redis for distributed rate limiting.
 * In development or if Redis is not configured, falls back to in-memory.
 *
 * To enable Redis rate limiting:
 * 1. Create an Upstash Redis database at https://upstash.com
 * 2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env.local
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
    /** Identifier prefix for Redis keys */
    prefix?: string;
};

type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    retryAfter: number | null;
    limit: number;
};

// Check if Upstash Redis is configured
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_REDIS = !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);

/**
 * Simple Redis client using REST API (no dependencies needed)
 */
async function redisCommand(command: string[]): Promise<unknown> {
    if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
        throw new Error("Redis not configured");
    }

    const response = await fetch(UPSTASH_REDIS_REST_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
    });

    if (!response.ok) {
        throw new Error(`Redis error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
}

class RateLimiter {
    private cache: Map<string, RateLimitEntry> = new Map();
    private cleanupTimer: ReturnType<typeof setInterval> | null = null;
    private prefix: string;

    constructor(private config: RateLimitConfig) {
        this.prefix = config.prefix || "rl";

        // Only set up cleanup timer for in-memory mode
        if (!USE_REDIS && typeof setInterval !== "undefined") {
            this.cleanupTimer = setInterval(() => {
                this.cleanup();
            }, 5 * 60 * 1000);
        }
    }

    /**
     * Check if a request is allowed for the given identifier
     * Uses Redis in production, in-memory in development
     */
    async check(identifier: string): Promise<RateLimitResult> {
        if (USE_REDIS) {
            return this.checkRedis(identifier);
        }
        return this.checkMemory(identifier);
    }

    /**
     * Synchronous check for backwards compatibility (in-memory only)
     * @deprecated Use async check() instead
     */
    checkSync(identifier: string): RateLimitResult {
        return this.checkMemory(identifier);
    }

    /**
     * Redis-based rate limiting (distributed, production-ready)
     */
    private async checkRedis(identifier: string): Promise<RateLimitResult> {
        const key = `${this.prefix}:${identifier}`;
        const now = Math.floor(Date.now() / 1000);
        const windowStart = now - this.config.interval;

        try {
            // Use Redis sorted set for sliding window rate limiting
            // Remove old entries, add new entry, count entries in window
            await redisCommand(["ZREMRANGEBYSCORE", key, "0", String(windowStart)]);
            await redisCommand(["ZADD", key, String(now), `${now}:${Math.random()}`]);
            await redisCommand(["EXPIRE", key, String(this.config.interval)]);
            const count = (await redisCommand(["ZCARD", key])) as number;

            if (count <= this.config.maxRequests) {
                return {
                    allowed: true,
                    remaining: this.config.maxRequests - count,
                    retryAfter: null,
                    limit: this.config.maxRequests,
                };
            }

            // Get oldest entry to calculate retry time
            const oldest = (await redisCommand(["ZRANGE", key, "0", "0", "WITHSCORES"])) as string[];
            const oldestTime = oldest.length >= 2 ? parseInt(oldest[1], 10) : now;
            const retryAfter = Math.max(1, oldestTime + this.config.interval - now);

            return {
                allowed: false,
                remaining: 0,
                retryAfter,
                limit: this.config.maxRequests,
            };
        } catch (error) {
            // Fall back to in-memory if Redis fails
            console.error("[Rate Limiter] Redis error, falling back to in-memory:", error);
            return this.checkMemory(identifier);
        }
    }

    /**
     * In-memory rate limiting (development, single instance)
     */
    private checkMemory(identifier: string): RateLimitResult {
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
     * Reset the rate limit for an identifier
     */
    async reset(identifier: string): Promise<void> {
        if (USE_REDIS) {
            try {
                await redisCommand(["DEL", `${this.prefix}:${identifier}`]);
            } catch (error) {
                console.error("[Rate Limiter] Redis reset error:", error);
            }
        }
        this.cache.delete(identifier);
    }

    /**
     * Clean up expired entries (in-memory only)
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

/**
 * Login rate limiter
 * 5 attempts per 15 minutes per email
 * Prevents brute-force password guessing
 */
export const loginLimiter = new RateLimiter({
    interval: 15 * 60, // 15 minutes
    maxRequests: 5,
    prefix: "rl:login",
});

/**
 * Password reset rate limiter
 * 3 attempts per hour per email
 * Prevents email bombing and enumeration
 */
export const passwordResetLimiter = new RateLimiter({
    interval: 60 * 60, // 1 hour
    maxRequests: 3,
    prefix: "rl:pwreset",
});

/**
 * OTP verification rate limiter
 * 5 attempts per 5 minutes per phone/email
 * Prevents OTP brute-forcing
 */
export const otpLimiter = new RateLimiter({
    interval: 5 * 60, // 5 minutes
    maxRequests: 5,
    prefix: "rl:otp",
});

/**
 * Contact form submission rate limiter
 * 5 submissions per 15 minutes per IP
 * Prevents contact form spam / DoS
 */
export const contactLimiter = new RateLimiter({
    interval: 15 * 60, // 15 minutes
    maxRequests: 5,
    prefix: "rl:contact",
});

/**
 * Message sending rate limiter
 * 30 messages per minute per user
 * Prevents spam
 */
export const messageLimiter = new RateLimiter({
    interval: 60, // 1 minute
    maxRequests: 30,
    prefix: "rl:msg",
});

/**
 * Appointment booking rate limiter
 * 10 bookings per hour per user
 * Prevents abuse
 */
export const appointmentLimiter = new RateLimiter({
    interval: 60 * 60, // 1 hour
    maxRequests: 10,
    prefix: "rl:appt",
});

/**
 * General API rate limiter
 * 100 requests per minute per IP
 * Prevents abuse of public endpoints
 */
export const generalApiLimiter = new RateLimiter({
    interval: 60, // 1 minute
    maxRequests: 100,
    prefix: "rl:api",
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
    result: RateLimitResult
): void {
    headers.set("X-RateLimit-Limit", String(result.limit));
    headers.set("X-RateLimit-Remaining", String(result.remaining));
    if (result.retryAfter !== null) {
        headers.set("Retry-After", String(result.retryAfter));
    }
}

/**
 * Check if Redis rate limiting is enabled
 */
export function isRedisEnabled(): boolean {
    return USE_REDIS;
}

// Export the class for custom configurations
export { RateLimiter };
export type { RateLimitConfig, RateLimitResult };
