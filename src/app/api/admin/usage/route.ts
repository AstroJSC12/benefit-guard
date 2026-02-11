import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsageSummary } from "@/lib/api-usage";
import { isAdminEmail } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    const now = new Date();
    let startDate: Date;

    switch (range) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const summary = await getUsageSummary(startDate, now);

    return NextResponse.json({
      range,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalCostDollars: (summary.totalCostCents / 100).toFixed(4),
      totalCostCents: summary.totalCostCents,
      totalTokens: summary.totalTokens,
      callCount: summary.callCount,
      byEndpoint: summary.byEndpoint,
      byModel: summary.byModel,
      dailyBreakdown: summary.dailyBreakdown.map((d) => ({
        ...d,
        costDollars: (d.costCents / 100).toFixed(4),
      })),
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
