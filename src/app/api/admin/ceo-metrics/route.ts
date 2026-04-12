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

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // ── Parallel DB queries ──
    const [
      totalUsers,
      newUsers7d,
      newUsers30d,
      newUsers30to60d,
      totalConversations,
      totalMessages,
      totalDocuments,
      totalKbEntries,
      totalNetworkStatuses,
      totalLeads,
      leadsBySource,
      recentUsers,
      messageFeedback,
      recentNegativeFeedback,
      dailySignups,
      dailyMessages,
      apiUsage30d,
      activeUsersToday,
      activeUsers7d,
      activeUsers30d,
      dbHealthCheck,
      conversationsWithMessages,
    ] = await Promise.all([
      // User totals
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),

      // Content totals
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.document.count(),
      prisma.knowledgeBase.count(),
      prisma.networkStatus.count(),

      // Leads
      prisma.leadCapture.count(),
      prisma.leadCapture.groupBy({
        by: ["source"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Recent users
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          email: true,
          name: true,
          state: true,
          createdAt: true,
          _count: { select: { conversations: true, documents: true } },
        },
      }),

      // Bot quality — feedback (raw SQL because Prisma types may not expose feedback)
      prisma.$queryRaw<{ feedback: string; count: bigint }[]>`
        SELECT feedback, COUNT(*)::bigint as count
        FROM "Message"
        WHERE feedback IS NOT NULL
        GROUP BY feedback
      `,

      // Recent negative feedback with conversation context
      prisma.$queryRaw<{
        id: string;
        content: string;
        createdAt: Date;
        conversationId: string;
        conversationTitle: string;
        userEmail: string;
      }[]>`
        SELECT m.id, m.content, m."createdAt",
               c.id as "conversationId", c.title as "conversationTitle",
               u.email as "userEmail"
        FROM "Message" m
        JOIN "Conversation" c ON m."conversationId" = c.id
        JOIN "User" u ON c."userId" = u.id
        WHERE m.feedback = 'negative'
        ORDER BY m."createdAt" DESC
        LIMIT 10
      `,

      // Daily signups (last 30d) — raw SQL for date grouping
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
        FROM "User"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // Daily messages (last 30d)
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
        FROM "Message"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // API usage last 30d
      prisma.apiUsage.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: {
          estimatedCost: true,
          totalTokens: true,
          endpoint: true,
          createdAt: true,
        },
      }),

      // Active users (distinct users with messages today)
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT c."userId")::bigint as count
        FROM "Message" m
        JOIN "Conversation" c ON m."conversationId" = c.id
        WHERE m."createdAt" >= ${todayStart}
          AND m.role = 'user'
      `,

      // Active users (7d)
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT c."userId")::bigint as count
        FROM "Message" m
        JOIN "Conversation" c ON m."conversationId" = c.id
        WHERE m."createdAt" >= ${sevenDaysAgo}
          AND m.role = 'user'
      `,

      // Active users (30d) — MAU
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT c."userId")::bigint as count
        FROM "Message" m
        JOIN "Conversation" c ON m."conversationId" = c.id
        WHERE m."createdAt" >= ${thirtyDaysAgo}
          AND m.role = 'user'
      `,

      // DB health
      prisma.$queryRaw`SELECT 1`.then(() => "connected" as const).catch(() => "disconnected" as const),

      // Avg messages per conversation
      prisma.conversation.findMany({
        select: { _count: { select: { messages: true } } },
        where: { messages: { some: {} } },
      }),
    ]);

    // ── Derived metrics ──

    // User growth rate (30d vs prior 30d)
    const userGrowthRate =
      newUsers30to60d > 0
        ? ((newUsers30d - newUsers30to60d) / newUsers30to60d) * 100
        : newUsers30d > 0
        ? 100
        : 0;

    // Active user counts
    const dau = Number(activeUsersToday[0]?.count ?? 0);
    const wau = Number(activeUsers7d[0]?.count ?? 0);
    const mau = Number(activeUsers30d[0]?.count ?? 0);

    // Avg messages per conversation
    const avgMsgsPerConvo =
      conversationsWithMessages.length > 0
        ? conversationsWithMessages.reduce((sum, c) => sum + c._count.messages, 0) /
          conversationsWithMessages.length
        : 0;

    // Bot quality score
    const feedbackMap: Record<string, number> = {};
    for (const fb of messageFeedback) {
      if (fb.feedback) feedbackMap[fb.feedback] = Number(fb.count);
    }
    const positiveFeedback = feedbackMap["positive"] ?? 0;
    const negativeFeedback = feedbackMap["negative"] ?? 0;
    const totalFeedback = positiveFeedback + negativeFeedback;
    const botQualityScore =
      totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : null;

    // AI cost aggregation
    let totalCostCents30d = 0;
    let totalTokens30d = 0;
    const costByDay: Record<string, { cost: number; calls: number }> = {};
    const costByEndpoint: Record<string, number> = {};

    for (const record of apiUsage30d) {
      totalCostCents30d += record.estimatedCost;
      totalTokens30d += record.totalTokens;

      const dateKey = record.createdAt.toISOString().split("T")[0];
      if (!costByDay[dateKey]) costByDay[dateKey] = { cost: 0, calls: 0 };
      costByDay[dateKey].cost += record.estimatedCost;
      costByDay[dateKey].calls += 1;

      if (!costByEndpoint[record.endpoint]) costByEndpoint[record.endpoint] = 0;
      costByEndpoint[record.endpoint] += record.estimatedCost;
    }

    const costPerUser =
      totalUsers > 0 ? totalCostCents30d / totalUsers : 0;

    // Daily cost trend (fill gaps)
    const dailyCosts: { date: string; costCents: number; calls: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyCosts.push({
        date: key,
        costCents: costByDay[key]?.cost ?? 0,
        calls: costByDay[key]?.calls ?? 0,
      });
    }

    // Daily signups trend (fill gaps)
    const signupMap: Record<string, number> = {};
    for (const row of dailySignups) {
      const key = typeof row.date === "string" ? row.date : new Date(row.date).toISOString().split("T")[0];
      signupMap[key] = Number(row.count);
    }
    const dailySignupTrend: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailySignupTrend.push({ date: key, count: signupMap[key] ?? 0 });
    }

    // Daily messages trend (fill gaps)
    const msgMap: Record<string, number> = {};
    for (const row of dailyMessages) {
      const key = typeof row.date === "string" ? row.date : new Date(row.date).toISOString().split("T")[0];
      msgMap[key] = Number(row.count);
    }
    const dailyMessageTrend: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMessageTrend.push({ date: key, count: msgMap[key] ?? 0 });
    }

    // Lead conversion
    const leadEmails = await prisma.leadCapture.findMany({
      select: { email: true },
      distinct: ["email"],
    });
    const leadEmailSet = new Set(leadEmails.map((l) => l.email.toLowerCase()));
    const convertedUsers = await prisma.user.findMany({
      where: { email: { in: Array.from(leadEmailSet) } },
      select: { email: true },
    });
    const leadConversionRate =
      leadEmailSet.size > 0
        ? (convertedUsers.length / leadEmailSet.size) * 100
        : 0;

    return NextResponse.json({
      // ── KPIs ──
      kpis: {
        totalUsers,
        newUsers7d,
        newUsers30d,
        userGrowthRate: Number(userGrowthRate.toFixed(1)),
        dau,
        wau,
        mau,
        totalConversations,
        totalMessages,
        avgMessagesPerConversation: Number(avgMsgsPerConvo.toFixed(1)),
        totalDocuments,
        totalKbEntries,
        totalNetworkStatuses,
      },

      // ── AI Costs ──
      costs: {
        totalCostDollars30d: Number((totalCostCents30d / 100).toFixed(4)),
        totalTokens30d,
        totalApiCalls30d: apiUsage30d.length,
        costPerUserCents: Number(costPerUser.toFixed(2)),
        dailyBudgetCents: Number(
          process.env.OPENAI_DAILY_ALERT_THRESHOLD_CENTS || "200"
        ),
        byEndpoint: Object.fromEntries(
          Object.entries(costByEndpoint).map(([k, v]) => [
            k,
            Number((v / 100).toFixed(4)),
          ])
        ),
        dailyTrend: dailyCosts,
      },

      // ── Bot Quality ──
      botQuality: {
        positiveFeedback,
        negativeFeedback,
        totalFeedback,
        qualityScore: botQualityScore !== null ? Number(botQualityScore.toFixed(1)) : null,
        recentNegative: recentNegativeFeedback.map((m) => ({
          id: m.id,
          content: m.content.slice(0, 200),
          conversationId: m.conversationId,
          conversationTitle: m.conversationTitle,
          userEmail: m.userEmail,
          createdAt: m.createdAt.toISOString(),
        })),
      },

      // ── Marketing Funnel ──
      marketing: {
        totalLeads,
        leadsBySource: leadsBySource.map((s) => ({
          source: s.source,
          count: s._count.id,
        })),
        convertedLeads: convertedUsers.length,
        conversionRate: Number(leadConversionRate.toFixed(1)),
      },

      // ── Trends ──
      trends: {
        dailySignups: dailySignupTrend,
        dailyMessages: dailyMessageTrend,
        dailyCosts,
      },

      // ── Users ──
      recentUsers: recentUsers.map((u) => ({
        email: u.email,
        name: u.name,
        state: u.state,
        createdAt: u.createdAt.toISOString(),
        conversations: u._count.conversations,
        documents: u._count.documents,
      })),

      // ── System ──
      system: {
        database: dbHealthCheck,
        environment: process.env.NODE_ENV ?? "development",
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
      },

      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("CEO metrics error:", error);
    return NextResponse.json(
      { error: "Failed to load CEO metrics" },
      { status: 500 }
    );
  }
}
