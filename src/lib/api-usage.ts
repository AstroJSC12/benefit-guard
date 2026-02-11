/**
 * OpenAI API Usage Tracking
 *
 * Logs every OpenAI API call with token counts and estimated costs.
 * Used for cost monitoring, alerting, and the admin dashboard.
 *
 * Cost rates (as of Feb 2026):
 * - GPT-4o:                 $2.50/1M input, $10.00/1M output
 * - GPT-4-turbo-preview:    $10.00/1M input, $30.00/1M output
 * - text-embedding-ada-002: $0.10/1M tokens
 * - Whisper-1:              $0.006/minute (~$0.10/1M chars estimated)
 *
 * Costs are stored in USD cents for precision with integers.
 */

import prisma from "@/lib/db";

type Endpoint = "chat" | "embedding" | "transcription" | "voice";

// Cost per 1M tokens in USD cents
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o":                 { input: 250,   output: 1000 },
  "gpt-4-turbo-preview":    { input: 1000,  output: 3000 },
  "text-embedding-ada-002": { input: 10,    output: 0 },
  "whisper-1":              { input: 10,    output: 0 },
};

// Daily cost alert threshold in USD cents (default: $2.00 = 200 cents)
const DAILY_ALERT_THRESHOLD_CENTS = Number(
  process.env.OPENAI_DAILY_ALERT_THRESHOLD_CENTS || "200"
);

/**
 * Calculate estimated cost in USD cents.
 */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = MODEL_PRICING[model];
  if (!rates) return 0;
  const inputCost = (inputTokens / 1_000_000) * rates.input;
  const outputCost = (outputTokens / 1_000_000) * rates.output;
  return Math.round((inputCost + outputCost) * 100) / 100; // round to 2 decimal cents
}

/**
 * Log an OpenAI API usage record to the database.
 * This is fire-and-forget — errors are logged but never thrown.
 */
export async function logApiUsage(params: {
  endpoint: Endpoint;
  model: string;
  inputTokens: number;
  outputTokens?: number;
  durationMs?: number;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const outputTokens = params.outputTokens || 0;
    const totalTokens = params.inputTokens + outputTokens;
    const cost = estimateCost(params.model, params.inputTokens, outputTokens);

    await prisma.apiUsage.create({
      data: {
        endpoint: params.endpoint,
        model: params.model,
        inputTokens: params.inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost: cost,
        durationMs: params.durationMs,
        userId: params.userId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    // Check daily spending threshold (non-blocking)
    checkDailyThreshold().catch(() => {});
  } catch (error) {
    // Never let usage tracking break the actual API call
    console.error("Failed to log API usage (non-fatal):", error);
  }
}

/**
 * Check if daily spending has exceeded the alert threshold.
 * Logs a warning to console + Sentry (if configured).
 */
async function checkDailyThreshold(): Promise<void> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const result = await prisma.apiUsage.aggregate({
    where: { createdAt: { gte: todayStart } },
    _sum: { estimatedCost: true },
  });

  const todayCents = result._sum.estimatedCost || 0;

  if (todayCents > DAILY_ALERT_THRESHOLD_CENTS) {
    const todayDollars = (todayCents / 100).toFixed(2);
    const thresholdDollars = (DAILY_ALERT_THRESHOLD_CENTS / 100).toFixed(2);
    console.warn(
      `⚠️  OPENAI COST ALERT: Daily spending $${todayDollars} exceeds threshold $${thresholdDollars}`
    );
  }
}

/**
 * Get usage summary for a given time range.
 * Used by the admin dashboard API.
 */
export async function getUsageSummary(
  startDate: Date,
  endDate: Date
): Promise<{
  totalCostCents: number;
  totalTokens: number;
  callCount: number;
  byEndpoint: Record<string, { costCents: number; tokens: number; calls: number }>;
  byModel: Record<string, { costCents: number; tokens: number; calls: number }>;
  dailyBreakdown: { date: string; costCents: number; calls: number }[];
}> {
  const records = await prisma.apiUsage.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: "asc" },
  });

  let totalCostCents = 0;
  let totalTokens = 0;
  const byEndpoint: Record<string, { costCents: number; tokens: number; calls: number }> = {};
  const byModel: Record<string, { costCents: number; tokens: number; calls: number }> = {};
  const dailyMap: Record<string, { costCents: number; calls: number }> = {};

  for (const r of records) {
    totalCostCents += r.estimatedCost;
    totalTokens += r.totalTokens;

    // By endpoint
    if (!byEndpoint[r.endpoint]) {
      byEndpoint[r.endpoint] = { costCents: 0, tokens: 0, calls: 0 };
    }
    byEndpoint[r.endpoint].costCents += r.estimatedCost;
    byEndpoint[r.endpoint].tokens += r.totalTokens;
    byEndpoint[r.endpoint].calls += 1;

    // By model
    if (!byModel[r.model]) {
      byModel[r.model] = { costCents: 0, tokens: 0, calls: 0 };
    }
    byModel[r.model].costCents += r.estimatedCost;
    byModel[r.model].tokens += r.totalTokens;
    byModel[r.model].calls += 1;

    // Daily breakdown
    const dateKey = r.createdAt.toISOString().split("T")[0];
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { costCents: 0, calls: 0 };
    }
    dailyMap[dateKey].costCents += r.estimatedCost;
    dailyMap[dateKey].calls += 1;
  }

  const dailyBreakdown = Object.entries(dailyMap).map(([date, data]) => ({
    date,
    ...data,
  }));

  return {
    totalCostCents,
    totalTokens,
    callCount: records.length,
    byEndpoint,
    byModel,
    dailyBreakdown,
  };
}
