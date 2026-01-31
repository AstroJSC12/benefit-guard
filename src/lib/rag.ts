/**
 * RAG (Retrieval-Augmented Generation) Pipeline
 * 
 * This module handles retrieving relevant context for chat queries by:
 * 1. Converting the user's query to an embedding vector
 * 2. Finding similar chunks from the user's uploaded documents
 * 3. Finding relevant entries from the centralized knowledge base
 * 4. Building a context prompt to augment the LLM's response
 * 
 * The retrieval uses pgvector's cosine distance operator (<=>).
 */

import prisma from "./db";
import { generateEmbedding } from "./openai";
import { RAGContext, RetrievedChunk } from "@/types";

// Number of chunks to retrieve from each source
// These values balance context relevance against token usage
// FUTURE: Could be made configurable or query-adaptive
const TOP_K_DOCUMENTS = 5;
const TOP_K_KNOWLEDGE = 5;

// Minimum similarity threshold - chunks below this are not useful
// Currently unused but could filter out irrelevant results
// const MIN_SIMILARITY = 0.7;

/**
 * Main entry point for RAG retrieval.
 * Fetches relevant context from both user documents and knowledge base.
 */
export async function retrieveContext(
  query: string,
  userId: string,
  userState?: string | null
): Promise<RAGContext> {
  // Generate embedding for the query - this is the expensive operation
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const [userDocuments, knowledgeBase] = await Promise.all([
    retrieveUserDocuments(embeddingStr, userId, TOP_K_DOCUMENTS),
    retrieveKnowledgeBase(embeddingStr, userState, TOP_K_KNOWLEDGE),
  ]);

  return { userDocuments, knowledgeBase };
}

async function retrieveUserDocuments(
  embeddingStr: string,
  userId: string,
  limit: number
): Promise<RetrievedChunk[]> {
  const results = await prisma.$queryRaw<
    { id: string; content: string; fileName: string; similarity: number }[]
  >`
    SELECT 
      dc.id,
      dc.content,
      d."fileName",
      1 - (dc.embedding <=> ${embeddingStr}::vector) as similarity
    FROM "DocumentChunk" dc
    JOIN "Document" d ON dc."documentId" = d.id
    WHERE d."userId" = ${userId}
      AND dc.embedding IS NOT NULL
    ORDER BY dc.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return results.map((r: { id: string; content: string; fileName: string; similarity: number }) => ({
    id: r.id,
    content: r.content,
    source: `Your document: ${r.fileName}`,
    similarity: r.similarity,
  }));
}

async function retrieveKnowledgeBase(
  embeddingStr: string,
  userState: string | null | undefined,
  limit: number
): Promise<RetrievedChunk[]> {
  const results = await prisma.$queryRaw<
    { id: string; content: string; title: string; category: string; similarity: number }[]
  >`
    SELECT 
      kb.id,
      kb.content,
      kb.title,
      kb.category,
      1 - (kb.embedding <=> ${embeddingStr}::vector) as similarity
    FROM "KnowledgeBase" kb
    WHERE kb.embedding IS NOT NULL
      AND (kb.state IS NULL OR kb.state = ${userState || ""})
    ORDER BY kb.embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return results.map((r: { id: string; content: string; title: string; category: string; similarity: number }) => ({
    id: r.id,
    content: r.content,
    source: `${r.category}: ${r.title}`,
    similarity: r.similarity,
  }));
}

/**
 * Build the context prompt that gets injected into the system message.
 * User documents are shown first (more specific), then knowledge base (general).
 */
export function buildContextPrompt(context: RAGContext): string {
  const parts: string[] = [];

  if (context.userDocuments.length > 0) {
    parts.push("=== INFORMATION FROM USER'S DOCUMENTS ===");
    context.userDocuments.forEach((doc, i) => {
      parts.push(`[${i + 1}] Source: ${doc.source}`);
      parts.push(doc.content);
      parts.push("");
    });
  }

  if (context.knowledgeBase.length > 0) {
    parts.push("=== RELEVANT LAWS & REGULATIONS ===");
    context.knowledgeBase.forEach((kb, i) => {
      parts.push(`[${i + 1}] ${kb.source}`);
      parts.push(kb.content);
      parts.push("");
    });
  }

  return parts.join("\n");
}
