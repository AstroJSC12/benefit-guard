"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  FileText,
  MessageCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { classifyIntent } from "@/lib/intent-router";
import { useChatWidget } from "@/contexts/chat-widget-context";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  {
    label: "Find a doctor near me",
    icon: MapPin,
    intent: "find a doctor near me",
    gradient: "from-teal-500/10 to-teal-600/5",
    iconColor: "text-teal-600 dark:text-teal-400",
    borderHover: "hover:border-teal-500/30",
  },
  {
    label: "Help me understand my bill",
    icon: FileText,
    intent: "help me understand my bill",
    gradient: "from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-500/30",
  },
  {
    label: "Ask about my coverage",
    icon: MessageCircle,
    intent: "ask about my coverage",
    gradient: "from-violet-500/10 to-violet-600/5",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderHover: "hover:border-violet-500/30",
  },
];

export function DashboardHome() {
  const [firstName, setFirstName] = useState<string>("");
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { openChat } = useChatWidget();

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setFirstName(data?.user?.name?.split(" ")[0] || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleIntent = async (text: string) => {
    const query = text.trim();
    if (!query || isProcessing) return;

    setIsProcessing(true);
    const intent = classifyIntent(query);

    if (intent.type === "navigate") {
      router.push(intent.route);
    } else {
      // Create a new conversation and open the chat widget
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Conversation" }),
        });
        if (res.ok) {
          const conv = await res.json();
          openChat(conv.id, intent.message);
          setInput("");
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleIntent(input);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 pb-16">
      <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Greeting */}
        <div className="text-center space-y-3">
          <p className="text-lg text-muted-foreground">
            {firstName ? `${greeting}, ${firstName}` : "Welcome to BenefitGuard"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
            What can I help you with?
          </h1>
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center bg-background border-2 border-muted rounded-2xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-primary/40 transition-all duration-200">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question or describe what you need..."
              className="w-full h-14 pl-5 pr-14 bg-transparent text-base rounded-2xl outline-none placeholder:text-muted-foreground/50"
              disabled={isProcessing}
              autoFocus
            />
            {input.trim() && (
              <button
                type="submit"
                disabled={isProcessing}
                className="absolute right-3 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </form>

        {/* Quick Actions */}
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground/70">
            or choose a common request
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleIntent(action.intent)}
                disabled={isProcessing}
                className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl border bg-gradient-to-br ${action.gradient} ${action.borderHover} transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer`}
              >
                <div className="w-11 h-11 rounded-xl bg-background/80 flex items-center justify-center shadow-sm">
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <span className="text-sm font-medium text-center leading-snug">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
