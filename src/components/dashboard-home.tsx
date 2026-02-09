"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  MessageSquarePlus,
  FileUp,
  MapPin,
  MessageSquare,
  FileText,
  Clock,
  Shield,
  ArrowRight,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface DashboardStats {
  user: {
    name: string | null;
    state: string | null;
    zipCode: string | null;
  };
  stats: {
    totalDocuments: number;
    processedDocuments: number;
    totalConversations: number;
  };
  documents: {
    id: string;
    fileName: string;
    fileType: string;
    status: string;
    createdAt: string;
  }[];
  recentConversations: {
    id: string;
    title: string;
    updatedAt: string;
    messageCount: number;
  }[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

const QUICK_ACTIONS = [
  {
    title: "Ask a Question",
    description: "Chat with BenefitGuard about your coverage, benefits, or rights",
    href: "/dashboard/chat",
    icon: MessageSquarePlus,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Upload Documents",
    description: "Add insurance documents for personalized guidance",
    href: "/dashboard/documents",
    icon: FileUp,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    title: "Find Providers",
    description: "Locate nearby urgent care, hospitals, and clinics",
    href: "/dashboard/providers",
    icon: MapPin,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
  },
];

export function DashboardHome() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((stats) => {
        setData(stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const firstName = data?.user?.name?.split(" ")[0] || "there";
  const greeting = getGreeting();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto pb-12 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your healthcare benefits assistant is ready to help.
          </p>
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="p-5 h-full hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Row */}
        {data && (
          <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.stats.totalConversations}</p>
                  <p className="text-xs text-muted-foreground">Conversations</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.stats.processedDocuments}</p>
                  <p className="text-xs text-muted-foreground">Documents Ready</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.user.state || "—"}</p>
                  <p className="text-xs text-muted-foreground">Coverage State</p>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Two-column layout: Recent Conversations + Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Conversations */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Recent Conversations
              </h2>
              <Link
                href="/dashboard/chat"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <Card className="divide-y">
              {data?.recentConversations && data.recentConversations.length > 0 ? (
                data.recentConversations.map((convo) => (
                  <Link
                    key={convo.id}
                    href={`/dashboard/chat/${convo.id}`}
                    className="flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors group first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {convo.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(convo.updatedAt)}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground">
                          {convo.messageCount} messages
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <Link
                    href="/dashboard/chat"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    Start your first chat
                  </Link>
                </div>
              )}
            </Card>
          </section>

          {/* Documents */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Your Documents
              </h2>
              <Link
                href="/dashboard/documents"
                className="text-xs text-primary hover:underline"
              >
                Manage
              </Link>
            </div>
            <Card className="divide-y">
              {data?.documents && data.documents.length > 0 ? (
                data.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3.5 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 text-chart-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        doc.status === "processed"
                          ? "bg-chart-2/10 text-chart-2"
                          : doc.status === "processing"
                          ? "bg-chart-4/10 text-chart-4"
                          : doc.status === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {doc.status === "processed"
                        ? "Ready"
                        : doc.status === "processing"
                        ? "Processing"
                        : doc.status === "error"
                        ? "Error"
                        : "Pending"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <FileUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                  <Link
                    href="/dashboard/documents"
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    Upload your first document
                  </Link>
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
