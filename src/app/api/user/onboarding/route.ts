import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, zipCode, state } = await request.json();

    if (!zipCode || !state) {
      return NextResponse.json(
        { error: "Zip code and state are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        zipCode,
        state,
        onboarded: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      zipCode: user.zipCode,
      state: user.state,
      onboarded: user.onboarded,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
