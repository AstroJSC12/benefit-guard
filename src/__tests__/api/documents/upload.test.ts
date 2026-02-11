import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockGetServerSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/mock-session";
import { mockPrisma, resetMockPrisma } from "@/__tests__/helpers/mock-prisma";

const processDocument = vi.fn();
const detectDocumentType = vi.fn(() => "policy");

vi.mock("next-auth", () => ({ getServerSession: mockGetServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({ default: mockPrisma }));
vi.mock("@/lib/documents", () => ({ processDocument, detectDocumentType }));

describe("POST /api/documents/upload", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetMockPrisma();
    mockPrisma.document.create.mockResolvedValue({ id: "doc-1", fileName: "policy.pdf", fileType: "policy" });
    mockPrisma.document.findUnique.mockResolvedValue({ id: "doc-1", fileName: "policy.pdf", fileType: "policy", status: "completed" });
  });

  it("returns 401 for unauthenticated users", async () => {
    mockUnauthenticatedSession();
    const { POST } = await import("@/app/api/documents/upload/route");

    const res = await POST(new Request("http://localhost/api/documents/upload", { method: "POST", body: new FormData() }) as never);

    expect(res.status).toBe(401);
  });

  it("returns 400 when file is missing", async () => {
    mockAuthenticatedSession();
    const { POST } = await import("@/app/api/documents/upload/route");

    const res = await POST(new Request("http://localhost/api/documents/upload", { method: "POST", body: new FormData() }) as never);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "No file provided" });
  });

  it("returns 400 for unsupported file type", async () => {
    mockAuthenticatedSession();
    const { POST } = await import("@/app/api/documents/upload/route");

    const form = new FormData();
    form.set("file", new File(["plain"], "notes.txt", { type: "text/plain" }));

    const res = await POST(new Request("http://localhost/api/documents/upload", { method: "POST", body: form }) as never);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Only PDF files are supported" });
  });

  it("returns 400 when PDF exceeds size limit", async () => {
    mockAuthenticatedSession();
    const { POST } = await import("@/app/api/documents/upload/route");

    const oversizedBytes = new Uint8Array(10 * 1024 * 1024 + 1);
    const form = new FormData();
    form.set("file", new File([oversizedBytes], "large.pdf", { type: "application/pdf" }));

    const res = await POST(new Request("http://localhost/api/documents/upload", { method: "POST", body: form }) as never);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "File is too large. Maximum size is 10MB" });
  });

  it("uploads and processes valid PDF successfully", async () => {
    mockAuthenticatedSession({ id: "user-77" });
    const { POST } = await import("@/app/api/documents/upload/route");

    const form = new FormData();
    form.set("file", new File([new Uint8Array([1, 2, 3])], "policy.pdf", { type: "application/pdf" }));

    const res = await POST(new Request("http://localhost/api/documents/upload", { method: "POST", body: form }) as never);

    expect(detectDocumentType).toHaveBeenCalledWith("policy.pdf");
    expect(processDocument).toHaveBeenCalledWith("doc-1", expect.any(Buffer));
    expect(mockPrisma.document.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-77", fileName: "policy.pdf" }) })
    );
    expect(res.status).toBe(200);
  });
});
