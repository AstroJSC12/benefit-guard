import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { ChatInterface } from "@/components/chat/chat-interface";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  const messages = conversation.messages.map((m: { id: string; role: string; content: string; imageUrl?: string | null; createdAt: Date }) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    imageUrl: m.imageUrl || undefined,
    createdAt: m.createdAt,
  }));

  return (
    <ChatInterface conversationId={conversation.id} initialMessages={messages} />
  );
}
