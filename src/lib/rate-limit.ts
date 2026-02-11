/**
 * In-Memory Sliding Window Rate Limiter
 *
 * Tracks request timestamps per key (userId or IP) and enforces
 * limits within a sliding time window.
 *
 * Limits are applied per-route with different tiers:
 * - chat:          20 requests per minute (OpenAI streaming, most expensive)
 * - transcription: 10 requests per minute (Whisper API)
 * - voice:         10 requests per minute (Twilio + OpenAI)
 * - embedding:     30 requests per minute (cheaper, batch operations)
 * - default:       60 requests per minute (general API routes)
 *
 * Production upgrade path:
 * Replace the in-memory store with Upstash Redis (@upstash/ratelimit)
 * for distributed rate limiting across serverless instances.
 * Free tier: 10,000 commands/day — more than enough for early production.
 */

import { NextResponse } from "next/server";

// --- Types ---

type RateLimitTier = "chat" | "transcription" | "voice" | "embedding" | "default";

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Total limit for this tier */
  limit: number;
  /** Unix timestamp (ms) when the window resets */
  resetAt: number;
  /** Seconds until the caller can retry (only set when blocked) */
  retryAfterSeconds: number;
}

// --- Configuration ---

const TIER_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
  chat:          { maxRequests: 20, windowMs: 60_000 },
  transcription: { maxRequests: 10, windowMs: 60_000 },
  voice:         { maxRequests: 10, windowMs: 60_000 },
  embedding:     { maxRequests: 30, windowMs: 60_000 },
  default:       { maxRequests: 60, windowMs: 60_000 },
};

// --- In-Memory Store ---

/**
 * Map of "tier:key" → array of request timestamps (ms).
 * Each entry tracks when requests were made within the sliding window.
 *
 * In production, replace this with Upstash Redis for distributed state.
 */
const requestStore = new Map<string, number[]>();

/**
 * Maximum number of unique keys to track before evicting the oldest entries.
 * Prevents unbounded memory growth from many unique IPs/users.
 */
const MAX_STORE_KEYS = 10_000;

/**
 * Evict stale entries periodically. Runs every 60 seconds.
 * Removes entries whose timestamps are all outside the window.
 */
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function cleanupStore() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  // Find the largest window so we don't accidentally evict entries
  // that are still relevant to a slower tier
  const maxWindow = Math.max(...Object.values(TIER_CONFIGS).map((c) => c.windowMs));

  for (const [key, timestamps] of requestStore.entries()) {
    // Remove timestamps outside the largest window
    const cutoff = now - maxWindow;
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) {
      requestStore.delete(key);
    } else {
      requestStore.set(key, filtered);
    }
  }

  // If still too many keys, evict oldest by earliest timestamp
  if (requestStore.size > MAX_STORE_KEYS) {
    const entries = [...requestStore.entries()]
      .map(([key, ts]) => ({ key, earliest: Math.min(...ts) }))
      .sort((a, b) => a.earliest - b.earliest);

    const toRemove = entries.slice(0, requestStore.size - MAX_STORE_KEYS);
    for (const { key } of toRemove) {
      requestStore.delete(key);
    }
  }
}

// --- Core Rate Limit Check ---

/**
 * Check whether a request is allowed under the given tier's rate limit.
 *
 * @param key   - Unique identifier for the requester (userId or IP address)
 * @param tier  - Rate limit tier (determines max requests and window)
 * @returns     - RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(key: string, tier: RateLimitTier = "default"): RateLimitResult {
  cleanupStore();

  const config = TIER_CONFIGS[tier];
  const storeKey = `${tier}:${key}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get existing timestamps and filter to current window
  const timestamps = (requestStore.get(storeKey) || []).filter((t) => t > windowStart);

  if (timestamps.length >= config.maxRequests) {
    // Rate limited — find when the earliest request in the window expires
    const oldestInWindow = Math.min(...timestamps);
    const resetAt = oldestInWindow + config.windowMs;
    const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);

    // Update store with filtered timestamps (don't add new one)
    requestStore.set(storeKey, timestamps);

    return {
      allowed: false,
      remaining: 0,
      limit: config.maxRequests,
      resetAt,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  // Allowed — record this request
  timestamps.push(now);
  requestStore.set(storeKey, timestamps);

  return {
    allowed: true,
    remaining: config.maxRequests - timestamps.length,
    limit: config.maxRequests,
    resetAt: now + config.windowMs,
    retryAfterSeconds: 0,
  };
}

// --- Response Helpers ---

/**
 * Build a standardized 429 Too Many Requests response.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down and try again shortly.",
      retryAfterSeconds: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: rateLimitHeaders(result),
    }
  );
}

/**
 * Build standard rate limit headers for any response.
 * Attach these to successful responses too so clients can track their usage.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfterSeconds > 0
      ? { "Retry-After": String(result.retryAfterSeconds) }
      : {}),
  };
}

/**
 * Extract the best available identifier for rate limiting.
 * Prefers authenticated userId, falls back to IP address.
 */
export function getRateLimitKey(
  request: Request,
  userId?: string | null
): string {
  if (userId) return `user:${userId}`;

  // Try standard proxy headers for IP
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return `ip:${forwarded.split(",")[0].trim()}`;

  const realIp = headers.get("x-real-ip");
  if (realIp) return `ip:${realIp}`;

  // Fallback — this shouldn't happen in production behind a proxy
  return "ip:unknown";
}

// --- Convenience Wrapper ---

/**
 * One-liner rate limit check for route handlers.
 * Returns null if allowed, or a 429 Response if blocked.
 *
 * Usage in a route handler:
 * ```
 * const blocked = applyRateLimit(request, session?.user?.id, "chat");
 * if (blocked) return blocked;
 * ```
 */
export function applyRateLimit(
  request: Request,
  userId: string | null | undefined,
  tier: RateLimitTier = "default"
): NextResponse | null {
  const key = getRateLimitKey(request, userId);
  const result = checkRateLimit(key, tier);

  if (!result.allowed) {
    console.warn(
      `[rate-limit] Blocked ${tier} request for ${key} — ` +
      `${result.limit}/${result.limit} used, retry in ${result.retryAfterSeconds}s`
    );
    return rateLimitResponse(result);
  }

  return null;
}
