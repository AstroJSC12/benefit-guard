import { NextResponse } from "next/server";

// Temporary diagnostic endpoint — tests each step of the document processing pipeline
// DELETE THIS after debugging is complete
export async function GET() {
  const results: Record<string, string> = {};

  // Step 1: Can we require pdf-parse and see its exports?
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseModule = require("pdf-parse");
    results["1_require_pdf_parse"] = `OK - keys: ${Object.keys(pdfParseModule).join(", ")}`;
  } catch (e: unknown) {
    results["1_require_pdf_parse"] = `FAIL: ${e instanceof Error ? e.stack?.slice(0, 500) : String(e)}`;
  }

  // Step 2: Can we actually parse a minimal PDF?
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse");
    // Minimal valid PDF
    const minimalPdf = Buffer.from(
      "%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
      "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n" +
      "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n" +
      "trailer<</Size 4/Root 1 0 R>>\nstartxref\n206\n%%EOF"
    );
    const pdf = new PDFParse({ verbosity: 0, data: minimalPdf });
    const result = await pdf.getText();
    results["2_parse_minimal_pdf"] = `OK - pages: ${result.pages?.length}, text length: ${(result.text || "").length}`;
  } catch (e: unknown) {
    results["2_parse_minimal_pdf"] = `FAIL: ${e instanceof Error ? e.stack?.slice(0, 500) : String(e)}`;
  }

  // Step 3: Try parsing a real document from DB
  try {
    const { default: prisma } = await import("@/lib/db");
    const doc = await prisma.document.findFirst({
      where: { status: "error" },
      select: { id: true, fileName: true, fileData: true },
    });
    if (doc && doc.fileData) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PDFParse } = require("pdf-parse");
      const pdf = new PDFParse({ verbosity: 0, data: doc.fileData });
      const result = await pdf.getText();
      const text = (result.text || result.pages?.map((p: { text: string }) => p.text).join("\n\n") || "");
      results["3_parse_real_doc"] = `OK - ${doc.fileName}: ${text.length} chars`;
    } else {
      results["3_parse_real_doc"] = "SKIP - no error documents in DB";
    }
  } catch (e: unknown) {
    results["3_parse_real_doc"] = `FAIL: ${e instanceof Error ? e.stack?.slice(0, 500) : String(e)}`;
  }

  // Step 4: Environment info
  results["4_env"] = JSON.stringify({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasDB: !!process.env.DATABASE_URL,
    nodeVersion: process.version,
    hasDOMMatrix: typeof globalThis.DOMMatrix !== "undefined",
    hasPath2D: typeof globalThis.Path2D !== "undefined",
  });

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}
