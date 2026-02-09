import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { detectInsurer } from "@/lib/insurer-directories";

/**
 * GET /api/user/insurer
 *
 * Detects the user's health insurer by scanning their uploaded
 * document text for known insurer keywords. Returns the insurer
 * name and provider finder URL if detected.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the raw text from all completed user documents
    const documents = await prisma.document.findMany({
      where: { userId: session.user.id, status: "completed" },
      select: { rawText: true, fileName: true },
    });

    if (documents.length === 0) {
      return NextResponse.json({ insurer: null, reason: "no_documents" });
    }

    const texts = documents
      .map((d) => `${d.fileName} ${d.rawText || ""}`)
      .filter((t) => t.length > 0);

    const insurer = detectInsurer(texts);

    if (!insurer) {
      return NextResponse.json({ insurer: null, reason: "not_detected" });
    }

    return NextResponse.json({
      insurer: {
        id: insurer.id,
        name: insurer.name,
        finderUrl: insurer.finderUrl,
      },
    });
  } catch (error) {
    console.error("Insurer detection error:", error);
    return NextResponse.json(
      { error: "Failed to detect insurer" },
      { status: 500 }
    );
  }
}
