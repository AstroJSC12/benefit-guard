/**
 * RAG (Retrieval-Augmented Generation) Pipeline
 * 
 * This module handles retrieving relevant context for chat queries by:
 * 1. Converting the user's query to an embedding vector
 * 2. Finding similar chunks via HYBRID search (vector + keyword)
 * 3. Finding relevant entries from the centralized knowledge base
 * 4. Building a context prompt to augment the LLM's response
 * 
 * Hybrid search combines pgvector cosine distance with PostgreSQL
 * keyword matching to handle SBC table documents where relevant
 * content is mixed with unrelated data in the same chunk.
 */

import prisma from "./db";
import { generateEmbedding } from "./openai";
import { RAGContext, RetrievedChunk } from "@/types";

// Number of chunks to retrieve from each source
const TOP_K_VECTOR = 8;
const TOP_K_KEYWORD = 5;
const TOP_K_KNOWLEDGE = 5;

// Minimum cosine similarity to include a chunk in context.
// Below this threshold, the content is likely irrelevant and would
// waste tokens or confuse the LLM. Range: 0-1 (1 = identical).
const MIN_SIMILARITY = 0.72;

// Map of common user terms to SBC document terminology
// Users say "therapist" but SBCs say "mental health, behavioral health"
const QUERY_EXPANSION_MAP: Record<string, string[]> = {
  therapist: ["mental health", "behavioral health", "substance abuse", "outpatient services", "counseling"],
  therapy: ["mental health", "behavioral health", "outpatient services", "counseling"],
  counseling: ["mental health", "behavioral health", "outpatient services"],
  dentist: ["dental", "oral", "teeth", "cleaning", "filling", "crown", "root canal"],
  eye: ["vision", "optical", "glasses", "contacts", "lens", "eye exam"],
  glasses: ["vision", "optical", "eyewear", "frames", "lens"],
  contacts: ["vision", "contact lens"],
  deductible: ["deductible", "out-of-pocket", "cost sharing"],
  copay: ["copay", "copayment", "cost sharing"],
  emergency: ["emergency room", "urgent care", "emergency medical"],
  hospital: ["hospital stay", "facility fee", "inpatient", "admission"],
  pregnant: ["pregnancy", "maternity", "prenatal", "childbirth", "delivery"],
  prescription: ["drug", "pharmacy", "formulary", "medication", "generic", "brand"],
  specialist: ["specialist", "referral"],
  surgery: ["surgical", "surgeon", "procedure", "operation"],
  xray: ["diagnostic test", "x-ray", "imaging", "CT", "MRI"],
  preventive: ["preventive", "wellness", "screening", "routine"],
  appeal: ["appeal", "grievance", "denied claim", "dispute"],
};

/**
 * Expand a user query into SBC-specific search terms.
 * Only returns domain-specific expansions, NOT the original query words,
 * to avoid matching every chunk on generic terms like "medical" or "benefits".
 */
function expandQueryKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const expansions: Set<string> = new Set();

  // Check each word against the expansion map
  const words = lowerQuery.split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, "");
    const mapped = QUERY_EXPANSION_MAP[clean];
    if (mapped) {
      mapped.forEach((e) => expansions.add(e));
    }
  }

  // Also check multi-word phrases in the query
  for (const [key, mapped] of Object.entries(QUERY_EXPANSION_MAP)) {
    if (lowerQuery.includes(key)) {
      mapped.forEach((e) => expansions.add(e));
    }
  }

  return Array.from(expansions);
}

/**
 * Main entry point for RAG retrieval.
 * Uses hybrid search: vector similarity + keyword matching.
 */
export async function retrieveContext(
  query: string,
  userId: string,
  userState?: string | null
): Promise<RAGContext> {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;
  const keywords = expandQueryKeywords(query);

  const [userDocuments, knowledgeBase] = await Promise.all([
    retrieveUserDocumentsHybrid(embeddingStr, keywords, userId),
    retrieveKnowledgeBase(embeddingStr, userState, TOP_K_KNOWLEDGE),
  ]);

  return { userDocuments, knowledgeBase };
}

/**
 * Hybrid retrieval: merge vector similarity results with keyword matches.
 * This ensures chunks containing exact relevant terms always appear,
 * even if their embedding similarity is diluted by surrounding content.
 */
async function retrieveUserDocumentsHybrid(
  embeddingStr: string,
  keywords: string[],
  userId: string
): Promise<RetrievedChunk[]> {
  // 1. Vector similarity search
  const vectorResults = await prisma.$queryRaw<
    { id: string; content: string; fileName: string; documentId: string; similarity: number }[]
  >`
    SELECT 
      dc.id,
      dc.content,
      d."fileName",
      d.id as "documentId",
      1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity
    FROM "DocumentChunk" dc
    JOIN "Document" d ON dc."documentId" = d.id
    WHERE d."userId" = ${userId}
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> ${embeddingStr}::vector
    LIMIT ${TOP_K_VECTOR}
  `;

  // 2. Keyword search — find chunks containing expanded query terms
  const keywordPattern = keywords.length > 0
    ? keywords.join("|")
    : "";

  let keywordResults: { id: string; content: string; fileName: string; documentId: string; similarity: number }[] = [];
  if (keywordPattern) {
    keywordResults = await prisma.$queryRaw<
      { id: string; content: string; fileName: string; documentId: string; similarity: number }[]
    >`
      SELECT 
        dc.id,
        dc.content,
        d."fileName",
        d.id as "documentId",
        1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d.id
      WHERE d."userId" = ${userId}
        AND dc.embedding IS NOT NULL
        AND LOWER(dc.content) ~* ${keywordPattern}
      ORDER BY dc.embedding <=> ${embeddingStr}::vector
      LIMIT ${TOP_K_KEYWORD}
    `;
  }

  // 3. Merge and deduplicate, preserving order (vector results first, then keyword additions)
  const seen = new Set<string>();
  const merged: RetrievedChunk[] = [];

  for (const r of vectorResults) {
    if (!seen.has(r.id) && r.similarity >= MIN_SIMILARITY) {
      seen.add(r.id);
      merged.push({
        id: r.id,
        content: r.content,
        source: `Your document: ${r.fileName}`,
        similarity: r.similarity,
        documentId: r.documentId,
      });
    }
  }

  for (const r of keywordResults) {
    if (!seen.has(r.id) && r.similarity >= MIN_SIMILARITY) {
      seen.add(r.id);
      merged.push({
        id: r.id,
        content: r.content,
        source: `Your document: ${r.fileName}`,
        similarity: r.similarity,
        documentId: r.documentId,
      });
    }
  }

  return merged;
}

async function retrieveKnowledgeBase(
  embeddingStr: string,
  userState: string | null | undefined,
  limit: number
): Promise<RetrievedChunk[]> {
  const results = await prisma.$queryRaw<
    { id: string; content: string; title: string; category: string; sourceUrl: string | null; similarity: number }[]
  >`
    SELECT 
      kb.id,
      kb.content,
      kb.title,
      kb.category,
      kb."sourceUrl",
      1 - (kb.embedding <=> ${embeddingStr}::vector) as similarity
    FROM "KnowledgeBase" kb
    WHERE kb.embedding IS NOT NULL
      AND (kb.state IS NULL OR kb.state = ${userState || ""})
    ORDER BY kb.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return results
    .filter((r) => r.similarity >= MIN_SIMILARITY)
    .map((r) => ({
      id: r.id,
      content: r.content,
      source: `${r.category}: ${r.title}`,
      similarity: r.similarity,
      sourceUrl: r.sourceUrl ?? undefined,
    }));
}

/**
 * Build the context prompt that gets injected into the system message.
 * User documents are shown first (more specific), then knowledge base (general).
 * Includes document viewer URLs so the LLM can cite specific sources with links.
 */
export function buildContextPrompt(context: RAGContext): string {
  const parts: string[] = [];

  if (context.userDocuments.length > 0) {
    parts.push("=== INFORMATION FROM USER'S DOCUMENTS ===");
    parts.push("(When citing these sources, include the [View Source] link so the user can verify.)");
    context.userDocuments.forEach((doc, i) => {
      const viewUrl = doc.documentId
        ? `/dashboard/documents/${doc.documentId}/view?chunk=${doc.id}`
        : "";
      parts.push(`[${i + 1}] Source: ${doc.source}${viewUrl ? ` [View Source](${viewUrl})` : ""}`);
      parts.push(doc.content);
      parts.push("");
    });
  }

  if (context.knowledgeBase.length > 0) {
    parts.push("=== RELEVANT LAWS & REGULATIONS ===");
    parts.push("(When citing laws or regulations, include the [Official Source](url) link so the user can verify on the government website.)");
    context.knowledgeBase.forEach((kb, i) => {
      const sourceLink = kb.sourceUrl ? ` [Official Source](${kb.sourceUrl})` : "";
      parts.push(`[${i + 1}] ${kb.source}${sourceLink}`);
      parts.push(kb.content);
      parts.push("");
    });
  }

  return parts.join("\n");
}


export const __testables = { expandQueryKeywords };
