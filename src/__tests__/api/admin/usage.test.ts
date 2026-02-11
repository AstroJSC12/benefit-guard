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
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  it("returns 401 when unauthenticated", async () => {
    mockUnauthenticatedSession();
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage") as never);

    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin users", async () => {
    mockAuthenticatedSession({ email: "user@example.com" });
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage") as never);

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: "Forbidden" });
  });

  it("defaults range to 7 when range query is invalid", async () => {
    mockAuthenticatedSession({ email: "admin@example.com" });
    mockPrisma.$queryRaw.mockResolvedValue([]);
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage?range=abc") as never);
    const body = await res.json();

    expect(body.rangeDays).toBe(7);
  });

  it("accepts valid range parameter", async () => {
    mockAuthenticatedSession({ email: "admin@example.com" });
    mockPrisma.$queryRaw.mockResolvedValue([{ model: "gpt-4o", tokens: "2000", cost_cents: "3.5" }]);
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage?range=30") as never);
    const body = await res.json();

    expect(body.rangeDays).toBe(30);
    expect(body.usage).toHaveLength(1);
  });

  it("returns 500 when query fails", async () => {
    mockAuthenticatedSession({ email: "admin@example.com" });
    mockPrisma.$queryRaw.mockRejectedValue(new Error("db fail"));
    const { GET } = await import("@/app/api/admin/usage/route");

    const res = await GET(new Request("http://localhost/api/admin/usage") as never);

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Failed to load usage" });
  });
});
