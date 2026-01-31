"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    createOrGetConversation();
  }, []);

  const createOrGetConversation = async () => {
    try {
      const conversationsRes = await fetch("/api/conversations");
      if (conversationsRes.ok) {
        const conversations = await conversationsRes.json();
        if (conversations.length > 0) {
          router.push(`/dashboard/chat/${conversations[0].id}`);
          return;
        }
      }

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      });

      if (response.ok) {
        const conversation = await response.json();
        setConversationId(conversation.id);
        router.push(`/dashboard/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <MessageSquarePlus className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Start a new conversation</p>
        <Button onClick={createOrGetConversation}>New Chat</Button>
      </div>
    );
  }

  return <ChatInterface conversationId={conversationId} />;
}
