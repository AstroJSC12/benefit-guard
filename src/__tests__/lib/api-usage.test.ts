import { describe, expect, it } from "vitest";
import { MODEL_PRICING, estimateCost } from "@/lib/api-usage";

describe("lib/api-usage estimateCost", () => {
  it("calculates cost for gpt-4o", () => {
    const cost = estimateCost({ model: "gpt-4o", inputTokens: 1000, outputTokens: 1000 });
    expect(cost).toBe(0.02);
  });

  it("calculates cost for gpt-4o-mini", () => {
    const cost = estimateCost({ model: "gpt-4o-mini", inputTokens: 2000, outputTokens: 500 });
    expect(cost).toBe(0.0006);
  });

  it("calculates cost for whisper-1 output tokens", () => {
    const cost = estimateCost({ model: "whisper-1", outputTokens: 1000 });
    expect(cost).toBe(0.006);
  });

  it("returns 0 for unknown models", () => {
    const cost = estimateCost({ model: "unknown", inputTokens: 9999, outputTokens: 9999 });
    expect(cost).toBe(0);
  });

  it("exposes pricing table for supported models", () => {
    expect(Object.keys(MODEL_PRICING)).toEqual(expect.arrayContaining(["gpt-4o", "gpt-4o-mini", "whisper-1"]));
  });
});
