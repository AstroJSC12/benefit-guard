import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findNearbyProviders } from "@/lib/providers";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get("zipCode") || session.user.zipCode || "";
    const type = searchParams.get("type") as
      | "urgent_care"
      | "hospital"
      | "clinic"
      | undefined;

    const providers = await findNearbyProviders(zipCode, type);

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Provider search error:", error);
    return NextResponse.json(
      { error: "Failed to search providers" },
      { status: 500 }
    );
  }
}
