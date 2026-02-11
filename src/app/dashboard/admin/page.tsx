"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, FileText, MessageSquare, Shield, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AdminMetricsResponse = {
  totals: {
    users: number;
    conversations: number;
    messages: number;
    documents: number;
    documentChunks: number;
    knowledgeBaseEntries: number;
  };
  newUsers: {
    last7Days: number;
    last30Days: number;
  };
  averages: {
    messagesPerConversation: number;
  };
  mostActiveUsers: Array<{
    email: string;
    count: number;
  }>;
  recentUsers: Array<{
    email: string;
    state: string | null;
    createdAt: string;
  }>;
};

type AdminSystemResponse = {
  database: {
    status: "connected" | "disconnected";
  };
  prismaClientVersion: string;
  nodeVersion: string;
  uptimeSeconds: number;
  environment: string;
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetricsResponse | null>(null);
  const [system, setSystem] = useState<AdminSystemResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [metricsResponse, systemResponse] = await Promise.all([
          fetch("/api/admin/metrics", { cache: "no-store" }),
          fetch("/api/admin/system", { cache: "no-store" }),
        ]);

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData);
        }

        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          setSystem(systemData);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadAdminData();
  }, []);

  const statCards = useMemo(() => {
    if (!metrics) {
      return [];
    }

    return [
      {
        title: "Total Users",
        value: metrics.totals.users,
        icon: Users,
        note: "All registered users",
      },
      {
        title: "New Users (7d)",
        value: metrics.newUsers.last7Days,
        icon: Shield,
        note: `30d: ${metrics.newUsers.last30Days}`,
      },
      {
        title: "Conversations",
        value: metrics.totals.conversations,
        icon: MessageSquare,
        note: `Avg messages: ${metrics.averages.messagesPerConversation}`,
      },
      {
        title: "Messages",
        value: metrics.totals.messages,
        icon: Activity,
        note: "Across all conversations",
      },
      {
        title: "Documents",
        value: metrics.totals.documents,
        icon: FileText,
        note: `Chunks: ${metrics.totals.documentChunks}`,
      },
    ];
  }, [metrics]);

  if (loading) {
    return (
      <div className="h-full p-6 flex items-center justify-center text-sm text-muted-foreground">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6 pb-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor user activity, engagement metrics, and system health.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card) => (
            <Card key={card.title} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-semibold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.note}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <card.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recent Users
              </h2>
              <Badge variant="secondary">Last 10</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 font-medium">Email</th>
                    <th className="py-2 font-medium">State</th>
                    <th className="py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.recentUsers?.map((user) => (
                    <tr key={`${user.email}-${user.createdAt}`} className="border-b last:border-0">
                      <td className="py-2 text-xs sm:text-sm">{user.email}</td>
                      <td className="py-2">{user.state || "—"}</td>
                      <td className="py-2">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              System Health
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Database</span>
                <Badge
                  variant={system?.database.status === "connected" ? "default" : "destructive"}
                  className="capitalize"
                >
                  {system?.database.status || "unknown"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Environment</span>
                <Badge variant="secondary">{system?.environment || "unknown"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Uptime</span>
                <span className="font-medium">
                  {system ? formatUptime(system.uptimeSeconds) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Node.js</span>
                <span className="font-medium">{system?.nodeVersion || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Prisma</span>
                <span className="font-medium">{system?.prismaClientVersion || "—"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
