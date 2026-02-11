import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockGetServerSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/mock-session";

const findNearbyProviders = vi.fn();

vi.mock("next-auth", () => ({ getServerSession: mockGetServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/providers", () => ({ findNearbyProviders }));

describe("GET /api/providers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated users", async () => {
    mockUnauthenticatedSession();
    const { GET } = await import("@/app/api/providers/route");

    const res = await GET(new Request("http://localhost/api/providers") as never);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("handles missing location param by falling back to session zip code", async () => {
    mockAuthenticatedSession({ zipCode: "10001" });
    findNearbyProviders.mockResolvedValue([]);
    const { GET } = await import("@/app/api/providers/route");

    const res = await GET(new Request("http://localhost/api/providers") as never);

    expect(findNearbyProviders).toHaveBeenCalledWith("10001", undefined);
    await expect(res.json()).resolves.toEqual({ providers: [], location: "10001" });
  });

  it("supports valid zip code location", async () => {
    mockAuthenticatedSession();
    findNearbyProviders.mockResolvedValue([{ npi: "123" }]);
    const { GET } = await import("@/app/api/providers/route");

    const res = await GET(new Request("http://localhost/api/providers?location=30301") as never);

    expect(findNearbyProviders).toHaveBeenCalledWith("30301", undefined);
    await expect(res.json()).resolves.toEqual({ providers: [{ npi: "123" }], location: "30301" });
  });

  it("supports valid address with provider type", async () => {
    mockAuthenticatedSession();
    findNearbyProviders.mockResolvedValue([{ npi: "999" }]);
    const { GET } = await import("@/app/api/providers/route");

    const res = await GET(
      new Request("http://localhost/api/providers?location=1%20Market%20St%20San%20Francisco%20CA&type=hospital") as never
    );

    expect(findNearbyProviders).toHaveBeenCalledWith("1 Market St San Francisco CA", "hospital");
    expect(res.status).toBe(200);
  });

  it("returns 500 when provider lookup fails", async () => {
    mockAuthenticatedSession();
    findNearbyProviders.mockRejectedValue(new Error("network issue"));
    const { GET } = await import("@/app/api/providers/route");

    const res = await GET(new Request("http://localhost/api/providers?location=94105") as never);

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Failed to search providers" });
  });
});
