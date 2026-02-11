import { describe, expect, it, beforeEach, vi } from "vitest";
import { checkRateLimit, getRateLimitKey, applyRateLimit } from "@/lib/rate-limit";

describe("lib/rate-limit", () => {
  describe("checkRateLimit", () => {
    it("allows requests within the limit", () => {
      const key = `test-allow-${Date.now()}`;
      const result = checkRateLimit(key, "chat");

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(19); // chat tier = 20, used 1
      expect(result.retryAfterSeconds).toBe(0);
    });

    it("blocks requests exceeding the limit", () => {
      const key = `test-block-${Date.now()}`;

      // Fill up the chat limit (20 requests)
      for (let i = 0; i < 20; i++) {
        const r = checkRateLimit(key, "chat");
        expect(r.allowed).toBe(true);
      }

      // 21st request should be blocked
      const blocked = checkRateLimit(key, "chat");
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("tracks different tiers independently", () => {
      const key = `test-tiers-${Date.now()}`;

      // Fill up transcription tier (10 requests)
      for (let i = 0; i < 10; i++) {
        checkRateLimit(key, "transcription");
      }

      // Transcription should be blocked
      expect(checkRateLimit(key, "transcription").allowed).toBe(false);

      // Chat tier should still be available for the same key
      expect(checkRateLimit(key, "chat").allowed).toBe(true);
    });

    it("tracks different keys independently", () => {
      const key1 = `test-key1-${Date.now()}`;
      const key2 = `test-key2-${Date.now()}`;

      // Fill up key1's transcription limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit(key1, "transcription");
      }

      // key1 blocked, key2 still allowed
      expect(checkRateLimit(key1, "transcription").allowed).toBe(false);
      expect(checkRateLimit(key2, "transcription").allowed).toBe(true);
    });

    it("returns correct remaining count", () => {
      const key = `test-remaining-${Date.now()}`;

      const r1 = checkRateLimit(key, "transcription"); // limit 10
      expect(r1.remaining).toBe(9);

      const r2 = checkRateLimit(key, "transcription");
      expect(r2.remaining).toBe(8);

      const r3 = checkRateLimit(key, "transcription");
      expect(r3.remaining).toBe(7);
    });

    it("returns a valid resetAt timestamp in the future", () => {
      const key = `test-reset-${Date.now()}`;
      const before = Date.now();
      const result = checkRateLimit(key, "default");

      expect(result.resetAt).toBeGreaterThan(before);
    });
  });

  describe("getRateLimitKey", () => {
    it("uses userId when available", () => {
      const request = new Request("http://localhost/api/chat");
      const key = getRateLimitKey(request, "user-123");
      expect(key).toBe("user:user-123");
    });

    it("falls back to x-forwarded-for header", () => {
      const request = new Request("http://localhost/api/chat", {
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      });
      const key = getRateLimitKey(request, null);
      expect(key).toBe("ip:1.2.3.4");
    });

    it("falls back to x-real-ip header", () => {
      const request = new Request("http://localhost/api/chat", {
        headers: { "x-real-ip": "9.8.7.6" },
      });
      const key = getRateLimitKey(request, null);
      expect(key).toBe("ip:9.8.7.6");
    });

    it("falls back to unknown when no IP headers present", () => {
      const request = new Request("http://localhost/api/chat");
      const key = getRateLimitKey(request, null);
      expect(key).toBe("ip:unknown");
    });
  });

  describe("applyRateLimit", () => {
    it("returns null when request is allowed", () => {
      const request = new Request("http://localhost/api/chat");
      const key = `test-apply-${Date.now()}`;
      const result = applyRateLimit(request, key, "default");
      expect(result).toBeNull();
    });

    it("returns a 429 response when rate limited", () => {
      const userId = `test-apply-block-${Date.now()}`;
      const request = new Request("http://localhost/api/chat");

      // Fill up voice tier (10 requests)
      for (let i = 0; i < 10; i++) {
        applyRateLimit(request, userId, "voice");
      }

      const blocked = applyRateLimit(request, userId, "voice");
      expect(blocked).not.toBeNull();
      expect(blocked!.status).toBe(429);
    });

    it("includes Retry-After header when blocked", async () => {
      const userId = `test-retry-${Date.now()}`;
      const request = new Request("http://localhost/api/chat");

      // Fill up embedding tier (30 requests)
      for (let i = 0; i < 30; i++) {
        applyRateLimit(request, userId, "embedding");
      }

      const blocked = applyRateLimit(request, userId, "embedding");
      expect(blocked).not.toBeNull();
      expect(blocked!.headers.get("Retry-After")).toBeTruthy();
      expect(blocked!.headers.get("X-RateLimit-Remaining")).toBe("0");

      const body = await blocked!.json();
      expect(body.error).toContain("Too many requests");
      expect(body.retryAfterSeconds).toBeGreaterThan(0);
    });
  });
});
