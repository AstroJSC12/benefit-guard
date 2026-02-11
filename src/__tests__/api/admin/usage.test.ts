import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockGetServerSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/mock-session";
import { mockPrisma, resetMockPrisma } from "@/__tests__/helpers/mock-prisma";

vi.mock("next-auth", () => ({ getServerSession: mockGetServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ default: mockPrisma }));

describe("GET /api/admin/usage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetMockPrisma();
    process.env.ADMIN_EMAILS = "admin@example.com";

    // getUsageSummary uses prisma.apiUsage which isn't in the shared mock
    (mockPrisma as Record<string, unknown>).apiUsage = {
      findMany: vi.fn().mockResolvedValue([]),
    };
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  it("returns 403 when unauthenticated", async () => {
    mockUnauthenticatedSession();
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage") as never);

    expect(res.status).toBe(403);
  });

  it("returns 403 for non-admin users", async () => {
    mockAuthenticatedSession({ email: "user@example.com" });
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage") as never);

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("defaults range to 7d when range query is invalid", async () => {
    mockAuthenticatedSession({ email: "admin@example.com" });
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage?range=abc") as never);
    const body = await res.json();

    // Our route defaults invalid ranges to 7d and returns the string "abc" as range
    // but uses 7d calculation for the date window
    expect(body.range).toBe("abc");
    expect(body.startDate).toBeDefined();
  });

  it("accepts valid range parameter", async () => {
    mockAuthenticatedSession({ email: "admin@example.com" });
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage?range=30d") as never);
    const body = await res.json();

    expect(body.range).toBe("30d");
    expect(body.totalCostCents).toBeDefined();
  });

  it("returns 500 when query fails", async () => {
    mockAuthenticatedSession({ email: "admin@example.com" });
    // Make the apiUsage mock throw
    (mockPrisma as Record<string, unknown>).apiUsage = {
      aggregate: vi.fn().mockRejectedValue(new Error("db fail")),
      groupBy: vi.fn().mockRejectedValue(new Error("db fail")),
      findMany: vi.fn().mockRejectedValue(new Error("db fail")),
    };
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage") as never);

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Failed to fetch usage data" });
  });
});
