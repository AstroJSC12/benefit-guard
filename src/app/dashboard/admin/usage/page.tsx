"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, Zap, Clock, BarChart3, AlertTriangle } from "lucide-react";

type UsageData = {
  range: string;
  totalCostDollars: string;
  totalCostCents: number;
  totalTokens: number;
  callCount: number;
  byEndpoint: Record<string, { costCents: number; tokens: number; calls: number }>;
  byModel: Record<string, { costCents: number; tokens: number; calls: number }>;
  dailyBreakdown: { date: string; costCents: number; costDollars: string; calls: number }[];
};

const RANGES = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  alert,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        alert
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
        <Icon className={`w-4 h-4 ${alert ? "text-destructive" : ""}`} />
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${alert ? "text-destructive" : ""}`}>{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  );
}

export default function UsageDashboard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/usage?range=${range}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access denied. Admin privileges required.");
        throw new Error("Failed to fetch usage data");
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dailyAlertThreshold = Number(process.env.NEXT_PUBLIC_OPENAI_DAILY_ALERT_THRESHOLD_CENTS || "200") / 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OpenAI Usage & Costs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor API spending across all endpoints
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                range === r.value
                  ? "bg-background text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-4 w-20 bg-muted rounded mb-3" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Total Cost"
              value={`$${data.totalCostDollars}`}
              subtitle={`${data.callCount} API calls`}
            />
            <StatCard
              icon={Zap}
              label="Total Tokens"
              value={formatTokens(data.totalTokens)}
              subtitle={`${formatTokens(Math.round(data.totalTokens / Math.max(data.callCount, 1)))} avg per call`}
            />
            <StatCard
              icon={Clock}
              label="API Calls"
              value={String(data.callCount)}
              subtitle={range === "24h" ? "today" : `over ${range}`}
            />
            <StatCard
              icon={BarChart3}
              label="Daily Budget"
              value={`$${dailyAlertThreshold.toFixed(2)}/day`}
              subtitle="alert threshold"
            />
          </div>

          {/* By Endpoint */}
          <div className="rounded-xl border border-border bg-card">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">By Endpoint</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-3 font-medium">Endpoint</th>
                    <th className="text-right p-3 font-medium">Calls</th>
                    <th className="text-right p-3 font-medium">Tokens</th>
                    <th className="text-right p-3 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.byEndpoint)
                    .sort(([, a], [, b]) => b.costCents - a.costCents)
                    .map(([endpoint, stats]) => (
                      <tr key={endpoint} className="border-b border-border/50 last:border-0">
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                endpoint === "chat"
                                  ? "bg-primary"
                                  : endpoint === "voice"
                                  ? "bg-destructive"
                                  : endpoint === "embedding"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span className="capitalize font-medium">{endpoint}</span>
                          </span>
                        </td>
                        <td className="p-3 text-right tabular-nums">{stats.calls}</td>
                        <td className="p-3 text-right tabular-nums">{formatTokens(stats.tokens)}</td>
                        <td className="p-3 text-right tabular-nums font-medium">
                          ${(stats.costCents / 100).toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  {Object.keys(data.byEndpoint).length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        No API calls recorded in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* By Model */}
          <div className="rounded-xl border border-border bg-card">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">By Model</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-3 font-medium">Model</th>
                    <th className="text-right p-3 font-medium">Calls</th>
                    <th className="text-right p-3 font-medium">Tokens</th>
                    <th className="text-right p-3 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.byModel)
                    .sort(([, a], [, b]) => b.costCents - a.costCents)
                    .map(([model, stats]) => (
                      <tr key={model} className="border-b border-border/50 last:border-0">
                        <td className="p-3 font-mono text-xs">{model}</td>
                        <td className="p-3 text-right tabular-nums">{stats.calls}</td>
                        <td className="p-3 text-right tabular-nums">{formatTokens(stats.tokens)}</td>
                        <td className="p-3 text-right tabular-nums font-medium">
                          ${(stats.costCents / 100).toFixed(4)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily breakdown */}
          {data.dailyBreakdown.length > 0 && (
            <div className="rounded-xl border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Daily Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-right p-3 font-medium">Calls</th>
                      <th className="text-right p-3 font-medium">Cost</th>
                      <th className="p-3 font-medium">Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dailyBreakdown.map((day) => {
                      const maxCost = Math.max(
                        ...data.dailyBreakdown.map((d) => d.costCents),
                        1
                      );
                      const barWidth = Math.max((day.costCents / maxCost) * 100, 2);
                      const overBudget = day.costCents / 100 > dailyAlertThreshold;

                      return (
                        <tr key={day.date} className="border-b border-border/50 last:border-0">
                          <td className="p-3 font-medium">{day.date}</td>
                          <td className="p-3 text-right tabular-nums">{day.calls}</td>
                          <td
                            className={`p-3 text-right tabular-nums font-medium ${
                              overBudget ? "text-destructive" : ""
                            }`}
                          >
                            ${day.costDollars}
                          </td>
                          <td className="p-3 w-48">
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  overBudget ? "bg-destructive" : "bg-primary"
                                }`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
