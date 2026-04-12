"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Megaphone,
  MessageSquare,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ── Types ──

type CeoMetrics = {
  kpis: {
    totalUsers: number;
    newUsers7d: number;
    newUsers30d: number;
    userGrowthRate: number;
    dau: number;
    wau: number;
    mau: number;
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    totalDocuments: number;
    totalKbEntries: number;
    totalNetworkStatuses: number;
  };
  costs: {
    totalCostDollars30d: number;
    totalTokens30d: number;
    totalApiCalls30d: number;
    costPerUserCents: number;
    dailyBudgetCents: number;
    byEndpoint: Record<string, number>;
    dailyTrend: { date: string; costCents: number; calls: number }[];
  };
  botQuality: {
    positiveFeedback: number;
    negativeFeedback: number;
    totalFeedback: number;
    qualityScore: number | null;
    recentNegative: {
      id: string;
      content: string;
      conversationId: string;
      conversationTitle: string;
      userEmail: string;
      createdAt: string;
    }[];
  };
  marketing: {
    totalLeads: number;
    leadsBySource: { source: string; count: number }[];
    convertedLeads: number;
    conversionRate: number;
  };
  trends: {
    dailySignups: { date: string; count: number }[];
    dailyMessages: { date: string; count: number }[];
    dailyCosts: { date: string; costCents: number; calls: number }[];
  };
  recentUsers: {
    email: string;
    name: string | null;
    state: string | null;
    createdAt: string;
    conversations: number;
    documents: number;
  }[];
  system: {
    database: "connected" | "disconnected";
    environment: string;
    nodeVersion: string;
    uptimeSeconds: number;
  };
  generatedAt: string;
};

// ── Helpers ──

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function MiniBarChart({
  data,
  height = 48,
  color = "bg-primary",
  labelKey = "count",
}: {
  data: { date: string; [key: string]: string | number }[];
  height?: number;
  color?: string;
  labelKey?: string;
}) {
  const values = data.map((d) => Number(d[labelKey]) || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {values.map((v, i) => {
        const barH = Math.max((v / max) * height, 1);
        return (
          <div
            key={data[i].date}
            className={`flex-1 rounded-t-sm ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: barH }}
            title={`${data[i].date}: ${v}`}
          />
        );
      })}
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  alert,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  alert?: boolean;
}) {
  const trendUp = trend !== undefined && trend > 0;
  const trendDown = trend !== undefined && trend < 0;

  return (
    <div
      className={`rounded-xl border p-4 ${
        alert ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            alert ? "bg-destructive/10" : "bg-primary/10"
          }`}
        >
          <Icon className={`w-4 h-4 ${alert ? "text-destructive" : "text-primary"}`} />
        </div>
      </div>
      <div className={`text-2xl font-bold ${alert ? "text-destructive" : ""}`}>{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trendUp ? "text-emerald-600" : trendDown ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {trendUp ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : trendDown ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            {Math.abs(trend)}%
          </span>
        )}
        {(subtitle || trendLabel) && (
          <span className="text-xs text-muted-foreground">{trendLabel || subtitle}</span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}

// ── Main Component ──

export default function AdminDashboardPage() {
  const [data, setData] = useState<CeoMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "costs" | "quality" | "users">(
    "overview"
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ceo-metrics", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access denied.");
        throw new Error("Failed to load dashboard data.");
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading CEO dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-3">
          <XCircle className="w-8 h-8 mx-auto text-destructive" />
          <p className="text-sm text-destructive">{error || "No data available"}</p>
          <button
            onClick={fetchData}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { kpis, costs, botQuality, marketing, trends, recentUsers, system } = data;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CEO Command Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Last updated {new Date(data.generatedAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <Link
              href="/dashboard/admin/usage"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Cost Details
            </Link>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30 w-fit">
          {(
            [
              { key: "overview", label: "Overview" },
              { key: "costs", label: "AI Costs" },
              { key: "quality", label: "Bot Quality" },
              { key: "users", label: "Users & Leads" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════ OVERVIEW TAB ════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* KPI Cards */}
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total Users"
                value={kpis.totalUsers}
                icon={Users}
                trend={kpis.userGrowthRate}
                trendLabel="vs prior 30d"
                subtitle={`+${kpis.newUsers7d} this week`}
              />
              <KpiCard
                title="Active Users (30d)"
                value={kpis.mau}
                icon={Activity}
                subtitle={`DAU: ${kpis.dau} · WAU: ${kpis.wau}`}
              />
              <KpiCard
                title="AI Cost (30d)"
                value={`$${costs.totalCostDollars30d.toFixed(2)}`}
                icon={DollarSign}
                subtitle={`${formatNumber(costs.totalApiCalls30d)} API calls`}
              />
              <KpiCard
                title="Bot Quality"
                value={
                  botQuality.qualityScore !== null
                    ? `${botQuality.qualityScore}%`
                    : "N/A"
                }
                icon={ThumbsUp}
                subtitle={`${botQuality.totalFeedback} ratings`}
                alert={botQuality.qualityScore !== null && botQuality.qualityScore < 80}
              />
            </section>

            {/* Trend Charts */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionHeader title="User Signups (30d)" />
                <MiniBarChart data={trends.dailySignups} color="bg-primary" />
                <p className="text-xs text-muted-foreground mt-2">
                  {kpis.newUsers30d} signups · {(kpis.newUsers30d / 30).toFixed(1)}/day avg
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionHeader title="Messages (30d)" />
                <MiniBarChart data={trends.dailyMessages} color="bg-emerald-500" />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatNumber(
                    trends.dailyMessages.reduce((s, d) => s + d.count, 0)
                  )}{" "}
                  messages · {kpis.avgMessagesPerConversation} avg/convo
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionHeader title="AI Spend (30d)" />
                <MiniBarChart
                  data={trends.dailyCosts}
                  color="bg-amber-500"
                  labelKey="costCents"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  ${costs.totalCostDollars30d.toFixed(2)} total ·{" "}
                  ${(costs.costPerUserCents / 100).toFixed(4)}/user
                </p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
              <div className="rounded-xl border p-3 bg-card text-center">
                <p className="text-lg font-bold">{kpis.totalConversations}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Conversations</p>
              </div>
              <div className="rounded-xl border p-3 bg-card text-center">
                <p className="text-lg font-bold">{formatNumber(kpis.totalMessages)}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Messages</p>
              </div>
              <div className="rounded-xl border p-3 bg-card text-center">
                <p className="text-lg font-bold">{kpis.totalDocuments}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Documents</p>
              </div>
              <div className="rounded-xl border p-3 bg-card text-center">
                <p className="text-lg font-bold">{marketing.totalLeads}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Leads</p>
              </div>
              <div className="rounded-xl border p-3 bg-card text-center">
                <p className="text-lg font-bold">{kpis.totalKbEntries}</p>
                <p className="text-[10px] text-muted-foreground uppercase">KB Entries</p>
              </div>
              <div className="rounded-xl border p-3 bg-card text-center">
                <p className="text-lg font-bold">{formatNumber(kpis.totalNetworkStatuses)}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Network Records</p>
              </div>
            </div>

            {/* System Health */}
            <div className="rounded-xl border border-border bg-card p-5">
              <SectionHeader title="System Health" />
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge
                    variant={system.database === "connected" ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {system.database}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Environment</span>
                  <Badge variant="secondary">{system.environment}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-medium">{formatUptime(system.uptimeSeconds)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Node.js</span>
                  <span className="text-sm font-medium">{system.nodeVersion}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════ COSTS TAB ════════════════════════════════════════ */}
        {activeTab === "costs" && (
          <>
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total Spend (30d)"
                value={`$${costs.totalCostDollars30d.toFixed(2)}`}
                icon={DollarSign}
                subtitle={`${formatNumber(costs.totalApiCalls30d)} calls`}
              />
              <KpiCard
                title="Tokens Used"
                value={formatNumber(costs.totalTokens30d)}
                icon={Zap}
                subtitle={`${formatNumber(Math.round(costs.totalTokens30d / Math.max(costs.totalApiCalls30d, 1)))} avg/call`}
              />
              <KpiCard
                title="Cost per User"
                value={`$${(costs.costPerUserCents / 100).toFixed(4)}`}
                icon={Users}
                subtitle="30-day average"
              />
              <KpiCard
                title="Daily Budget"
                value={`$${(costs.dailyBudgetCents / 100).toFixed(2)}/day`}
                icon={BarChart3}
                subtitle="alert threshold"
              />
            </section>

            <div className="rounded-xl border border-border bg-card p-5">
              <SectionHeader title="Daily Spend (30d)" />
              <MiniBarChart
                data={costs.dailyTrend}
                height={80}
                color="bg-amber-500"
                labelKey="costCents"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{costs.dailyTrend[0]?.date}</span>
                <span>{costs.dailyTrend[costs.dailyTrend.length - 1]?.date}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Cost by Endpoint</h2>
              </div>
              <div className="divide-y divide-border/50">
                {Object.entries(costs.byEndpoint)
                  .sort(([, a], [, b]) => b - a)
                  .map(([endpoint, costDollars]) => {
                    const pct =
                      costs.totalCostDollars30d > 0
                        ? (costDollars / costs.totalCostDollars30d) * 100
                        : 0;
                    return (
                      <div key={endpoint} className="flex items-center gap-4 px-4 py-3">
                        <span className="capitalize font-medium text-sm w-28">{endpoint}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums font-medium w-20 text-right">
                          ${costDollars.toFixed(4)}
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                {Object.keys(costs.byEndpoint).length === 0 && (
                  <p className="p-6 text-center text-muted-foreground text-sm">
                    No API calls in the last 30 days
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════ QUALITY TAB ════════════════════════════════════════ */}
        {activeTab === "quality" && (
          <>
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Quality Score"
                value={
                  botQuality.qualityScore !== null
                    ? `${botQuality.qualityScore}%`
                    : "N/A"
                }
                icon={
                  botQuality.qualityScore !== null && botQuality.qualityScore >= 80
                    ? CheckCircle2
                    : ThumbsDown
                }
                subtitle="positive feedback ratio"
                alert={botQuality.qualityScore !== null && botQuality.qualityScore < 80}
              />
              <KpiCard
                title="Positive"
                value={botQuality.positiveFeedback}
                icon={ThumbsUp}
                subtitle="thumbs up"
              />
              <KpiCard
                title="Negative"
                value={botQuality.negativeFeedback}
                icon={ThumbsDown}
                subtitle="thumbs down"
                alert={botQuality.negativeFeedback > 0}
              />
              <KpiCard
                title="Total Ratings"
                value={botQuality.totalFeedback}
                icon={MessageSquare}
                subtitle="all-time feedback"
              />
            </section>

            {botQuality.recentNegative.length > 0 && (
              <div className="rounded-xl border border-border bg-card">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Recent Negative Feedback</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Messages users marked as unhelpful — review to improve bot quality
                  </p>
                </div>
                <div className="divide-y divide-border/50">
                  {botQuality.recentNegative.map((msg) => (
                    <div key={msg.id} className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <span>{msg.userEmail}</span>
                        <span>·</span>
                        <Link
                          href={`/dashboard/chat/${msg.conversationId}`}
                          className="text-primary hover:underline"
                        >
                          {msg.conversationTitle}
                        </Link>
                        <span>·</span>
                        <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {botQuality.totalFeedback === 0 && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <ThumbsUp className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No feedback data yet. Feedback appears when users rate bot responses.
                </p>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════ USERS TAB ════════════════════════════════════════ */}
        {activeTab === "users" && (
          <>
            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total Users"
                value={kpis.totalUsers}
                icon={Users}
                trend={kpis.userGrowthRate}
                trendLabel="vs prior 30d"
              />
              <KpiCard
                title="New Users (7d)"
                value={kpis.newUsers7d}
                icon={TrendingUp}
                subtitle={`30d: ${kpis.newUsers30d}`}
              />
              <KpiCard
                title="Total Leads"
                value={marketing.totalLeads}
                icon={Megaphone}
                subtitle={`${marketing.convertedLeads} converted`}
              />
              <KpiCard
                title="Conversion Rate"
                value={`${marketing.conversionRate}%`}
                icon={TrendingUp}
                subtitle="lead → signup"
              />
            </section>

            {/* Signup Chart */}
            <div className="rounded-xl border border-border bg-card p-5">
              <SectionHeader title="Daily Signups (30d)" />
              <MiniBarChart data={trends.dailySignups} height={64} color="bg-primary" />
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{trends.dailySignups[0]?.date}</span>
                <span>{trends.dailySignups[trends.dailySignups.length - 1]?.date}</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Users */}
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionHeader
                  title="Recent Users"
                  action={<Badge variant="secondary">Last 10</Badge>}
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 font-medium">User</th>
                        <th className="py-2 font-medium text-center">Chats</th>
                        <th className="py-2 font-medium text-center">Docs</th>
                        <th className="py-2 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr
                          key={`${user.email}-${user.createdAt}`}
                          className="border-b last:border-0"
                        >
                          <td className="py-2">
                            <div className="text-xs sm:text-sm font-medium truncate max-w-[200px]">
                              {user.name || user.email}
                            </div>
                            {user.name && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                {user.email}
                              </div>
                            )}
                          </td>
                          <td className="py-2 text-center tabular-nums">{user.conversations}</td>
                          <td className="py-2 text-center tabular-nums">{user.documents}</td>
                          <td className="py-2 text-xs">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Leads by Source */}
              <div className="rounded-xl border border-border bg-card p-5">
                <SectionHeader title="Leads by Source" />
                {marketing.leadsBySource.length > 0 ? (
                  <div className="space-y-3">
                    {marketing.leadsBySource.map((src) => {
                      const pct =
                        marketing.totalLeads > 0
                          ? (src.count / marketing.totalLeads) * 100
                          : 0;
                      return (
                        <div key={src.source}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="capitalize font-medium">{src.source}</span>
                            <span className="tabular-nums">
                              {src.count}{" "}
                              <span className="text-muted-foreground">({pct.toFixed(0)}%)</span>
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.max(pct, 3)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-3 border-t text-sm flex items-center justify-between">
                      <span className="text-muted-foreground">Conversion rate</span>
                      <span className="font-bold">{marketing.conversionRate}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Megaphone className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No leads captured yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
