import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockGetServerSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/mock-session";
import { mockPrisma, resetMockPrisma } from "@/__tests__/helpers/mock-prisma";

vi.mock("next-auth", () => ({ getServerSession: mockGetServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ default: mockPrisma }));

describe("/api/providers/network-status", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetMockPrisma();
  });

  it("GET returns 401 when unauthenticated", async () => {
    mockUnauthenticatedSession();
    const { GET } = await import("@/app/api/providers/network-status/route");

    const res = await GET(new Request("http://localhost/api/providers/network-status?npis=1&insurerId=aetna") as never);

    expect(res.status).toBe(401);
  });

  it("GET returns empty statuses when NPIs are missing", async () => {
    mockAuthenticatedSession();
    const { GET } = await import("@/app/api/providers/network-status/route");

    const res = await GET(new Request("http://localhost/api/providers/network-status?insurerId=aetna") as never);

    await expect(res.json()).resolves.toEqual({ statuses: {} });
    expect(mockPrisma.networkStatus.findMany).not.toHaveBeenCalled();
  });

  it("GET returns status map for NPIs", async () => {
    mockAuthenticatedSession();
    mockPrisma.networkStatus.findMany.mockResolvedValue([
      { npi: "111", status: "in_network", source: "user_verified", updatedAt: new Date("2025-01-01T00:00:00.000Z") },
    ]);
    const { GET } = await import("@/app/api/providers/network-status/route");

    const res = await GET(new Request("http://localhost/api/providers/network-status?npis=111,222&insurerId=aetna") as never);
    const body = await res.json();

    expect(mockPrisma.networkStatus.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { npi: { in: ["111", "222"] }, insurerId: "aetna" } })
    );
    expect(body.statuses["111"].status).toBe("in_network");
  });

  it("POST validates required fields", async () => {
    mockAuthenticatedSession();
    const { POST } = await import("@/app/api/providers/network-status/route");

    const res = await POST(
      new Request("http://localhost/api/providers/network-status", {
        method: "POST",
        body: JSON.stringify({ npi: "", insurerId: "", status: "invalid" }),
      }) as never
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Missing or invalid fields: npi, insurerId, status" });
  });

  it("POST upserts and returns normalized response", async () => {
    mockAuthenticatedSession({ id: "user-55" });
    mockPrisma.networkStatus.upsert.mockResolvedValue({
      npi: "999",
      insurerId: "aetna",
      status: "in_network",
      source: "user_verified",
      updatedAt: new Date("2025-02-02T00:00:00.000Z"),
    });

    const { POST } = await import("@/app/api/providers/network-status/route");

    const res = await POST(
      new Request("http://localhost/api/providers/network-status", {
        method: "POST",
        body: JSON.stringify({ npi: "999", insurerId: "aetna", status: "in_network" }),
      }) as never
    );

    const body = await res.json();
    expect(mockPrisma.networkStatus.upsert).toHaveBeenCalled();
    expect(body.success).toBe(true);
    expect(body.record.updatedAt).toBe("2025-02-02T00:00:00.000Z");
  });
});
