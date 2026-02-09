"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, Loader2, User, AlertCircle, RefreshCw, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SourceOverlay } from "@/components/documents/source-overlay";
import { VoiceInput } from "@/components/chat/voice-input";

interface SourceRef {
  documentId: string;
  chunkId: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface ChatInterfaceProps {
  conversationId: string;
  initialMessages?: Message[];
}

export function ChatInterface({
  conversationId,
  initialMessages = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sourceRef, setSourceRef] = useState<SourceRef | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for focus-input event (e.g. after new chat via keyboard shortcut)
  useEffect(() => {
    const handleFocusInput = () => textareaRef.current?.focus();
    window.addEventListener("bg:focus-input", handleFocusInput);
    return () => window.removeEventListener("bg:focus-input", handleFocusInput);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setErrorMessage(null);

    const assistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
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
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.content !== ""));
      // Set a user-friendly error message
      const errorMsg = error instanceof Error && error.message.includes("Failed to send")
        ? "Unable to reach BenefitGuard. Please check your connection and try again."
        : "Something went wrong while processing your message. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTranscription = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-muted/20 to-background" ref={scrollRef}>
        <div className="p-4 max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Welcome to BenefitGuard
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                I&apos;m here to help you understand your healthcare insurance.
                Ask me about your coverage, benefits, rights, or anything
                related to your health insurance.
              </p>
              <div className="max-w-md mx-auto space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
                {[
                  "What does the No Surprises Act protect me from?",
                  "How do I appeal a denied insurance claim?",
                  "What should I check on my medical bill for errors?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="block w-full text-left text-sm p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <Card className="p-4 border-destructive/50 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-sm text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Dismiss
                  </button>
                </div>
              </div>
            </Card>
          )}

          {messages.map((message) => (
            <Card
              key={message.id}
              data-role={message.role}
              className={`p-4 ${
                message.role === "assistant"
                  ? "bg-muted/50"
                  : "bg-primary/5 ml-8"
              }`}
            >
              <div className="flex gap-3">
                {message.role === "assistant" ? (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                ) : (
                  <Avatar className="w-8 h-8 flex items-center justify-center bg-background border">
                    <User className="w-4 h-4" />
                  </Avatar>
                )}
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">
                    {message.role === "assistant" ? "BenefitGuard" : "You"}
                  </p>
                  <div className="text-sm">
                    {message.content ? (
                      message.role === "assistant" ? (
                        <div className="space-y-2">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              h1: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>,
                              h2: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>,
                              h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                              code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{children}</code>,
                              a: ({ href, children }) => {
                                // Intercept source links to open overlay instead of navigating
                                const sourceMatch = href?.match(/\/dashboard\/documents\/([^/]+)\/view\?chunk=(.+)/);
                                if (sourceMatch) {
                                  return (
                                    <button
                                      onClick={() => setSourceRef({ documentId: sourceMatch[1], chunkId: sourceMatch[2] })}
                                      className="text-primary underline hover:text-primary/80 cursor-pointer inline"
                                    >
                                      {children}
                                    </button>
                                  );
                                }
                                return <a href={href} className="text-primary underline" target="_blank" rel="noopener noreferrer">{children}</a>;
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="border-t p-4 bg-muted/30">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your insurance coverage, benefits, or rights..."
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
            <VoiceInput
              onTranscription={handleTranscription}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-[60px] w-[60px]"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            BenefitGuard provides information about insurance coverage, not
            medical advice.
          </p>
        </form>
      </div>
      {sourceRef && (
        <SourceOverlay
          documentId={sourceRef.documentId}
          chunkId={sourceRef.chunkId}
          onClose={() => setSourceRef(null)}
        />
      )}
    </div>
  );
}
