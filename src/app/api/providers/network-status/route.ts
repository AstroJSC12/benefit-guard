import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * GET /api/providers/network-status?npis=123,456&insurerId=aetna
 *
 * Batch-lookup cached network status for a list of NPIs
 * against a specific insurer. Returns a map of NPI → status.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const npis = searchParams.get("npis")?.split(",").filter(Boolean) || [];
    const insurerId = searchParams.get("insurerId") || "";

    if (npis.length === 0 || !insurerId) {
      return NextResponse.json({ statuses: {} });
    }

    const records = await prisma.networkStatus.findMany({
      where: {
        npi: { in: npis },
        insurerId,
      },
      select: {
        npi: true,
        status: true,
        source: true,
        updatedAt: true,
      },
    });

    // Build NPI → status map
    const statuses: Record<string, { status: string; source: string; updatedAt: string }> = {};
    for (const r of records) {
      statuses[r.npi] = {
        status: r.status,
        source: r.source,
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Network status lookup error:", error);
    return NextResponse.json(
      { error: "Failed to check network status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/providers/network-status
 *
 * User confirms a provider's network status after verifying
 * on their insurer's directory. Creates or updates the cached record.
 *
 * Body: { npi: string, insurerId: string, status: "in_network" | "out_of_network" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { npi, insurerId, status } = body;

    if (!npi || !insurerId || !["in_network", "out_of_network"].includes(status)) {
      return NextResponse.json(
        { error: "Missing or invalid fields: npi, insurerId, status" },
        { status: 400 }
      );
    }

    // Upsert — create if new, update if exists
    const record = await prisma.networkStatus.upsert({
      where: {
        npi_insurerId: { npi, insurerId },
      },
      update: {
        status,
        source: "user_verified",
        verifiedBy: session.user.id,
      },
      create: {
        npi,
        insurerId,
        status,
        source: "user_verified",
        verifiedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      record: {
        npi: record.npi,
        insurerId: record.insurerId,
        status: record.status,
        source: record.source,
        updatedAt: record.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Network status update error:", error);
    return NextResponse.json(
      { error: "Failed to update network status" },
      { status: 500 }
    );
  }
}
