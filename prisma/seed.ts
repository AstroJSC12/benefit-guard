import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { knowledgeBaseEntries } from "./kb-data";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

/** Convert a title to a deterministic slug ID for idempotent seeding */
function slugify(title: string): string {
  return "kb_" + title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 80);
}

async function main() {
  console.log(`\n🔄 Knowledge Base Seed — ${knowledgeBaseEntries.length} entries\n`);

  // Clear existing KB entries for a clean, idempotent seed
  const deleted = await prisma.$executeRaw`DELETE FROM "KnowledgeBase"`;
  console.log(`🗑  Cleared ${deleted} existing KB entries\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < knowledgeBaseEntries.length; i++) {
    const entry = knowledgeBaseEntries[i];
    const id = slugify(entry.title);
    const progress = `[${i + 1}/${knowledgeBaseEntries.length}]`;

    try {
      const embedding = await generateEmbedding(entry.content);
      const embeddingStr = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO "KnowledgeBase" (id, category, title, content, embedding, "sourceUrl", state, "lastUpdated", "createdAt")
        VALUES (
          ${id},
          ${entry.category},
          ${entry.title},
          ${entry.content},
          ${embeddingStr}::vector,
          ${entry.sourceUrl},
          ${entry.state},
          NOW(),
          NOW()
        )
      `;

      console.log(`${progress} ✓ ${entry.category}: ${entry.title}`);
      success++;
    } catch (error) {
      console.error(`${progress} ✗ FAILED: ${entry.title}`, error);
      failed++;
    }

    // Small delay to avoid rate-limiting on the embeddings API
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Seed complete: ${success} added, ${failed} failed\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
