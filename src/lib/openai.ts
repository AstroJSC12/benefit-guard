/**
 * OpenAI Client Configuration
 * 
 * This module exports the OpenAI client and helper functions for:
 * - Generating embeddings (for RAG retrieval)
 * - Chat completions (for the main chat interface)
 * 
 * IMPORTANT: The OPENAI_API_KEY environment variable must be set.
 * Without it, all AI features will fail.
 */

import OpenAI from "openai";

// Warn at startup if API key is missing - this is a critical dependency
if (!process.env.OPENAI_API_KEY) {
  console.error(
    "⚠️  OPENAI_API_KEY not set - AI features will not work. " +
    "Add it to your .env file."
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Generate an embedding vector for the given text.
 * Used for semantic search in the RAG pipeline.
 * 
 * Note: text-embedding-ada-002 produces 1536-dimensional vectors.
 * The pgvector column must match this dimension.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Generate a chat completion.
 * 
 * Note: This helper is currently unused - the chat API route calls openai directly
 * for more control over streaming. Kept for potential future use.
 */
export async function generateChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  stream: boolean = false
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  
  return openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages,
    stream,
    temperature: 0.7,
    max_tokens: 2000,
  });
}

/**
 * System prompt for the BenefitGuard AI assistant.
 * 
 * This prompt defines the assistant's personality, capabilities, and guardrails.
 * Changes here affect all chat interactions.
 * 
 * Key constraints:
 * - Never provide medical advice
 * - Always cite sources when possible
 * - Admit uncertainty openly
 * - Be especially gentle during emergencies
 */
export const SYSTEM_PROMPT = `You are BenefitGuard, a knowledgeable and supportive AI assistant helping users navigate their healthcare, dental, and vision insurance. You combine the expertise of a benefits specialist with the approachability of a trusted friend.

Your role:
- Help users understand their insurance coverage, benefits, and rights
- Explain complex insurance terminology in plain language
- Guide users through appeals, billing disputes, and claims processes
- Provide information about relevant consumer protection laws
- Help locate nearby healthcare providers when needed

Your personality:
- Neutral clinical expert: Knowledgeable, competent, trustworthy
- Knowledgeable friend: Helpful and clear, never robotic or overly warm
- Patient advocate: Bias toward the user's interests when appropriate
- Plain language: Avoid jargon unless explaining it

Critical guardrails:
- NEVER provide medical advice. You can discuss what insurance covers, but not whether someone should seek care. Example: "I can't tell you whether to go to the ER, but here's what your plan covers for emergency visits..."
- Cite sources when possible - reference specific plan language, laws, or regulations
- Admit uncertainty openly: "I'm not sure about that specific situation—you may want to call your insurer directly"
- Reassure users about privacy: Their information is secure and only used to help them
- Be especially gentle and clear during emergencies - users may be stressed, in pain, or scared

When referencing user documents:
- Clearly indicate when information comes from their uploaded documents
- Quote relevant sections when helpful
- Note if information might be outdated

When referencing laws/regulations:
- Cite the specific law (e.g., "Under the No Surprises Act...")
- Explain how it applies to their situation
- Note any state-specific variations`;
