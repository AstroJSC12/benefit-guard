import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAuthenticatedSession,
  mockGetServerSession,
  mockUnauthenticatedSession,
} from "@/__tests__/helpers/mock-session";

const createTranscription = vi.fn();

vi.mock("next-auth", () => ({ getServerSession: mockGetServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/openai", () => ({
  openai: {
    audio: {
      transcriptions: {
        create: createTranscription,
      },
    },
  },
}));

describe("POST /api/transcribe", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns 401 for unauthenticated users", async () => {
    mockUnauthenticatedSession();
    const { POST } = await import("@/app/api/transcribe/route");

    const res = await POST(new Request("http://localhost/api/transcribe", { method: "POST" }) as never);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 400 when audio file is missing", async () => {
    mockAuthenticatedSession();
    const { POST } = await import("@/app/api/transcribe/route");

    const req = new Request("http://localhost/api/transcribe", {
      method: "POST",
      body: new FormData(),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "No audio file provided" });
  });

  it("returns transcription text on success", async () => {
    mockAuthenticatedSession();
    createTranscription.mockResolvedValue({ text: "hello world" });
    const { POST } = await import("@/app/api/transcribe/route");

    const form = new FormData();
    form.set("audio", new File(["audio-content"], "clip.wav", { type: "audio/wav" }));

    const res = await POST(new Request("http://localhost/api/transcribe", { method: "POST", body: form }) as never);

    expect(createTranscription).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ text: "hello world" });
  });

  it("passes model and language options to OpenAI", async () => {
    mockAuthenticatedSession();
    createTranscription.mockResolvedValue({ text: "ok" });
    const { POST } = await import("@/app/api/transcribe/route");

    const form = new FormData();
    form.set("audio", new File(["a"], "clip.mp3", { type: "audio/mpeg" }));
    await POST(new Request("http://localhost/api/transcribe", { method: "POST", body: form }) as never);

    expect(createTranscription).toHaveBeenCalledWith(
      expect.objectContaining({ model: "whisper-1", language: "en" })
    );
  });

  it("returns 500 when OpenAI transcription throws", async () => {
    mockAuthenticatedSession();
    createTranscription.mockRejectedValue(new Error("upstream failure"));
    const { POST } = await import("@/app/api/transcribe/route");

    const form = new FormData();
    form.set("audio", new File(["a"], "clip.mp3", { type: "audio/mpeg" }));

    const res = await POST(new Request("http://localhost/api/transcribe", { method: "POST", body: form }) as never);

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: "Failed to transcribe audio" });
  });
});
