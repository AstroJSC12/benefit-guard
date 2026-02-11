import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { logApiUsage } from "@/lib/api-usage";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blocked = applyRateLimit(request, session.user.id, "transcription");
    if (blocked) return blocked;

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    logApiUsage({
      endpoint: "transcription",
      model: "whisper-1",
      inputTokens: Math.ceil(transcription.text.length / 4), // rough token estimate
      durationMs: Date.now() - startTime,
      userId: session.user.id,
      metadata: { audioSizeBytes: audioFile.size },
    }).catch(() => {});

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
