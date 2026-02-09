import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: { id, userId: session.user.id },
      select: { fileName: true, fileData: true },
    });

    if (!document || !document.fileData) {
      return new Response("Document not found", { status: 404 });
    }

    return new Response(document.fileData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${document.fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("PDF serve error:", error);
    return new Response("Failed to load document", { status: 500 });
  }
}
