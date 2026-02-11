import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      newUsers7d,
      newUsers30d,
      totalConversations,
      totalMessages,
      totalDocuments,
      totalDocumentChunks,
      totalKnowledgeBaseEntries,
      recentUsers,
      mostActiveUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.document.count(),
      prisma.documentChunk.count(),
      prisma.knowledgeBase.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          email: true,
          state: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        select: {
          email: true,
          conversations: {
            select: {
              _count: {
                select: {
                  messages: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const averageMessagesPerConversation =
      totalConversations === 0 ? 0 : totalMessages / totalConversations;

    const topActiveUsers = mostActiveUsers
      .map((user) => ({
        email: user.email,
        count: user.conversations.reduce(
          (sum, conversation) => sum + conversation._count.messages,
          0
        ),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      totals: {
        users: totalUsers,
        conversations: totalConversations,
        messages: totalMessages,
        documents: totalDocuments,
        documentChunks: totalDocumentChunks,
        knowledgeBaseEntries: totalKnowledgeBaseEntries,
      },
      newUsers: {
        last7Days: newUsers7d,
        last30Days: newUsers30d,
      },
      averages: {
        messagesPerConversation: Number(averageMessagesPerConversation.toFixed(2)),
      },
      mostActiveUsers: topActiveUsers,
      recentUsers: recentUsers.map((user) => ({
        email: user.email,
        state: user.state,
        createdAt: user.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin metrics error:", error);
    return NextResponse.json(
      { error: "Failed to load admin metrics" },
      { status: 500 }
    );
  }
}
