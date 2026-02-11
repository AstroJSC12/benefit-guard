import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockGetServerSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/mock-session";
import { mockPrisma, resetMockPrisma } from "@/__tests__/helpers/mock-prisma";

vi.mock("next-auth", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  default: mockPrisma,
}));

vi.mock("@/lib/openai", () => ({
  SYSTEM_PROMPT: "System Prompt",
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/rag", () => ({
  retrieveContext: vi.fn(),
  buildContextPrompt: vi.fn().mockReturnValue(""),
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetMockPrisma();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockUnauthenticatedSession();
    const { POST } = await import("@/app/api/chat/route");

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "hello", conversationId: "conv-1" }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Please sign in to continue" });
  });

  it("returns 400 for empty message without image", async () => {
    mockAuthenticatedSession();
    const { POST } = await import("@/app/api/chat/route");

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "    ", conversationId: "conv-1" }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Please enter a message" });
  });

  it("returns 400 for messages longer than 10000 characters", async () => {
    mockAuthenticatedSession();
    const { POST } = await import("@/app/api/chat/route");

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "a".repeat(10001), conversationId: "conv-1" }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Message is too long. Please shorten your message.",
    });
  });

  it("returns 400 for invalid image data URI", async () => {
    mockAuthenticatedSession();
    const { POST } = await import("@/app/api/chat/route");

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "review this",
        image: "https://example.com/file.png",
        conversationId: "conv-1",
      }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Invalid image format. Please try a different image.",
    });
  });

  it("returns 404 when conversation does not belong to the user", async () => {
    mockAuthenticatedSession({ id: "user-1" });
    mockPrisma.conversation.findFirst.mockResolvedValue(null);

    const { POST } = await import("@/app/api/chat/route");

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "help", conversationId: "conv-1" }),
    });

    const res = await POST(req as never);

    expect(mockPrisma.conversation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "conv-1", userId: "user-1" } })
    );
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: "This conversation no longer exists. Please start a new chat.",
    });
  });
});
