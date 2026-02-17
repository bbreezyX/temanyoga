import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Login rate limiter: 5 attempts per 15 minutes per email
const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "ratelimit:login",
  timeout: 1000,
});

// Track failed attempts for additional security
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const FAILED_ATTEMPTS_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

function getFailedAttemptsKey(email: string, ip?: string): string {
  return `${email}:${ip || "unknown"}`;
}

function isLockedOut(email: string, ip?: string): boolean {
  const key = getFailedAttemptsKey(email, ip);
  const attempts = failedAttempts.get(key);
  
  if (!attempts) return false;
  
  // Reset if window has passed
  if (Date.now() - attempts.lastAttempt > FAILED_ATTEMPTS_WINDOW) {
    failedAttempts.delete(key);
    return false;
  }
  
  return attempts.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(email: string, ip?: string): void {
  const key = getFailedAttemptsKey(email, ip);
  const attempts = failedAttempts.get(key);
  
  if (attempts) {
    attempts.count++;
    attempts.lastAttempt = Date.now();
  } else {
    failedAttempts.set(key, { count: 1, lastAttempt: Date.now() });
  }
}

function clearFailedAttempts(email: string, ip?: string): void {
  const key = getFailedAttemptsKey(email, ip);
  failedAttempts.delete(key);
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, attempts] of failedAttempts.entries()) {
    if (now - attempts.lastAttempt > FAILED_ATTEMPTS_WINDOW) {
      failedAttempts.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        
        // Get client IP for rate limiting
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
        
        // Check Upstash rate limit
        const rateLimitKey = `${email}:${ip}`;
        const { success } = await loginRateLimit.limit(rateLimitKey);
        
        if (!success) {
          console.warn(`[Auth] Rate limited login attempt for ${email} from ${ip}`);
          return null;
        }
        
        // Check local failed attempts lockout
        if (isLockedOut(email, ip)) {
          console.warn(`[Auth] Locked out login attempt for ${email} from ${ip}`);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          recordFailedAttempt(email, ip);
          return null;
        }

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.password
        );
        
        if (!isValid) {
          recordFailedAttempt(email, ip);
          console.warn(`[Auth] Failed login for ${email} from ${ip}`);
          return null;
        }

        // Clear failed attempts on successful login
        clearFailedAttempts(email, ip);
        
        console.log(`[Auth] Successful login for ${email} from ${ip}`);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
