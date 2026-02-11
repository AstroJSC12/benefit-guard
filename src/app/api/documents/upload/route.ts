import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { processDocument, detectDocumentType } from "@/lib/documents";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blocked = applyRateLimit(request, session.user.id, "default");
    if (blocked) return blocked;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const fileType = detectDocumentType(file.name);

    const buffer = Buffer.from(await file.arrayBuffer());

    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileType,
        fileData: buffer,
        status: "pending",
      },
    });

    // Process synchronously — keeps the serverless function alive until done.
    // With batch embeddings this typically takes 2-5 seconds.
    let processingErrorMsg: string | undefined;
    try {
      await processDocument(document.id, buffer);
    } catch (processingError) {
      console.error("Document processing error:", processingError);
      processingErrorMsg = processingError instanceof Error 
        ? processingError.message 
        : String(processingError);
    }

    // Re-fetch to get the final status (completed or error)
    const updated = await prisma.document.findUnique({
      where: { id: document.id },
      select: { id: true, fileName: true, fileType: true, status: true },
    });

    return NextResponse.json({
      ...(updated || {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        status: "error",
      }),
      ...(processingErrorMsg && { errorMessage: processingErrorMsg }),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload document" },
      { status: 500 }
    );
  }
}
