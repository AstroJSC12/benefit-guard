import { NextResponse } from "next/server";

// Temporary diagnostic endpoint — tests each step of the document processing pipeline
// DELETE THIS after debugging is complete
export async function GET() {
  const results: Record<string, string> = {};

  // Step 1: Can we import pdf-parse?
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseModule = require("pdf-parse");
    results["1_require_pdf_parse"] = `OK - type: ${typeof pdfParseModule}, keys: ${Object.keys(pdfParseModule).join(", ")}`;
  } catch (e: unknown) {
    results["1_require_pdf_parse"] = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Step 2: Can we import the documents module?
  try {
    const docs = await import("@/lib/documents");
    results["2_import_documents"] = `OK - exports: ${Object.keys(docs).join(", ")}`;
  } catch (e: unknown) {
    results["2_import_documents"] = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Step 3: Can we call OpenAI?
  try {
    const { generateEmbeddings } = await import("@/lib/openai");
    const embeddings = await generateEmbeddings(["test"]);
    results["3_openai_embeddings"] = `OK - dimensions: ${embeddings[0]?.length}`;
  } catch (e: unknown) {
    results["3_openai_embeddings"] = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Step 4: Can we connect to DB?
  try {
    const { default: prisma } = await import("@/lib/db");
    const count = await prisma.document.count();
    results["4_db_connection"] = `OK - ${count} documents`;
  } catch (e: unknown) {
    results["4_db_connection"] = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Step 5: Check environment
  results["5_env_check"] = JSON.stringify({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasDB: !!process.env.DATABASE_URL,
    nodeVersion: process.version,
  });

  return NextResponse.json(results, { 
    headers: { "Cache-Control": "no-store" } 
  });
}
