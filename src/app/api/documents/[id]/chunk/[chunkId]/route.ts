import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chunkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id: documentId, chunkId } = await params;

    // Verify document belongs to user
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: session.user.id },
      select: { fileName: true },
    });

    if (!document) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chunks = await prisma.$queryRaw<{ content: string }[]>`
      SELECT content FROM "DocumentChunk" WHERE id = ${chunkId} AND "documentId" = ${documentId} LIMIT 1
    `;

    if (chunks.length === 0) {
      return new Response(JSON.stringify({ error: "Chunk not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        content: chunks[0].content,
        fileName: document.fileName,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chunk fetch error:", error);
    return new Response(JSON.stringify({ error: "Failed to load chunk" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
