import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId, feedback } = await req.json();

  if (!messageId || !["positive", "negative", null].includes(feedback)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Verify the message belongs to a conversation owned by this user
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversation: { userId: session.user.id },
    },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { feedback },
  });

  return NextResponse.json({ success: true });
}
