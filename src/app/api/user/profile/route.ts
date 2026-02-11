import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

const ZIP_CODE_REGEX = /^\d{5}$/;
const US_PHONE_REGEX = /^(?:\+1\s?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}$/;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        zipCode: true,
        state: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, zipCode, state, phone } = await request.json();

    if (zipCode && !ZIP_CODE_REGEX.test(zipCode)) {
      return NextResponse.json(
        { error: "Zip code must be exactly 5 digits" },
        { status: 400 }
      );
    }

    if (phone && !US_PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { error: "Phone number must be a valid US format" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: typeof name === "string" ? name.trim() || null : undefined,
        zipCode: typeof zipCode === "string" ? zipCode : undefined,
        state: typeof state === "string" ? state : undefined,
        phone: typeof phone === "string" ? phone : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        zipCode: true,
        state: true,
        phone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
