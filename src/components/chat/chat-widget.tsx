"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageCircle,
  X,
  Maximize2,
  Loader2,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useChatWidget } from "@/contexts/chat-widget-context";
import ReactMarkdown from "react-markdown";

interface WidgetMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, closeChat, toggleChat, clearAutoMessage, setConversationId } =
    useChatWidget();
  const { isOpen, conversationId, autoMessage } = state;

  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoMessageSent = useRef(false);
  const prevConversationId = useRef<string | null>(null);
  const locallyCreatedId = useRef<string | null>(null);

  const isOnChatPage = pathname.startsWith("/dashboard/chat");

  // Load messages when conversation changes (from concierge or reopening widget)
  useEffect(() => {
    if (!conversationId || conversationId === prevConversationId.current) return;

    prevConversationId.current = conversationId;
    autoMessageSent.current = false;
    setMessages([]);

    // Skip server load if there's a pending autoMessage or we just created it locally
    if (!autoMessage && conversationId !== locallyCreatedId.current) {
      loadMessages(conversationId);
    }
    locallyCreatedId.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, autoMessage]);

  // Auto-send message from concierge page
  useEffect(() => {
    if (autoMessage && conversationId && !autoMessageSent.current && !isLoading && isOpen) {
      autoMessageSent.current = true;
      const msg = autoMessage;
      clearAutoMessage();
      sendMessage(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMessage, conversationId, isOpen, isLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isOnChatPage && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isOnChatPage]);

  async function loadMessages(convId: string) {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          (data.messages || []).map((m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        );
      }
    } catch (err) {
      console.error("Widget: failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    let convId = conversationId;

    // Create conversation on-the-fly if none exists
    if (!convId) {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Conversation" }),
        });
        if (!res.ok) return;
        const conv = await res.json();
        convId = conv.id;
        locallyCreatedId.current = conv.id;
        setConversationId(conv.id);
      } catch {
        return;
      }
    }

    const userMsg: WidgetMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const assistantMsg: WidgetMessage = {
      id: `temp-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, conversationId: convId }),
      });

      if (!response.ok) throw new Error("Failed to send");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setMessages((prev) =>
                  prev.map((m, i) =>
                    i === prev.length - 1 && m.role === "assistant"
                      ? { ...m, content: m.content + parsed.content }
                      : m
                  )
                );
              }
            } catch {
              // Ignore partial chunk parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Widget chat error:", error);
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleExpand() {
    if (conversationId) {
      router.push(`/dashboard/chat/${conversationId}`);
      closeChat();
    }
  }

  // Don't render on full chat pages
  if (isOnChatPage) return null;

  return (
    <>
      {/* ── Floating bubble ── */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group cursor-pointer"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {conversationId && messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-chart-5 border-2 border-background" />
          )}
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[384px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">BenefitGuard</span>
            </div>
            <div className="flex items-center gap-1">
              {conversationId && (
                <button
                  onClick={handleExpand}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  title="Open full chat"
                >
                  <Maximize2 className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={closeChat}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" ref={scrollRef}>
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center px-4">
                <div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ask me anything about your
                    <br />
                    healthcare coverage
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {message.role === "assistant" && message.content ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="my-1">{children}</p>,
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : message.content ? (
                      <p>{message.content}</p>
                    ) : (
                      <div className="flex items-center gap-1.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.15s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.3s]" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="border-t p-3 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-10 px-3.5 bg-muted/50 border rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
