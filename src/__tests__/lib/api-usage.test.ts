import { describe, expect, it, vi } from "vitest";

// Mock prisma before importing api-usage (it imports prisma at module level)
vi.mock("@/lib/db", () => ({
  default: { apiUsage: { create: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() } },
}));

import { MODEL_PRICING, estimateCost } from "@/lib/api-usage";

describe("lib/api-usage estimateCost", () => {
  it("calculates cost for gpt-4o (returns USD cents)", () => {
    // 1000 input * 250/1M + 1000 output * 1000/1M = 0.25 + 1.0 = 1.25 cents
    const cost = estimateCost("gpt-4o", 1000, 1000);
    expect(cost).toBe(1.25);
  });

  it("calculates cost for gpt-4-turbo-preview", () => {
    // 2000 input * 1000/1M + 500 output * 3000/1M = 2.0 + 1.5 = 3.5 cents
    const cost = estimateCost("gpt-4-turbo-preview", 2000, 500);
    expect(cost).toBe(3.5);
  });

  it("calculates cost for text-embedding-ada-002", () => {
    // 10000 input * 10/1M + 0 output = 0.1 cents
    const cost = estimateCost("text-embedding-ada-002", 10000, 0);
    expect(cost).toBe(0.1);
  });

  it("returns 0 for unknown models", () => {
    const cost = estimateCost("unknown", 9999, 9999);
    expect(cost).toBe(0);
  });

  it("exposes pricing table for supported models", () => {
    expect(Object.keys(MODEL_PRICING)).toEqual(
      expect.arrayContaining(["gpt-4o", "gpt-4-turbo-preview", "whisper-1"])
    );
  });
});
