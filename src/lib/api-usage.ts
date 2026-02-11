const MODEL_COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.005, output: 0.015 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "whisper-1": { input: 0, output: 0.006 },
};

export type EstimateCostInput = {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
};

export function estimateCost({ model, inputTokens = 0, outputTokens = 0 }: EstimateCostInput): number {
  const pricing = MODEL_COST_PER_1K_TOKENS[model];
  if (!pricing) return 0;

  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;

  return Number((inputCost + outputCost).toFixed(8));
}

export const MODEL_PRICING = MODEL_COST_PER_1K_TOKENS;
