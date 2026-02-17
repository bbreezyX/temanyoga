import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * Pre-configured rate limiters for different endpoint tiers.
 * Uses Upstash Redis sliding window — works correctly across
 * serverless function instances (e.g. Vercel, Cloudflare).
 */
export const rateLimiters = {
  /** General public endpoints — 10 requests per 60 s */
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
    prefix: "ratelimit:standard",
    timeout: 1000,
  }),

  /** Sensitive endpoints (file uploads, reviews) — 5 requests per 60 s */
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "ratelimit:strict",
    timeout: 1000,
  }),
};

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}
