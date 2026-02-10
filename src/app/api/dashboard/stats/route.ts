import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Run all queries in parallel for speed
    const [documents, conversations, recentConversations] = await Promise.all([
      prisma.document.findMany({
        where: { userId },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.conversation.count({
        where: { userId, archived: false },
      }),
      prisma.conversation.findMany({
        where: { userId, archived: false },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          updatedAt: true,
          _count: { select: { messages: true } },
        },
      }),
    ]);

    const processedDocs = documents.filter((d) => d.status === "completed");

    return NextResponse.json({
      user: {
        name: session.user.name,
        state: session.user.state,
        zipCode: session.user.zipCode,
      },
      stats: {
        totalDocuments: documents.length,
        processedDocuments: processedDocs.length,
        totalConversations: conversations,
      },
      documents: documents.slice(0, 5).map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
        fileType: doc.fileType,
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
      })),
      recentConversations: recentConversations.map((c) => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt.toISOString(),
        messageCount: c._count.messages,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
