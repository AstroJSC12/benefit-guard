import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseRange(raw: string | null): number {
  const parsed = Number(raw ?? "7");
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
    return 7;
  }
  return parsed;
}

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  return allowlist.includes(email);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rangeDays = parseRange(searchParams.get("range"));
    const since = new Date(Date.now() - rangeDays * DAY_MS);

    const usage = await prisma.$queryRaw`
      SELECT model, SUM(tokens) as tokens, SUM(cost_cents) as cost_cents
      FROM "ApiUsage"
      WHERE "createdAt" >= ${since}
      GROUP BY model
    `;

    return NextResponse.json({ rangeDays, usage });
  } catch (error) {
    console.error("Admin usage error:", error);
    return NextResponse.json({ error: "Failed to load usage" }, { status: 500 });
  }
}

export const __testables = { parseRange, isAdminEmail };
