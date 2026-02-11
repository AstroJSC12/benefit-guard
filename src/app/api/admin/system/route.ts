import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

    let databaseStatus: "connected" | "disconnected" = "connected";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      console.error("Database health check failed:", error);
      databaseStatus = "disconnected";
    }

    return NextResponse.json({
      database: {
        status: databaseStatus,
      },
      prismaClientVersion: Prisma.prismaVersion.client,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV ?? "development",
    });
  } catch (error) {
    console.error("Admin system error:", error);
    return NextResponse.json(
      { error: "Failed to load system information" },
      { status: 500 }
    );
  }
}
