import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = await params;

    // Verify the document belongs to this user
    const document = await prisma.document.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!document) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete chunks first (foreign key constraint), then the document
    await prisma.$executeRaw`DELETE FROM "DocumentChunk" WHERE "documentId" = ${id}`;
    await prisma.document.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete document" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
