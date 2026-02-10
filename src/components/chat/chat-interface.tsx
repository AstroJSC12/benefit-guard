"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, Loader2, User, AlertCircle, RefreshCw, Shield, Paperclip, X, ImageIcon } from "lucide-react";
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
  imageUrl?: string;
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
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage("Image is too large (max 4MB). Please use a smaller screenshot.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) processImageFile(file);
        return;
      }
    }
  }, [processImageFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }, [processImageFile]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !pendingImage) || isLoading) return;

    const imageToSend = pendingImage;
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input.trim() || (imageToSend ? "[Image]" : ""),
      imageUrl: imageToSend || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingImage(null);
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
          message: userMessage.content !== "[Image]" ? userMessage.content : "",
          conversationId,
          ...(imageToSend ? { image: imageToSend } : {}),
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        throw new Error(errBody?.error || "Failed to send message");
      }

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
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Chat error message:", msg);
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.content !== ""));
      setErrorMessage(msg || "Something went wrong while processing your message. Please try again.");
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
                        <div>
                          {message.imageUrl && (
                            <div className="mb-2">
                              <img
                                src={message.imageUrl}
                                alt="Attached image"
                                className="max-w-[300px] max-h-[300px] rounded-lg border object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.imageUrl, "_blank")}
                              />
                            </div>
                          )}
                          {message.content && message.content !== "[Image]" && (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>
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
          {pendingImage && (
            <div className="mb-2 inline-flex items-start gap-1 p-2 rounded-lg border bg-background">
              <img
                src={pendingImage}
                alt="Pending upload"
                className="max-w-[120px] max-h-[80px] rounded object-contain"
              />
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                className="p-0.5 rounded-full hover:bg-muted transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={pendingImage ? "Add a message about this image, or just send it..." : "Ask about your insurance coverage, benefits, or rights..."}
                className="min-h-[60px] max-h-[200px] resize-none pr-10"
                disabled={isLoading}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 bottom-2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Attach an image (or paste one with Ctrl+V)"
                disabled={isLoading}
              >
                {pendingImage ? (
                  <ImageIcon className="w-4 h-4 text-primary" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </button>
            </div>
            <VoiceInput
              onTranscription={handleTranscription}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-[60px] w-[60px]"
              disabled={(!input.trim() && !pendingImage) || isLoading}
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
            medical advice. You can paste or attach screenshots of insurance documents.
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
