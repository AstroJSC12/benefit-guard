import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { processDocument, detectDocumentType } from "@/lib/documents";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // after() keeps the serverless function alive after the response is sent.
    // Without this, Vercel freezes the function immediately and processDocument
    // never completes. This is the Next.js-recommended pattern for background work.
    after(async () => {
      try {
        await processDocument(document.id, buffer);
      } catch (error) {
        console.error("Background processing error:", error);
      }
    });

    return NextResponse.json({
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      status: document.status,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
